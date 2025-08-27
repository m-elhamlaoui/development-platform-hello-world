import requests
import numpy as np
from sgp4.api import Satrec, SGP4_ERRORS
from sgp4.earth_gravity import wgs72
from datetime import datetime, timedelta
import collections
import logging
from typing import Dict, List, Tuple, Set, Optional
import math
from sgp4.api import jday

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration constants
CELESTRAK_URL = "https://celestrak.com/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
CLOSE_APPROACH_THRESHOLD = 300.0  # km
CRITICAL_THRESHOLD = 0.01  # km (100 meters)
HIGH_THRESHOLD = 0.1  # km (500 meters)
HISTORY_SIZE = 3  # Keep track of last 5 positions
PERSISTENCE_THRESHOLD = 3  # Number of close approaches to consider "persistent"
TIME_STEP = 300  # seconds
PREDICTION_WINDOW = 3  # hours
ALTITUDE_BUFFER = 10.0  # km (extra buffer for altitude-based screening)
EARTH_RADIUS = 6371.0  # km
POSITION_EQUALITY_THRESHOLD = 0.001  # km
MIN_REPORT_INTERVAL = 1800  # seconds (1 hour)

# List of known co-located/docked spacecraft groups
KNOWN_DOCKED_SPACECRAFT = [
    {"ISS", "ISS (ZARYA)", "ISS (NAUKA)", "SOYUZ-MS 26", "SOYUZ-MS 27", "PROGRESS-MS 29", "PROGRESS-MS 30", "CREW DRAGON 10"},
    {"CSS", "CSS (TIANHE)", "CSS (MENGTIAN)", "CSS (WENTIAN)", "SHENZHOU-19", "SHENZHOU-19 (SZ-19)", "TIANZHOU-8"},
    {"INTELSAT 901", "INTELSAT 901 (IS-901)", "MEV-1"},
    {"INTELSAT 10-02", "MEV-2"},
]

class OrbitBin:
    """Class to represent a spatial bin for orbit screening"""
    def __init__(self, min_alt, max_alt):
        self.min_altitude = min_alt
        self.max_altitude = max_alt
        self.satellites = set()

    def overlaps(self, min_alt, max_alt):
        return not (self.max_altitude + ALTITUDE_BUFFER < min_alt or
                    max_alt < self.min_altitude - ALTITUDE_BUFFER)

    def add_satellite(self, sat_name):
        self.satellites.add(sat_name)

    def get_satellites(self):
        return self.satellites

