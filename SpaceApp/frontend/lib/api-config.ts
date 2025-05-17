export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  signup: `${API_BASE_URL}/auth/signup`,
  login: `${API_BASE_URL}/auth/login`,
  logout: `${API_BASE_URL}/auth/logout`,
  me: `${API_BASE_URL}/auth/me`,
  // Collision endpoints
  collisions: `${API_BASE_URL}/collisions/`,
  collisionStats: `${API_BASE_URL}/collisions/stats`,
  collisionTimeline: `${API_BASE_URL}/collisions/timeline`,
  collisionDetails: (id: string) => `${API_BASE_URL}/collisions/${id}`,
  satellites: `${API_BASE_URL}/collisions/satellites`,
} as const;

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'include',
  redirect: 'follow',
}; 