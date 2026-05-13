import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const login = useLogin();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  const errorMsg = login.error?.message;

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/55 to-slate-900/35" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">SkibidiCar</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Hành trình của bạn<br />bắt đầu từ đây
            </h1>
            <p className="text-white/70 text-lg">
              Hàng trăm mẫu xe chờ bạn khám phá. Đặt xe nhanh, an toàn, tiện lợi.
            </p>
            <div className="flex gap-8 mt-10">
              {[['500+', 'Mẫu xe'], ['10K+', 'Lượt thuê'], ['98%', 'Hài lòng']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-3xl font-bold">{n}</p>
                  <p className="text-white/60 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Skibidi<span className="text-brand-600">Car</span>
            </span>
          </Link>

          <div className="bg-white border border-cyan-100 rounded-2xl p-8 shadow-card">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Chào mừng trở lại!</h2>
            <p className="text-slate-500 text-sm mb-8">
              Chưa có tài khoản?{' '}
              <Link to="/dang-ky" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Đăng ký ngay
              </Link>
            </p>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                    Mật khẩu
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <Link to="/quen-mat-khau" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={login.isPending}
                className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-500 text-xs">hoặc tiếp tục với</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Social logins (placeholder) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 hover:bg-cyan-50 transition-colors"
                onClick={() => alert('Tính năng đang phát triển')}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 hover:bg-cyan-50 transition-colors"
                onClick={() => alert('Tính năng đang phát triển')}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
