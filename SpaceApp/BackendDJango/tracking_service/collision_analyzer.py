import numpy as np
from datetime import datetime, timedelta
import collections
import logging
import json
from kafka import KafkaProducer
from typing import Dict, List, Tuple, Set, Optional
from .tle_manager import TLEManager
from .satellite_position import OrbitPropagator
from sgp4.api import Satrec, jday
from .settings import KAFKA_BOOTSTRAP_SERVERS

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration constants
CLOSE_APPROACH_THRESHOLD = 300.0  # km
CRITICAL_THRESHOLD = 0.1  # km
HIGH_THRESHOLD = 1  # km
HISTORY_SIZE = 1
PERSISTENCE_THRESHOLD = 3
TIME_STEP = 60  # seconds
PREDICTION_WINDOW = 3  # hours
ALTITUDE_BUFFER = 10.0  # km
POSITION_EQUALITY_THRESHOLD = 0.001  # km
MIN_REPORT_INTERVAL = 60  # seconds

KNOWN_DOCKED_SPACECRAFT = [
    {"ISS", "ISS (ZARYA)", "ISS (NAUKA)", "SOYUZ-MS 26", "SOYUZ-MS 27", "PROGRESS-MS 29", "PROGRESS-MS 30", "CREW DRAGON 10"},
    {"CSS", "CSS (TIANHE)", "CSS (MENGTIAN)", "CSS (WENTIAN)", "SHENZHOU-19", "SHENZHOU-19 (SZ-19)", "TIANZHOU-8"},
    {"INTELSAT 901", "INTELSAT 901 (IS-901)", "MEV-1"},
    {"INTELSAT 10-02", "MEV-2"},
]

class OrbitBin:
    def __init__(self, min_alt, max_alt):
        self.min_altitude = min_alt
        self.max_altitude = max_alt
        self.satellites = set()

    def overlaps(self, min_alt, max_alt):
        return not (self.max_altitude + ALTITUDE_BUFFER < min_alt or
                    max_alt < self.min_altitude - ALTITUDE_BUFFER)

    def add_satellite(self, sat_name):
        self.satellites.add(sat_name)

