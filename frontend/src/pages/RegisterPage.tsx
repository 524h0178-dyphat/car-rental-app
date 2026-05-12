import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Eye, EyeOff, Loader2, Mail, Lock, User, Phone, AlertCircle, Check } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';

const PASSWORD_RULES = [
  { label: 'Ít nhất 8 ký tự',          test: (p: string) => p.length >= 8 },
  { label: 'Có chữ hoa',               test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Có chữ số',                test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const register = useRegister();

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    password: '', password_confirmation: '',
  });
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(form);
  };

  const errorMsg = register.error?.message;

  // Parse Laravel validation errors (often returned as "field: message" or plain message)
  const parseErrors = (msg: string | undefined): string => {
    if (!msg) return '';
    // Laravel returns JSON error string sometimes
    try {
      const parsed = JSON.parse(msg);
      if (typeof parsed === 'object') {
        return Object.values(parsed).flat().join(' ');
      }
    } catch (_) { /* not JSON */ }
    return msg;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-surface-900 to-slate-900 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-brand-700/70" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">SkibidiCar</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Tham gia cộng đồng<br />SkibidiCar
            </h1>
            <div className="flex flex-col gap-3 mt-6">
              {[
                'Đặt xe nhanh chóng trong 2 phút',
                'Bảo hiểm toàn diện cho mọi chuyến đi',
                'Hỗ trợ 24/7, giao xe tận nơi',
                'Tích điểm thưởng sau mỗi lần thuê',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-brand-400/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-brand-300" />
                  </div>
                  <span className="text-white/80 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Skibidi<span className="text-brand-400">Car</span>
            </span>
          </Link>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Tạo tài khoản</h2>
            <p className="text-slate-400 text-sm mb-8">
              Đã có tài khoản?{' '}
              <Link to="/dang-nhap" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Đăng nhập
              </Link>
            </p>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{parseErrors(errorMsg)}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Số điện thoại <span className="text-slate-500">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="0901 234 567"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Toggle password"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicators */}
                {form.password.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {PASSWORD_RULES.map(({ label, test }) => {
                      const ok = test(form.password);
                      return (
                        <div key={label} className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            ok ? 'bg-green-500' : 'bg-white/10'
                          }`}>
                            {ok && <Check className="w-2 h-2 text-white" />}
                          </div>
                          <span className={`text-xs transition-colors ${ok ? 'text-green-400' : 'text-slate-500'}`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password_confirmation}
                    onChange={set('password_confirmation')}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-10 pr-11 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                      form.password_confirmation && form.password !== form.password_confirmation
                        ? 'border-red-500/50'
                        : 'border-white/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password_confirmation && form.password !== form.password_confirmation && (
                  <p className="text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={register.isPending || (!!form.password_confirmation && form.password !== form.password_confirmation)}
                className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {register.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <Link to="#" className="text-brand-400 hover:underline">Điều khoản dịch vụ</Link>
                {' '}và{' '}
                <Link to="#" className="text-brand-400 hover:underline">Chính sách bảo mật</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
