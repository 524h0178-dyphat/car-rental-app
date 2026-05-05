import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Redirects to /dang-nhap and saves the current location for post-login redirect.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * GuestRoute — only accessible when NOT logged in (login/register pages).
 * Redirects authenticated users to home.
 */
export function GuestRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
