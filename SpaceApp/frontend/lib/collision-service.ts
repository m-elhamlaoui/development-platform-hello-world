import { API_ENDPOINTS, DEFAULT_FETCH_OPTIONS } from './api-config';

export interface CollisionAlert {
  id: string;
  satellites: [string, string];
  time: string;
  trend: string;
  distance_km: number;
  position1_km: [number, number, number];
  position2_km: [number, number, number];
  danger_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  distance_trend: string;
  distance_history_km: number[];
}

export interface Satellite {
  id: number;
  name: string;
  orbitType: string;
  status: string;
  lastUpdate: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface CollisionStats {
  totalCollisions: number;
  activeAlerts: number;
  dangerLevels: {
    moderate: number;
    critical: number;
    low: number;
    high: number;
  };
  recentCollisions: CollisionAlert[];
}

export interface TimelineData {
  labels: string[];
  highRisk: number[];
  mediumRisk: number[];
  lowRisk: number[];
  total: number[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    let errorDetails;
    try {
      if (contentType?.includes('application/json')) {
        errorDetails = await response.json();
      } else {
        errorDetails = await response.text();
      }
    } catch (e) {
      errorDetails = 'Could not parse error response';
    }
    
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      details: errorDetails,
      url: response.url
    });
    
    throw new ApiError(
      `API request failed: ${response.statusText} (${response.status})`,
      response.status,
      errorDetails
    );
  }

  try {
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      if (!data) {
        console.warn('Empty response received from API:', {
          url: response.url,
          status: response.status,
          contentType
        });
        throw new ApiError('Empty response received from API', response.status);
      }
      
      // Log the response data for debugging
      console.log('API Response:', {
        url: response.url,
        status: response.status,
        data
      });
      
      return data as T;
    } else {
      console.error('Invalid response content type:', {
        url: response.url,
        contentType,
        status: response.status
      });
      throw new ApiError('Invalid response content type', response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error parsing response:', {
      url: response.url,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : typeof error
    });
    throw new ApiError('Failed to parse API response', response.status);
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('Fetching URL:', url, 'with options:', {
      ...DEFAULT_FETCH_OPTIONS,
      ...options,
    });
    
    const response = await fetch(url, {
      ...DEFAULT_FETCH_OPTIONS,
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    console.error('Fetch Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : typeof error
    });
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }
}

export async function fetchCollisions(page = 1, pageSize = 10): Promise<PaginatedResponse<CollisionAlert>> {
  try {
    const url = new URL(API_ENDPOINTS.collisions);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());
    
    const response = await fetchWithTimeout(url.toString());
    const data = await handleResponse<CollisionAlert[]>(response);
    
    // Convert the array response to our paginated format
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: data.length,
      page,
      pageSize,
      hasMore: endIndex < data.length
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Connection Error:', {
        url: API_ENDPOINTS.collisions,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new ApiError('Unable to connect to the API. Please check if the server is running.');
    }
    console.error('Error fetching collision data:', error);
    throw new ApiError('An unexpected error occurred while fetching collision data.');
  }
}

export async function fetchUserCollisions(page = 1, pageSize = 10): Promise<PaginatedResponse<CollisionAlert>> {
  try {
    const url = new URL(API_ENDPOINTS.collisions);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());
    url.searchParams.append('userOnly', 'true');
    
    const response = await fetchWithTimeout(url.toString());
    const data = await handleResponse<CollisionAlert[]>(response);
    
    // Convert the array response to our paginated format
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: data.length,
      page,
      pageSize,
      hasMore: endIndex < data.length
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Connection Error:', {
        url: API_ENDPOINTS.collisions,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new ApiError('Unable to connect to the API. Please check if the server is running.');
    }
    throw error;
  }
}

export async function fetchSatellites(): Promise<Satellite[]> {
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.satellites);
    return handleResponse<Satellite[]>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Connection Error:', {
        url: API_ENDPOINTS.satellites,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new ApiError('Unable to connect to the API. Please check if the server is running.');
    }
    console.error('Error fetching satellites:', error);
    throw new ApiError('An unexpected error occurred while fetching satellites.');
  }
}

