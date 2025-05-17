import { API_ENDPOINTS, DEFAULT_FETCH_OPTIONS } from './api-config';
import Cookies from 'js-cookie';

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