class CollisionAnalyzer:
    def __init__(self, selected_satellites: List[str]):
        self.selected_satellites = set(selected_satellites)
        self.tle_manager = TLEManager()
        self.orbit_propagator = OrbitPropagator()
        self.satellites = []
        self.satrecs = {}
        self.satellite_ids = {}
        self.distance_history = {}
        self.time_steps_processed = 0
        self.distance_trends = {}
        self.orbit_bins = []
        self.bin_size = 100  # km
        self.satellite_to_bins = {}
        self.satellite_altitudes = {}
        self.satellite_pairs_to_check = set()
        self.excluded_pairs = set()
        self.last_report_time = {}
        self.docked_lookup = self._build_docked_lookup()
        self.producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

    def _build_docked_lookup(self) -> Dict[str, Set[str]]:
        docked_lookup = {}
        for group in KNOWN_DOCKED_SPACECRAFT:
            for sat_name in group:
                docked_lookup[sat_name] = group
        return docked_lookup

    def initialize(self) -> bool:
        self.satellites = self.tle_manager.fetch_tle_data(self.selected_satellites)
        if not self.satellites:
            logger.error("Failed to fetch TLE data")
            return False

        for name, line1, line2 in self.satellites:
            self.satellite_ids[name] = int(line1[2:7])
            self.satrecs[name] = Satrec.twoline2rv(line1, line2)

        self._initialize_orbit_bins()
        return True

    def _initialize_orbit_bins(self):
        max_altitude = 36000  # km
        num_bins = max_altitude // self.bin_size + 1
        self.orbit_bins = [OrbitBin(i * self.bin_size, (i + 1) * self.bin_size)
                           for i in range(num_bins)]

        for name in self.satrecs:
            perigee, apogee = self.orbit_propagator.calculate_orbital_range(self.satrecs[name])
            self.satellite_altitudes[name] = (perigee, apogee)
            sat_bins = []
            for bin_idx, orbit_bin in enumerate(self.orbit_bins):
                if orbit_bin.overlaps(perigee, apogee):
                    orbit_bin.add_satellite(name)
                    sat_bins.append(bin_idx)
            self.satellite_to_bins[name] = set(sat_bins)

        self._precompute_satellite_pairs()
        logger.info(f"Orbital binning complete. Created {len(self.orbit_bins)} bins.")

    def _precompute_satellite_pairs(self):
        self.satellite_pairs_to_check.clear()
        self.excluded_pairs.clear()
        for i, sat1_name in enumerate(self.satrecs):
            for sat2_name in list(self.satrecs.keys())[i+1:]:
                pair_key = tuple(sorted([sat1_name, sat2_name]))
                if self.should_check_pair(sat1_name, sat2_name):
                    self.satellite_pairs_to_check.add(pair_key)
                else:
                    self.excluded_pairs.add(pair_key)
        logger.info(f"Precomputed {len(self.satellite_pairs_to_check)} pairs to check")

    def should_check_pair(self, sat1_name: str, sat2_name: str) -> bool:
        if sat1_name == sat2_name or self.satellite_ids.get(sat1_name) == self.satellite_ids.get(sat2_name):
            return False
        if self.are_satellites_docked(sat1_name, sat2_name):
            return False
        sat1_perigee, sat1_apogee = self.satellite_altitudes[sat1_name]
        sat2_perigee, sat2_apogee = self.satellite_altitudes[sat2_name]
        return not (sat1_apogee + ALTITUDE_BUFFER < sat2_perigee or sat2_apogee + ALTITUDE_BUFFER < sat1_perigee)

    def are_satellites_docked(self, sat1_name: str, sat2_name: str) -> bool:
        if sat1_name in self.docked_lookup and sat2_name in self.docked_lookup:
            return sat1_name in self.docked_lookup[sat2_name]
        return False

    def calculate_distance(self, pos1: np.ndarray, pos2: np.ndarray) -> float:
        return np.linalg.norm(pos1 - pos2)

    def get_distance_trend(self, pair_key: Tuple[str, str], current_distance: float) -> str:
        history = self.distance_history.get(pair_key, [])
        if not history:
            return "New tracking"
        previous_distance = history[-1]
        delta = current_distance - previous_distance
        if abs(delta) < POSITION_EQUALITY_THRESHOLD:
            return "Stable distance"
        return "Closing" if delta < 0 else "Moving apart"

    def get_danger_classification(self, current_distance: float, pair_key: Tuple[str, str]) -> Tuple[str, str]:
        history = self.distance_history.get(pair_key, [])
        trend = self.get_distance_trend(pair_key, current_distance)
        close_count = sum(1 for d in history if d < CLOSE_APPROACH_THRESHOLD)
        persistent = close_count >= PERSISTENCE_THRESHOLD
        if current_distance < CRITICAL_THRESHOLD or (persistent and trend == "Closing"):
            danger_level = "CRITICAL"
        elif current_distance < HIGH_THRESHOLD or persistent:
            danger_level = "HIGH"
        else:
            danger_level = "MODERATE"
        trend_desc = "Persistent and closing" if persistent and trend == "Closing" else trend
        return danger_level, trend_desc

    def update_distance_history(self, pair_key: Tuple[str, str], distance: float):
        if pair_key not in self.distance_history:
            self.distance_history[pair_key] = collections.deque(maxlen=HISTORY_SIZE)
        self.distance_history[pair_key].append(distance)
        self.distance_trends[pair_key] = self.get_distance_trend(pair_key, distance)

    def should_report_collision_risk(self, pair_key: Tuple[str, str], current_distance: float, current_time: datetime) -> bool:
        if current_distance < CLOSE_APPROACH_THRESHOLD:
            return True
        if pair_key in self.last_report_time:
            seconds_since_last_report = (current_time - self.last_report_time[pair_key]).total_seconds()
            if seconds_since_last_report < MIN_REPORT_INTERVAL:
                return False
        return False

    def run_prediction(self, hours: float = PREDICTION_WINDOW) -> List[Dict]:
        if len(self.satellites) < 2:
            logger.error("At least 2 satellites are required.")
            return []

        start_time = datetime.utcnow()+ timedelta(hours=1)
        end_time = start_time + timedelta(hours=hours)
        logger.info(f"Starting collision prediction from {start_time} to {end_time}")

        collision_predictions = []
        for pair_key in self.satellite_pairs_to_check:
            sat1_name, sat2_name = pair_key
            current_time = start_time
            last_distance = float('inf')

            while current_time <= end_time:
                jd, fr = jday(current_time.year, current_time.month, current_time.day,
                              current_time.hour, current_time.minute, current_time.second)
                
                pos1 = self.orbit_propagator.calculate_position(self.satrecs[sat1_name], jd, fr)
                pos2 = self.orbit_propagator.calculate_position(self.satrecs[sat2_name], jd, fr)
                
                if pos1 is None or pos2 is None:
                    current_time += timedelta(seconds=TIME_STEP)
                    continue

                distance = self.calculate_distance(pos1, pos2)
                
                if (pair_key in self.last_report_time and
                    (current_time - self.last_report_time[pair_key]).total_seconds() < MIN_REPORT_INTERVAL and
                    abs(distance - last_distance) < 0.1 * CLOSE_APPROACH_THRESHOLD):
                    current_time += timedelta(seconds=TIME_STEP)
                    continue

                if self.should_report_collision_risk(pair_key, distance, current_time):
                    self.update_distance_history(pair_key, distance)
                    danger_level, trend = self.get_danger_classification(distance, pair_key)
                    time_str = current_time.strftime("%Y-%m-%d %H:%M:%S")
                    prediction = {
                        "satellites": list(pair_key),
                        "time": time_str,
                        "distance_km": float(distance),
                        "position1_km": pos1.tolist(),
                        "position2_km": pos2.tolist(),
                        "danger_level": danger_level,
                        "trend": trend,
                        "distance_trend": self.get_distance_trend(pair_key, distance),
                        "distance_history_km": [float(d) for d in self.distance_history.get(pair_key, [])]
                    }
                    collision_predictions.append(prediction)
                    self.last_report_time[pair_key] = current_time
                    # Envoyer la prédiction au topic Kafka
                    try:
                        self.producer.send('collision_alerts', prediction)
                        self.producer.flush()
                        logger.info(f"Sent prediction to Kafka for pair {pair_key}")
                    except Exception as e:
                        logger.error(f"Failed to send prediction to Kafka: {e}")

                last_distance = distance
                current_time += timedelta(seconds=TIME_STEP)
                self.time_steps_processed += 1

        logger.info(f"Prediction complete. Reported {len(collision_predictions)} potential collisions.")
        return collision_predictions