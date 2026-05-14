import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/common/Layout';
import ProtectedRoute, { GuestRoute } from './ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

const HomePage          = lazy(() => import('@/pages/HomePage'));
const SearchPage        = lazy(() => import('@/pages/SearchPage'));
const CarDetailPage     = lazy(() => import('@/pages/CarDetailPage'));
const BookingPage       = lazy(() => import('@/pages/BookingPage'));
const MyBookingsPage    = lazy(() => import('@/pages/MyBookingsPage'));
const BookingDetailPage = lazy(() => import('@/pages/BookingDetailPage'));
const ProfilePage       = lazy(() => import('@/pages/ProfilePage'));
const AdminPage         = lazy(() => import('@/pages/AdminPage'));
const CarSubmissionPage = lazy(() => import('@/pages/CarSubmissionPage'));
const MyCarSubmissionsPage = lazy(() => import('@/pages/MyCarSubmissionsPage'));
const ReviewCreatePage  = lazy(() => import('@/pages/ReviewCreatePage'));
const LoginPage            = lazy(() => import('@/pages/LoginPage'));
const RegisterPage         = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage   = lazy(() => import('@/pages/ForgotPasswordPage'));
const WalletPage        = lazy(() => import('@/pages/WalletPage'));
const OwnerBookingsPage = lazy(() => import('@/pages/OwnerBookingsPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  );
}

function AuthInitializer() {
  const { initAuth } = useAuthStore();
  useEffect(() => { initAuth(); }, [initAuth]);
  return null;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Main layout ──────────────────────────────────────── */}
          <Route element={<Layout />}>
            <Route path="/"            element={<HomePage />} />
            <Route path="/tim-xe"      element={<SearchPage />} />
            <Route path="/xe/:slug"    element={<CarDetailPage />} />
            <Route path="/ky-gui-xe"   element={<CarSubmissionPage />} />

            {/* Protected (requires login AND verification) */}
            <Route element={<ProtectedRoute requireVerified />}>
              <Route path="/dat-xe/:slug"         element={<BookingPage />} />
              <Route path="/dat-xe-cua-toi"       element={<MyBookingsPage />} />
              <Route path="/dat-xe-cua-toi/:id"   element={<BookingDetailPage />} />
              <Route path="/admin"                 element={<AdminPage />} />
              <Route path="/vi-dien-tu"            element={<WalletPage />} />
              <Route path="/xe-cho-thue"           element={<OwnerBookingsPage />} />
              <Route path="/don-ky-gui"            element={<MyCarSubmissionsPage />} />
              <Route path="/viet-danh-gia/:bookingId" element={<ReviewCreatePage />} />
            </Route>

            {/* Protected (requires login only, so users can verify their account) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/tai-khoan"             element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/quen-mat-khau"    element={<ForgotPasswordPage />} />

          {/* ── Auth pages (guest only) ───────────────────────────── */}
          <Route element={<GuestRoute />}>
            <Route path="/dang-nhap"       element={<LoginPage />} />
            <Route path="/dang-ky"          element={<RegisterPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
