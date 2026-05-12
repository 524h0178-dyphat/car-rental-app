import api from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, AuthUser } from '@/types/auth';

const TOKEN_KEY = 'skibidicar_token';

export const authService = {
  /** Persist token to localStorage */
  saveToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),

  /** Read token from localStorage */
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  /** Remove token from localStorage */
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  /** Attach token to Axios default headers */
  setAuthHeader: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  /** POST /auth/register */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },

  /** POST /auth/login */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  /** POST /auth/logout */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /** GET /auth/me */
  getMe: async (): Promise<AuthUser> => {
    const res = await api.get<{ data: AuthUser }>('/auth/me');
    return res.data.data;
  },

  /** POST /auth/forgot-password */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  /** POST /auth/verify-otp */
  verifyOtp: async (email: string, otp: string): Promise<{ message: string }> => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  /** POST /auth/reset-password */
  resetPassword: async (payload: any): Promise<{ message: string }> => {
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  },
};