export async function fetchCollisionStats(): Promise<CollisionStats> {
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.collisionStats);
    const data = await handleResponse<CollisionStats>(response);
    
    // Validate the stats data
    if (!data || typeof data !== 'object') {
      throw new ApiError('Invalid stats data received from API');
    }
    
    // Ensure all required fields are present
    const requiredFields = ['totalCollisions', 'activeAlerts', 'dangerLevels', 'recentCollisions'] as const;
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.warn(`Missing required field: ${field}, initializing with default value`);
        if (field === 'dangerLevels') {
          data.dangerLevels = {
            moderate: 0,
            critical: 0,
            low: 0,
            high: 0
          };
        } else if (field === 'recentCollisions') {
          data.recentCollisions = [];
        } else if (field === 'totalCollisions' || field === 'activeAlerts') {
          (data as any)[field] = 0;
        }
      }
    }
    
    // Convert API response danger levels to match our interface
    const dangerLevelMap = {
      'MODERATE': 'moderate',
      'CRITICAL': 'critical',
      'LOW': 'low',
      'HIGH': 'high'
    } as const;
    
    // Validate and convert danger levels
    const requiredDangerLevels = ['moderate', 'critical', 'low', 'high'] as const;
    for (const level of requiredDangerLevels) {
      const count = data.dangerLevels[level];
      if (typeof count !== 'number' || isNaN(count) || count < 0) {
        console.warn(`Invalid danger level count for ${level}: ${count}, defaulting to 0`);
        data.dangerLevels[level] = 0;
      }
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Connection Error:', {
        url: API_ENDPOINTS.collisionStats,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new ApiError('Unable to connect to the API. Please check if the server is running.');
    }
    console.error('Error fetching collision stats:', error);
    throw new ApiError('An unexpected error occurred while fetching collision stats.');
  }
}

export async function fetchCollisionTimeline(): Promise<TimelineData> {
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.collisionTimeline);
    const data = await handleResponse<TimelineData>(response);
    
    // Validate the timeline data
    if (!data || typeof data !== 'object') {
      throw new ApiError('Invalid timeline data received from API');
    }
    
    // Ensure all required fields are present and are arrays
    const requiredFields = ['labels', 'highRisk', 'mediumRisk', 'lowRisk', 'total'];
    for (const field of requiredFields) {
      if (!Array.isArray(data[field as keyof TimelineData])) {
        throw new ApiError(`Invalid ${field} in timeline data`);
      }
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Connection Error:', {
        url: API_ENDPOINTS.collisionTimeline,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new ApiError('Unable to connect to the API. Please check if the server is running.');
    }
    console.error('Error fetching collision timeline:', error);
    throw new ApiError('An unexpected error occurred while fetching timeline data.');
  }
}

export async function fetchCollisionDetails(id: string): Promise<CollisionAlert> {
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.collisionDetails(id));
    const data = await handleResponse<CollisionAlert>(response);
    
    // Validate the collision data
    if (!data || typeof data !== 'object') {
      throw new ApiError('Invalid collision data received from API');
    }
    
    // Validate required fields
    const requiredFields = [
      'id', 'satellites', 'time', 'trend', 'distance_km',
      'position1_km', 'position2_km', 'danger_level',
      'distance_trend', 'distance_history_km'
    ] as const;
    
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new ApiError(`Missing required field: ${field}`);
      }
    }
    
    // Validate arrays
    if (!Array.isArray(data.satellites) || data.satellites.length !== 2) {
      throw new ApiError('Invalid satellites array');
    }
    if (!Array.isArray(data.position1_km) || data.position1_km.length !== 3) {
      throw new ApiError('Invalid position1_km array');
    }
    if (!Array.isArray(data.position2_km) || data.position2_km.length !== 3) {
      throw new ApiError('Invalid position2_km array');
    }
    if (!Array.isArray(data.distance_history_km)) {
      throw new ApiError('Invalid distance_history_km array');
    }
    
    // Validate danger_level
    const validDangerLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const;
    if (!validDangerLevels.includes(data.danger_level as any)) {
      throw new ApiError(`Invalid danger_level: ${data.danger_level}`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Connection Error:', {
        url: API_ENDPOINTS.collisionDetails(id),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new ApiError('Unable to connect to the API. Please check if the server is running.');
    }
    console.error('Error fetching collision details:', error);
    throw new ApiError('An unexpected error occurred while fetching collision details.');
  }
} 