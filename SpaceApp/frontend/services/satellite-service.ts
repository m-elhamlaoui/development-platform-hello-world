import { Satellite } from '../types/satellite';

export async function fetchSatelliteTLE(noradId: string): Promise<string> {
  try {
    console.log(`Fetching TLE data for satellite ${noradId}...`);
    const response = await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=TLE`);
    if (!response.ok) {
      console.error(`Failed to fetch TLE data for ${noradId}. Status: ${response.status}`);
      throw new Error(`Failed to fetch TLE data: ${response.status}`);
    }
    const data = await response.text();
    if (!data || data.trim() === '') {
      console.error(`Empty TLE data received for ${noradId}`);
      throw new Error('Empty TLE data received');
    }
    console.log(`TLE data received for ${noradId}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching TLE data for ${noradId}:`, error);
    throw error;
  }
}

function parseTLE(tleData: string): { line1: string; line2: string } {
  console.log('Parsing TLE data:', tleData);
  const lines = tleData.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('Invalid TLE data');
  }
  const parsed = {
    line1: lines[0],
    line2: lines[1]
  };
  console.log('Parsed TLE lines:', parsed);
  return parsed;
}

function scaleSatelliteDistance(distance: number): number {
  // Earth radius is 2 units in our scene
  const earthRadius = 2;
  // Scale factor to keep satellites visible but not too far
  const scaleFactor = 0.15;
  // Minimum distance from Earth's surface
  const minDistance = earthRadius + 0.2;
  // Maximum distance from Earth's surface
  const maxDistance = earthRadius + 0.8;
  
  // Scale the distance to fit within our desired range
  const scaledDistance = Math.min(Math.max(distance * scaleFactor, minDistance), maxDistance);
  return scaledDistance;
}

function calculateSatellitePosition(tle: { line1: string; line2: string }, noradId: string): Satellite {
  console.log(`Calculating position for satellite ${noradId}...`);
  
  // Extract basic orbital elements from TLE
  const line2 = tle.line2;
  
  // Correct TLE parsing with proper field positions
  const inclination = parseFloat(line2.substring(8, 16)) * (Math.PI / 180);  // Inclination in degrees
  const raan = parseFloat(line2.substring(17, 25)) * (Math.PI / 180);        // Right Ascension of Ascending Node
  const eccentricity = parseFloat('0.' + line2.substring(26, 33));           // Eccentricity
  const argPerigee = parseFloat(line2.substring(34, 42)) * (Math.PI / 180);  // Argument of Perigee
  const meanAnomaly = parseFloat(line2.substring(43, 51)) * (Math.PI / 180); // Mean Anomaly
  const meanMotion = parseFloat(line2.substring(52, 63));                    // Mean Motion

  console.log('Raw TLE values:', {
    inclination: line2.substring(8, 16),
    raan: line2.substring(17, 25),
    eccentricity: line2.substring(26, 33),
    argPerigee: line2.substring(34, 42),
    meanAnomaly: line2.substring(43, 51),
    meanMotion: line2.substring(52, 63)
  });

  console.log('Parsed orbital elements:', {
    inclination: inclination * (180 / Math.PI),
    raan: raan * (180 / Math.PI),
    eccentricity,
    argPerigee: argPerigee * (180 / Math.PI),
    meanAnomaly: meanAnomaly * (180 / Math.PI),
    meanMotion
  });

  // Calculate semi-major axis from mean motion
  const mu = 398600.4418; // Earth's gravitational parameter (km³/s²)
  const n = meanMotion * 2 * Math.PI / 86400; // Convert to radians per second
  const a = Math.pow(mu / (n * n), 1/3);

  // Calculate current position
  const time = new Date();
  const gmst = calculateGMST(time);
  const trueAnomaly = calculateTrueAnomaly(meanAnomaly, eccentricity);
  
  // Calculate position in orbital plane
  const r = a * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
  const x = r * Math.cos(trueAnomaly);
  const y = r * Math.sin(trueAnomaly);
  const z = 0;

  // Transform to ECI coordinates using proper rotation matrices
  const cosRAAN = Math.cos(raan);
  const sinRAAN = Math.sin(raan);
  const cosArgP = Math.cos(argPerigee);
  const sinArgP = Math.sin(argPerigee);
  const cosInc = Math.cos(inclination);
  const sinInc = Math.sin(inclination);

  // First rotation: around Z axis by RAAN
  const x1 = x * cosRAAN - y * sinRAAN;
  const y1 = x * sinRAAN + y * cosRAAN;
  const z1 = z;

  // Second rotation: around X axis by inclination
  const x2 = x1;
  const y2 = y1 * cosInc - z1 * sinInc;
  const z2 = y1 * sinInc + z1 * cosInc;

  // Third rotation: around Z axis by argument of perigee
  const xECI = x2 * cosArgP - y2 * sinArgP;
  const yECI = x2 * sinArgP + y2 * cosArgP;
  const zECI = z2;

  // Calculate the distance from Earth's center
  const distance = Math.sqrt(xECI * xECI + yECI * yECI + zECI * zECI);
  
  // Scale the distance to keep satellites visible
  const scaledDistance = scaleSatelliteDistance(distance);
  
  // Normalize the position vector and scale it to the desired distance
  const scale = scaledDistance / distance;
  
  return {
    id: noradId,
    name: `Satellite ${noradId}`,
    position: {
      x: xECI * scale,
      y: yECI * scale,
      z: zECI * scale
    },
    noradId: noradId,
    orbitType: 'Low Earth Orbit',
    color: 0x3b82f6
  };
}

function calculateGMST(date: Date): number {
  const JD = (date.getTime() / 86400000) + 2440587.5;
  const T = (JD - 2451545.0) / 36525;
  const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + T * T * (0.000387933 - T / 38710000);
  return (GMST % 360) * (Math.PI / 180);
}

function calculateTrueAnomaly(meanAnomaly: number, eccentricity: number): number {
  let E = meanAnomaly;
  let delta = 1;
  const tolerance = 1e-10;
  
  while (Math.abs(delta) > tolerance) {
    delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= delta;
  }
  
  return 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(E / 2));
}

export async function getSatellitePosition(noradId: string): Promise<Satellite> {
  const tleData = await fetchSatelliteTLE(noradId);
  const tle = parseTLE(tleData);
  return calculateSatellitePosition(tle, noradId);
} 