import * as satellite from 'satellite.js';
import { Satellite } from "@/types/satellite"; // Or define the type inline if you don't have a shared type

interface TLEData {
  name: string;
  line1: string;
  line2: string;
}

interface OrbitalElements {
  inclination: number;
  raan: number;
  eccentricity: number;
  argPerigee: number;
  meanAnomaly: number;
  meanMotion: number;
  epoch: Date;
}

export async function fetchTLE(noradId: string): Promise<TLEData> {
  try {
    const res = await fetch(`https://celestrak.com/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=TLE`);
    const text = await res.text();
    const lines = text.trim().split('\n');
    
    if (lines.length >= 3) {
      // Clean up the TLE data by removing \r and extra spaces
      const cleanTLE = {
        name: lines[0].trim().replace(/\r/g, ''),
        line1: lines[1].trim().replace(/\r/g, ''),
        line2: lines[2].trim().replace(/\r/g, '')
      };
      
      // Validate TLE format
      if (!cleanTLE.line1.startsWith('1 ') || !cleanTLE.line2.startsWith('2 ')) {
        throw new Error('Invalid TLE format');
      }
      
      console.log('Cleaned TLE data:', cleanTLE);
      return cleanTLE;
    }
    throw new Error('Invalid TLE data');
  } catch (error) {
    console.error(`Error fetching TLE for NORAD ID ${noradId}:`, error);
    throw error;
  }
}

export function parseTLE(tle: TLEData): OrbitalElements {
  try {
    console.log('Parsing TLE data:', tle);
    
    // Ensure TLE lines are properly formatted
    if (!tle.line1 || !tle.line2) {
      throw new Error('Missing TLE lines');
    }

    const line1 = tle.line1.split(/\s+/);
    const line2 = tle.line2.split(/\s+/);
    
    // Parse epoch from line 1
    const year = parseInt(line1[3].substring(0, 2));
    const dayOfYear = parseFloat(line1[3].substring(2));
    const epoch = new Date(2000 + year, 0, 1);
    epoch.setDate(epoch.getDate() + dayOfYear - 1);
    
    const elements = {
      inclination: parseFloat(line2[2]),
      raan: parseFloat(line2[3]),
      eccentricity: parseFloat('0.' + line2[4]),
      argPerigee: parseFloat(line2[5]),
      meanAnomaly: parseFloat(line2[6]),
      meanMotion: parseFloat(line2[7]),
      epoch: epoch
    };
    
    console.log('Parsed orbital elements:', elements);
    return elements;
  } catch (error) {
    console.error('Error parsing TLE:', error);
    throw error;
  }
}

export function calculateSatellitePosition(elements: OrbitalElements, time: Date): { x: number, y: number, z: number } {
  // Convert orbital elements to position
  const GM = 398600.4418; // Earth's gravitational parameter (km³/s²)
  const a = Math.pow(GM / Math.pow(elements.meanMotion * 2 * Math.PI / 86400, 2), 1/3); // Semi-major axis
  
  // Calculate time since epoch in minutes
  const timeSinceEpoch = (time.getTime() - elements.epoch.getTime()) / (1000 * 60);
  
  // Calculate mean motion in radians per minute
  const meanMotionRadPerMin = elements.meanMotion * 2 * Math.PI / 1440;
  
  // Calculate mean anomaly at current time
  const meanAnomaly = (elements.meanAnomaly * Math.PI / 180) + (meanMotionRadPerMin * timeSinceEpoch);
  
  // Solve Kepler's equation for eccentric anomaly using Newton's method
  let E = meanAnomaly;
  for (let i = 0; i < 10; i++) {
    const E_next = E - (E - elements.eccentricity * Math.sin(E) - meanAnomaly) / (1 - elements.eccentricity * Math.cos(E));
    if (Math.abs(E_next - E) < 1e-12) break;
    E = E_next;
  }
  
  // Calculate true anomaly
  const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + elements.eccentricity) / (1 - elements.eccentricity)) * Math.tan(E / 2));
  
  // Calculate radius
  const r = a * (1 - elements.eccentricity * Math.cos(E));
  
  // Convert to radians
  const i = elements.inclination * Math.PI / 180;
  const raan = elements.raan * Math.PI / 180;
  const argPerigee = elements.argPerigee * Math.PI / 180;
  
  // Calculate position in orbital plane
  const x = r * Math.cos(trueAnomaly);
  const y = r * Math.sin(trueAnomaly);
  
  // Transform to ECI coordinates
  const cosRaan = Math.cos(raan);
  const sinRaan = Math.sin(raan);
  const cosArgPerigee = Math.cos(argPerigee);
  const sinArgPerigee = Math.sin(argPerigee);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  
  // Scale positions to match Earth's size (Earth radius is 6371 km)
  const scale = 2 / 6371; // Earth radius in the scene is 2 units
  
  const position = {
    x: ((cosRaan * cosArgPerigee - sinRaan * sinArgPerigee * cosI) * x +
        (-cosRaan * sinArgPerigee - sinRaan * cosArgPerigee * cosI) * y) * scale,
    y: ((sinRaan * cosArgPerigee + cosRaan * sinArgPerigee * cosI) * x +
        (-sinRaan * sinArgPerigee + cosRaan * cosArgPerigee * cosI) * y) * scale,
    z: ((sinArgPerigee * sinI) * x + (cosArgPerigee * sinI) * y) * scale
  };
  
  console.log('Calculated satellite position:', {
    raw: { x, y, r },
    scaled: position,
    orbitalParams: {
      semiMajorAxis: a,
      trueAnomaly: trueAnomaly * 180 / Math.PI,
      meanAnomaly: meanAnomaly * 180 / Math.PI,
      eccentricity: elements.eccentricity
    }
  });
  
  return position;
}

