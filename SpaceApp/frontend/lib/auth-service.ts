import { API_ENDPOINTS, DEFAULT_FETCH_OPTIONS } from './api-config';
import Cookies from 'js-cookie';
import * as satellite from 'satellite.js';
import * as THREE from 'three';

export interface User {
  email: string;
  name: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  email: string;
  name: string;
}

export interface UserResponse {
  email: string;
  name: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = Cookies.get('token') || null;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      ...DEFAULT_FETCH_OPTIONS.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async signup(user: User): Promise<AuthResponse> {
    console.log('Making signup request to:', API_ENDPOINTS.signup);
    console.log('Request body:', { email: user.email, name: user.name, password: user.password });

    try {
      const response = await fetch(API_ENDPOINTS.signup, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          password: user.password
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signup failed:', errorText);
        throw new Error(`Signup failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Signup successful:', data);
      
      // Store the token
      this.setToken(data.token);
      
      // Return the auth response
      return {
        token: data.token,
        id: data.id,
        email: data.email,
        name: data.name
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        throw new Error(`Signup failed: ${error.message}`);
      }
      throw new Error('Signup failed: Network error');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('Making login request to:', API_ENDPOINTS.login);
    
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', errorText);
        throw new Error(`Login failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store the token
      this.setToken(data.token);
      
      // Return the auth response
      return {
        token: data.token,
        id: data.id,
        email: data.email,
        name: data.name
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Network error');
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(API_ENDPOINTS.logout, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await fetch(API_ENDPOINTS.me, {
      ...DEFAULT_FETCH_OPTIONS,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Not authenticated');
    }

    return response.json();
  }

  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      Cookies.set('token', token, { expires: 7 }); // Token expires in 7 days
    }
  }

  private clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      Cookies.remove('token');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService(); 

const fetchTLE = async (noradId: string) => {
  const res = await fetch(`https://celestrak.com/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=TLE`);
  const text = await res.text();
  // text will contain 3 lines: name, line1, line2
  const lines = text.trim().split('\n');
  if (lines.length >= 3) {
    return {
      name: lines[0],
      tle1: lines[1],
      tle2: lines[2],
    };
  }
  throw new Error('Invalid TLE data');
}; 

function getSatellitePosition(tle1: string, tle2: string, date: Date = new Date()) {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  if (!positionEci) return null;
  // Convert km to whatever scale you use in Three.js
  return {
    x: positionEci.x,
    y: positionEci.y,
    z: positionEci.z,
  };
} 

const calculateOrbitPoints = (satData: any, startTime: Date = new Date()) => {
  const points: THREE.Vector3[] = [];
  const scale = 2 / 6371;
  for (let i = 0; i <= 100; i++) {
    // Spread over one orbit period (e.g., 90 minutes for LEO, or use 24h as fallback)
    const time = new Date(startTime.getTime() + (i * 24 * 60 * 60 * 1000) / 100);
    const positionAndVelocity = satellite.propagate(satData.satrec, time);
    const positionEci = positionAndVelocity.position;
    if (positionEci) {
      points.push(new THREE.Vector3(
        positionEci.x * scale,
        positionEci.y * scale,
        positionEci.z * scale
      ));
    }
  }
  return points;
}; 