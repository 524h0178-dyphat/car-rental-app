import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  requireVerified?: boolean;
}

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Redirects to /dang-nhap and saves the current location for post-login redirect.
 */
export default function ProtectedRoute({ requireVerified = false }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  if (requireVerified && user && !user.email_verified_at && user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-20 bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Tài khoản chưa xác minh</h1>
          <p className="text-slate-500 mb-8">
            Bạn cần xác minh địa chỉ email để sử dụng các tính năng này. Vui lòng vào mục Tài khoản để hoàn tất xác minh.
          </p>
          <Link to="/tai-khoan" className="btn-primary w-full justify-center py-3">
            Đi đến Tài khoản
          </Link>
        </div>
      </div>
    );
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
