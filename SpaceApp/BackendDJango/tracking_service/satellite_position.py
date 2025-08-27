import numpy as np
from sgp4.api import Satrec, SGP4_ERRORS
from sgp4.api import jday
from datetime import datetime, timedelta
import logging
from typing import Optional, Tuple,List
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OrbitPropagator:
    def __init__(self):
        self.earth_radius = 6371.0  # km

    def calculate_position(self, satrec: Satrec, jd: float, fr: float) -> Optional[np.ndarray]:
        """Calcule la position d'un satellite à un temps donné."""
        try:
            error_code, position, velocity = satrec.sgp4(jd, fr)
            if error_code != 0:
                logger.error(f"SGP4 error: {SGP4_ERRORS.get(error_code, 'Unknown error')}")
                return None
            return np.array(position)
        except Exception as e:
            logger.error(f"Position calculation failed: {e}")
            return None

    def calculate_orbital_range(self, satrec: Satrec) -> Tuple[float, float]:
        """Calcule la plage orbitale (périgée et apogée)."""
        try:
            a = satrec.a * 6378.137
            e = satrec.ecco
            perigee = a * (1 - e) - self.earth_radius
            apogee = a * (1 + e) - self.earth_radius
            return max(0, perigee), apogee
        except Exception as e:
            logger.warning(f"Error calculating orbital range: {e}")
            return 0, 42164

    def calculate_positions_batch(self, satrecs: List[Satrec], jd: float, fr: float) -> List[Optional[np.ndarray]]:
        """Calcule les positions pour plusieurs satellites en parallèle."""
        with ThreadPoolExecutor() as executor:
            positions = list(executor.map(lambda s: self.calculate_position(s, jd, fr), satrecs))
        return positions