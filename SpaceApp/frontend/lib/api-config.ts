export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  collisions: `${API_BASE_URL}/collisions`,
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
  credentials: 'same-origin',
}; 