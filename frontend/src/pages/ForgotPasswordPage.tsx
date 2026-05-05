import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate sending reset email (UI demo – no real backend endpoint yet)
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-surface-900 to-slate-900 flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/90 to-slate-900/80" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">BonBonCar</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Quên mật khẩu?<br />Đừng lo lắng!
            </h1>
            <p className="text-white/70 text-lg">
              Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu vào email của bạn ngay lập tức.
            </p>
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
            <span className="text-xl font-bold text-white">
              Bon<span className="text-brand-400">Bon</span>Car
            </span>
          </Link>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Back to login */}
            <Link
              to="/dang-nhap"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>

            {!sent ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-1">Quên mật khẩu</h2>
                <p className="text-slate-400 text-sm mb-8">
                  Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>

                {/* Error banner */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi link đặt lại mật khẩu'
                    )}
                  </button>
                </form>

                <p className="text-center text-slate-500 text-xs mt-6">
                  Chưa có tài khoản?{' '}
                  <Link to="/dang-ky" className="text-brand-400 hover:text-brand-300 transition-colors">
                    Đăng ký ngay
                  </Link>
                </p>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Kiểm tra email!</h2>
                <p className="text-slate-400 text-sm mb-2">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến
                </p>
                <p className="text-brand-400 font-medium mb-6 break-all">{email}</p>
                <p className="text-slate-500 text-xs mb-8">
                  Không thấy email? Kiểm tra thư mục spam hoặc{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
                  >
                    gửi lại
                  </button>
                  .
                </p>
                <Link
                  to="/dang-nhap"
                  className="btn-primary w-full justify-center py-3 text-sm inline-flex"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
