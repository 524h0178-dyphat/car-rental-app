export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
}