export function calculateOrbitalTrajectory(elements: OrbitalElements, points: number = 100): { x: number, y: number, z: number }[] {
  const trajectory: { x: number, y: number, z: number }[] = [];
  const GM = 398600.4418;
  const a = Math.pow(GM / Math.pow(elements.meanMotion * 2 * Math.PI / 86400, 2), 1/3);
  
  // Convert to radians
  const i = elements.inclination * Math.PI / 180;
  const raan = elements.raan * Math.PI / 180;
  const argPerigee = elements.argPerigee * Math.PI / 180;
  
  // Scale positions to match Earth's size (Earth radius is 6371 km)
  const scale = 2 / 6371; // Earth radius in the scene is 2 units
  
  // Calculate points along the orbit
  for (let j = 0; j < points; j++) {
    const meanAnomaly = (j / points) * 2 * Math.PI;
    
    // Solve Kepler's equation for eccentric anomaly
    let E = meanAnomaly;
    for (let k = 0; k < 10; k++) {
      const E_next = E - (E - elements.eccentricity * Math.sin(E) - meanAnomaly) / (1 - elements.eccentricity * Math.cos(E));
      if (Math.abs(E_next - E) < 1e-12) break;
      E = E_next;
    }
    
    // Calculate true anomaly
    const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + elements.eccentricity) / (1 - elements.eccentricity)) * Math.tan(E / 2));
    
    // Calculate radius
    const r = a * (1 - elements.eccentricity * Math.cos(E));
    
    // Position in orbital plane
    const x = r * Math.cos(trueAnomaly);
    const y = r * Math.sin(trueAnomaly);
    
    // Transform to ECI coordinates
    const cosRaan = Math.cos(raan);
    const sinRaan = Math.sin(raan);
    const cosArgPerigee = Math.cos(argPerigee);
    const sinArgPerigee = Math.sin(argPerigee);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);
    
    trajectory.push({
      x: ((cosRaan * cosArgPerigee - sinRaan * sinArgPerigee * cosI) * x +
          (-cosRaan * sinArgPerigee - sinRaan * cosArgPerigee * cosI) * y) * scale,
      y: ((sinRaan * cosArgPerigee + cosRaan * sinArgPerigee * cosI) * x +
          (-sinRaan * sinArgPerigee + cosRaan * cosArgPerigee * cosI) * y) * scale,
      z: ((sinArgPerigee * sinI) * x + (cosArgPerigee * sinI) * y) * scale
    });
  }
  
  return trajectory;
}

function getSatellitePosition(tle1: string, tle2: string, date: Date = new Date()) {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  if (!positionEci) return null;
  // Convert km to your Three.js scale
  return {
    x: positionEci.x,
    y: positionEci.y,
    z: positionEci.z,
  };
}

export function getSatelliteRealtimeData(tle1: string, tle2: string, date: Date = new Date()) {
  try {
    console.log('Calculating satellite data with TLE:', { tle1, tle2 });
    
    // Create satellite record from TLE
    const satrec = satellite.twoline2satrec(tle1, tle2);
    console.log('Created satellite record:', satrec);
    
    // Get position and velocity in ECI coordinates
    const positionAndVelocity = satellite.propagate(satrec, date);
    console.log('Position and velocity:', positionAndVelocity);
    
    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;
    
    if (!positionEci || !velocityEci) {
      console.error('Failed to calculate position/velocity from TLE');
      return null;
    }

    // Get Greenwich Mean Sidereal Time
    const gmst = satellite.gstime(date);
    console.log('GMST:', gmst);

    // Convert ECI to geodetic coordinates (latitude, longitude, altitude)
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);
    console.log('Geodetic position:', positionGd);
    
    // Convert to degrees and calculate altitude in kilometers
    const longitude = satellite.degreesLong(positionGd.longitude);
    const latitude = satellite.degreesLat(positionGd.latitude);
    const altitude = positionGd.height; // Already in kilometers

    // Calculate velocity magnitude in km/s
    const velocity = Math.sqrt(
      velocityEci.x * velocityEci.x +
      velocityEci.y * velocityEci.y +
      velocityEci.z * velocityEci.z
    );

    // Calculate orbital period from mean motion
    const meanMotion = satrec.no; // Mean motion in radians per minute
    const period = (2 * Math.PI) / (meanMotion * 60); // Period in seconds

    const result = {
      latitude,
      longitude,
      altitude, // in kilometers
      velocity, // in km/s
      period, // in seconds
      positionEci, // ECI coordinates
      velocityEci, // ECI velocity components
    };
    
    console.log('Final calculated data:', result);
    return result;
  } catch (error) {
    console.error('Error calculating satellite data:', error);
    return null;
  }
}

export const fetchAllTLEs = async (satellites: { norad_id: number; name: string }[]) => {
  console.log('Fetching TLEs for satellites:', satellites);
  const results = await Promise.all(
    satellites.map(async (sat) => {
      try {
        const tle = await fetchTLE(sat.norad_id.toString());
        console.log(`Fetched TLE for ${sat.name} (${sat.norad_id}):`, tle);
        
        // Validate TLE data before returning
        if (tle.line1 && tle.line2) {
          return { ...sat, tle1: tle.line1, tle2: tle.line2 };
        }
        return null;
      } catch (e) {
        console.error(`Failed to fetch TLE for ${sat.name}`, e);
        return null;
      }
    })
  );
  
  // Filter out null results and log success/failure
  const validResults = results.filter(Boolean);
  console.log(`Successfully fetched TLEs for ${validResults.length} out of ${satellites.length} satellites`);
  return validResults;
}; 