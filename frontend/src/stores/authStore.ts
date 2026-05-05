import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  /** Called after login/register API success */
  setAuth: (user: AuthUser, token: string) => void;

  /** Clear auth state and token */
  clearAuth: () => void;

  /** Restore Axios header on app init (call once in main.tsx) */
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        authService.saveToken(token);
        authService.setAuthHeader(token);
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        authService.clearToken();
        authService.setAuthHeader(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      initAuth: () => {
        const { token } = get();
        if (token) authService.setAuthHeader(token);
      },
    }),
    {
      name: 'bonboncar-auth',
      // Only persist user + token (not functions)
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