class SatelliteCollisionPredictor:
    def __init__(self, selected_satellites: List[str]):
        self.selected_satellites = set(selected_satellites)
        self.satellites = []
        self.satrecs = {}
        self.satellite_ids = {}
        self.distance_history = {}
        self.time_steps_processed = 0
        self.distance_trends = {}
        self.orbit_bins = []
        self.bin_size = 100
        self.satellite_to_bins = {}
        self.satellite_altitudes = {}
        self.satellite_pairs_to_check = set()
        self.excluded_pairs = set()
        self.last_report_time = {}
        self.docked_lookup = self._build_docked_lookup()

    def _build_docked_lookup(self) -> Dict[str, Set[str]]:
        docked_lookup = {}
        for group in KNOWN_DOCKED_SPACECRAFT:
            for sat_name in group:
                docked_lookup[sat_name] = group
        return docked_lookup

    def fetch_tle_data(self) -> bool:
        try:
            logger.info("Fetching TLE data from Celestrak...")
            response = requests.get(CELESTRAK_URL, timeout=30)
            response.raise_for_status()

            tle_data = response.text.strip().split('\n')
            seen_norad_ids = set()

            for i in range(0, len(tle_data), 3):
                if i + 2 < len(tle_data):
                    name = tle_data[i].strip()
                    if name not in self.selected_satellites:
                        continue
                    line1 = tle_data[i + 1].strip()
                    line2 = tle_data[i + 2].strip()
                    norad_id = int(line1[2:7])

                    if norad_id in seen_norad_ids:
                        logger.debug(f"Skipping duplicate satellite {name} (NORAD ID: {norad_id})")
                        continue

                    seen_norad_ids.add(norad_id)
                    self.satellite_ids[name] = norad_id
                    self.satellites.append((name, line1, line2))
                    satrec = Satrec.twoline2rv(line1, line2)
                    self.satrecs[name] = satrec

            logger.info(f"Successfully loaded {len(self.satellites)} of {len(self.selected_satellites)} selected satellites")
            self._initialize_orbit_bins()
            return True
        except Exception as e:
            logger.error(f"Error fetching TLE data: {e}")
            return False

    def _initialize_orbit_bins(self):
        logger.info("Initializing orbit bins for spatial screening...")
        max_altitude = 36000
        num_bins = max_altitude // self.bin_size + 1
        self.orbit_bins = [OrbitBin(i * self.bin_size, (i + 1) * self.bin_size)
                         for i in range(num_bins)]

        for name, _, _ in self.satellites:
            try:
                perigee, apogee = self.calculate_orbital_range(self.satrecs[name])
                self.satellite_altitudes[name] = (perigee, apogee)
                sat_bins = []
                for bin_idx, orbit_bin in enumerate(self.orbit_bins):
                    if orbit_bin.overlaps(perigee, apogee):
                        orbit_bin.add_satellite(name)
                        sat_bins.append(bin_idx)
                self.satellite_to_bins[name] = set(sat_bins)
            except Exception as e:
                logger.warning(f"Error assigning {name} to bins: {e}")
                for bin_idx, orbit_bin in enumerate(self.orbit_bins):
                    orbit_bin.add_satellite(name)
                    self.satellite_to_bins[name] = set(range(len(self.orbit_bins)))

        self._precompute_satellite_pairs()
        logger.info(f"Orbital binning complete. Created {len(self.orbit_bins)} bins.")

    def _precompute_satellite_pairs(self):
        logger.info("Pre-computing satellite pairs to check...")
        for i, (sat1_name, _, _) in enumerate(self.satellites):
            for j, (sat2_name, _, _) in enumerate(self.satellites[i+1:], i+1):
                pair_key = tuple(sorted([sat1_name, sat2_name]))
                if self.should_check_pair(sat1_name, sat2_name):
                    self.satellite_pairs_to_check.add(pair_key)
                else:
                    self.excluded_pairs.add(pair_key)

    def calculate_orbital_range(self, satrec) -> Tuple[float, float]:
        try:
            a = (satrec.a * 6378.137)
            e = satrec.ecco
            perigee = a * (1 - e)
            apogee = a * (1 + e)
            perigee_altitude = perigee - EARTH_RADIUS
            apogee_altitude = apogee - EARTH_RADIUS
            return max(0, perigee_altitude), apogee_altitude
        except Exception as e:
            logger.warning(f"Error calculating orbital range: {e}")
            return 0, 42164

    def calculate_position(self, satrec, jd, fr) -> Optional[np.ndarray]:
        try:
            error_code, position, velocity = satrec.sgp4(jd, fr)
            if error_code != 0:
                error_message = SGP4_ERRORS.get(error_code, "Unknown SGP4 error")
                logger.debug(f"SGP4 propagation error: {error_message}")
                return None
            return np.array(position)
        except Exception as e:
            logger.debug(f"Error in position calculation: {e}")
            return None

    def are_satellites_docked(self, sat1_name: str, sat2_name: str) -> bool:
        if sat1_name in self.docked_lookup and sat2_name in self.docked_lookup:
            return sat1_name in self.docked_lookup[sat2_name]
        return False

    def are_positions_suspicious(self, pos1: np.ndarray, pos2: np.ndarray) -> bool:
        distance = np.linalg.norm(pos1 - pos2)
        if distance < POSITION_EQUALITY_THRESHOLD:
            if np.array_equal(pos1, pos2):
                return True
            rel_diff = np.abs(pos1 - pos2) / (np.abs(pos1) + np.abs(pos2) + 1e-10)
            if np.all(rel_diff < 1e-6):
                return True
        return False

    def should_check_pair(self, sat1_name, sat2_name) -> bool:
        try:
            if sat1_name == sat2_name or self.satellite_ids.get(sat1_name) == self.satellite_ids.get(sat2_name):
                return False
            if self.are_satellites_docked(sat1_name, sat2_name):
                return False
            if sat1_name in self.satellite_altitudes and sat2_name in self.satellite_altitudes:
                sat1_perigee, sat1_apogee = self.satellite_altitudes[sat1_name]
                sat2_perigee, sat2_apogee = self.satellite_altitudes[sat2_name]
                if sat1_apogee + ALTITUDE_BUFFER < sat2_perigee or sat2_apogee + ALTITUDE_BUFFER < sat1_perigee:
                    return False
                return True
            sat1 = self.satrecs[sat1_name]
            sat2 = self.satrecs[sat2_name]
            sat1_perigee, sat1_apogee = self.calculate_orbital_range(sat1)
            sat2_perigee, sat2_apogee = self.calculate_orbital_range(sat2)
            self.satellite_altitudes[sat1_name] = (sat1_perigee, sat1_apogee)
            self.satellite_altitudes[sat2_name] = (sat2_perigee, sat2_apogee)
            if sat1_apogee + ALTITUDE_BUFFER < sat2_perigee or sat2_apogee + ALTITUDE_BUFFER < sat1_perigee:
                return False
            return True
        except Exception as e:
            logger.debug(f"Error in orbital screening: {e}")
            return True

    def calculate_distance(self, pos1, pos2) -> float:
        return np.linalg.norm(pos1 - pos2)

    def get_distance_trend(self, pair_key, current_distance) -> str:
        history = self.distance_history.get(pair_key, [])
        if not history:
            return "New tracking"
        previous_distance = history[-1]
        delta = current_distance - previous_distance
        if abs(delta) < 0.001:
            return "Stable distance"
        elif delta < 0:
            return "Closing"
        else:
            return "Moving apart"

    def get_danger_classification(self, current_distance, pair_key) -> Tuple[str, str]:
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
        if persistent and trend == "Closing":
            trend_desc = "Persistent and closing"
        elif persistent:
            trend_desc = "Persistent proximity"
        elif trend == "Closing":
            trend_desc = "Closing distance"
        elif trend == "Moving apart":
            trend_desc = "Moving apart"
        elif trend == "Stable distance":
            trend_desc = "Stable close proximity"
        else:
            trend_desc = "Isolated close approach"
        return danger_level, trend_desc

    def update_distance_history(self, pair_key, distance):
        if pair_key not in self.distance_history:
            self.distance_history[pair_key] = collections.deque(maxlen=HISTORY_SIZE)
        self.distance_history[pair_key].append(distance)
        trend = self.get_distance_trend(pair_key, distance)
        self.distance_trends[pair_key] = trend

    def should_report_collision_risk(self, pair_key, current_distance, current_time) -> bool:
        if current_distance < CLOSE_APPROACH_THRESHOLD:
            return True
        trend = self.distance_trends.get(pair_key)
        history = self.distance_history.get(pair_key, [])
        if len(history) > 1:
            prev_distance = history[-2]
            if prev_distance < CLOSE_APPROACH_THRESHOLD and trend == "Moving apart":
                return True
            if abs(current_distance - prev_distance) > CLOSE_APPROACH_THRESHOLD / 2:
                return True
        if pair_key in self.last_report_time:
            seconds_since_last_report = (current_time - self.last_report_time[pair_key]).total_seconds()
            if seconds_since_last_report < MIN_REPORT_INTERVAL:
                return False
        return False

    def run_prediction(self, hours: float = PREDICTION_WINDOW) -> List[Dict]:
            if len(self.satellites) != 2:
                logger.error("Expected exactly 2 satellites.")
                return []

            start_time = datetime.utcnow()
            end_time = start_time + timedelta(hours=hours)
            logger.info(f"Starting collision prediction from {start_time} to {end_time}")

            current_time = start_time
            collision_predictions = []
            pair_key = tuple(sorted([self.satellites[0][0], self.satellites[1][0]]))
            last_distance = float('inf')

            while current_time <= end_time:
                jd, fr = jday(current_time.year, current_time.month, current_time.day,
                            current_time.hour, current_time.minute, current_time.second)
                
                # Calculate positions for both satellites
                pos1 = self.calculate_position(self.satrecs[pair_key[0]], jd, fr)
                pos2 = self.calculate_position(self.satrecs[pair_key[1]], jd, fr)
                
                if pos1 is None or pos2 is None:
                    current_time += timedelta(seconds=TIME_STEP)
                    continue

                distance = self.calculate_distance(pos1, pos2)
                
                # Skip detailed checks if distance is stable and recently reported
                if (pair_key in self.last_report_time and
                    (current_time - self.last_report_time[pair_key]).total_seconds() < MIN_REPORT_INTERVAL and
                    abs(distance - last_distance) < 0.1 * CLOSE_APPROACH_THRESHOLD):
                    current_time += timedelta(seconds=TIME_STEP)
                    continue

                if distance < CLOSE_APPROACH_THRESHOLD:
                    self.update_distance_history(pair_key, distance)
                    danger_level, trend = self.get_danger_classification(distance, pair_key)
                    time_str = current_time.strftime("%Y-%m-%d %H:%M:%S")
                    collision_predictions.append({
                        "satellites": list(pair_key),
                        "time": time_str,
                        "distance_km": float(distance),
                        "position1_km": pos1.tolist(),
                        "position2_km": pos2.tolist(),
                        "danger_level": danger_level,
                        "trend": trend,
                        "distance_trend": self.get_distance_trend(pair_key, distance),
                        "distance_history_km": [float(d) for d in self.distance_history.get(pair_key, [])]
                    })
                    self.last_report_time[pair_key] = current_time

                last_distance = distance
                current_time += timedelta(seconds=TIME_STEP)
                self.time_steps_processed += 1

            logger.info(f"Prediction complete. Reported {len(collision_predictions)} potential collisions.")
            return collision_predictions



