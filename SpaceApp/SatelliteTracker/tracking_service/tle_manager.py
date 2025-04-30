import requests
import logging
import json
import os
from typing import List, Tuple
from datetime import datetime, timedelta
from .settings import BASE_DIR
from urllib.parse import quote

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TLEManager:
    def __init__(self):
        self.celestrak_base_url = "https://celestrak.com/NORAD/elements/gp.php"
        self.tle_file = os.path.join(BASE_DIR, 'tle_cache.json')
        self.cache_expiry_hours = 24
        self.history_retention_hours = 24  # Keep TLEs for 24 hours

    def fetch_tle_data(self, selected_satellites: List[str]) -> List[Tuple[str, str, str]]:
        """Fetch TLE data for satellites, updating the cache with historical TLEs."""
        # Load existing cache
        cached_data = self._load_tle_from_file()
        cached_satellites = {}
        if cached_data and 'satellites' in cached_data:
            for sat in cached_data['satellites']:
                name = sat['name'].lower()
                cached_satellites[name] = sat['tles']  # List of {timestamp, line1, line2}
            logger.info(f"Loaded {len(cached_satellites)} satellites from cache")

        # Clean up old TLEs
        self._clean_old_tles(cached_satellites)

        # Identify satellites to fetch
        satellites_to_fetch = []
        result_satellites = []
        cache_valid = self._is_cache_valid(cached_data) if cached_data else False

        for name in selected_satellites:
            name_lower = name.lower()
            if name_lower in cached_satellites and cache_valid and cached_satellites[name_lower]:
                # Use the latest TLE from cache
                latest_tle = max(cached_satellites[name_lower], key=lambda x: x['timestamp'])
                result_satellites.append((name, latest_tle['line1'], latest_tle['line2']))
                logger.debug(f"Using cached TLE for {name} from {latest_tle['timestamp']}")
            else:
                satellites_to_fetch.append(name)
                logger.debug(f"Need to fetch TLE for {name}")

        # Fetch new TLEs
        if satellites_to_fetch:
            logger.info(f"Fetching TLE data from Celestrak for {len(satellites_to_fetch)} satellites...")
            for name in satellites_to_fetch:
                try:
                    encoded_name = quote(name)
                    url = f"{self.celestrak_base_url}?NAME={encoded_name}&FORMAT=tle"
                    logger.debug(f"Requesting TLE for {name} from {url}")
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()

                    tle_data = response.text.strip().split('\n')
                    if len(tle_data) < 3 or not tle_data[0].strip():
                        logger.warning(f"No TLE data found for satellite {name}")
                        continue

                    tle_name = tle_data[0].strip()
                    line1 = tle_data[1].strip()
                    line2 = tle_data[2].strip()

                    if tle_name.lower() != name.lower():
                        logger.warning(f"Received TLE for {tle_name} but expected {name}")
                        continue

                    if not self._validate_tle(line1, line2):
                        logger.warning(f"Invalid TLE for {name}: line1={line1}, line2={line2}")
                        continue

                    # Add to results and cache
                    tle_entry = (name, line1, line2)
                    result_satellites.append(tle_entry)
                    timestamp = datetime.utcnow().isoformat()
                    tle_record = {'timestamp': timestamp, 'line1': line1, 'line2': line2}
                    if name.lower() not in cached_satellites:
                        cached_satellites[name.lower()] = []
                    cached_satellites[name.lower()].append(tle_record)
                    logger.info(f"Added new TLE for {name} at {timestamp}")

                except requests.exceptions.RequestException as e:
                    logger.error(f"Error fetching TLE for {name}: {e}")
                except Exception as e:
                    logger.error(f"Unexpected error processing TLE for {name}: {e}")

        # Save updated cache
        self._save_tle_to_file(cached_satellites)
        logger.info(f"Returning {len(result_satellites)} satellites for processing")
        return result_satellites

    def _load_tle_from_file(self) -> dict | None:
        """Load TLE data from the JSON file."""
        try:
            if os.path.exists(self.tle_file):
                with open(self.tle_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading TLE file: {e}")
        return None

    def _save_tle_to_file(self, satellites: dict):
        """Save TLE data to the JSON file."""
        try:
            tle_data = {
                'timestamp': datetime.utcnow().isoformat(),
                'satellites': [
                    {'name': name, 'tles': tles}
                    for name, tles in satellites.items()
                ]
            }
            with open(self.tle_file, 'w') as f:
                json.dump(tle_data, f)
            logger.info(f"Saved TLE data to {self.tle_file}")
        except Exception as e:
            logger.error(f"Error saving TLE file: {e}")

    def _is_cache_valid(self, tle_data: dict) -> bool:
        """Check if the cache is still valid."""
        try:
            timestamp = datetime.fromisoformat(tle_data['timestamp'])
            expiry = timestamp + timedelta(hours=self.cache_expiry_hours)
            return datetime.utcnow() < expiry
        except Exception as e:
            logger.error(f"Error checking cache validity: {e}")
            return False

    def _validate_tle(self, line1: str, line2: str) -> bool:
        """Validate the format of TLE lines."""
        try:
            if len(line1) < 60 or len(line2) < 60:
                logger.error(f"TLE lines too short: line1={len(line1)}, line2={len(line2)}")
                return False
            norad_id = line1[2:7].strip()
            if not norad_id.isdigit():
                logger.error(f"Invalid NORAD ID in line1: {line1}")
                return False
            return True
        except Exception as e:
            logger.error(f"TLE validation error: {e}, line1={line1}, line2={line2}")
            return False

    def _clean_old_tles(self, satellites: dict):
        """Remove TLEs older than history_retention_hours."""
        cutoff = datetime.utcnow() - timedelta(hours=self.history_retention_hours)
        for name in satellites:
            satellites[name] = [
                tle for tle in satellites[name]
                if datetime.fromisoformat(tle['timestamp']) >= cutoff
            ]
            if not satellites[name]:
                del satellites[name]