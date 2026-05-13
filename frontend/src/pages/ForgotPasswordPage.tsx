import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  // Steps: 1 = Email, 2 = OTP, 3 = Reset Password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.verifyOtp(email, otp);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      await authService.resetPassword({
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });
      // Redirect to login with success message via state or just navigate
      navigate('/dang-nhap', { state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
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
            <span className="text-2xl font-bold">SkibidiCar</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Khôi phục mật khẩu<br />Dễ dàng và an toàn.
            </h1>
            <p className="text-white/70 text-lg">
              Chỉ với vài bước đơn giản, bạn có thể lấy lại quyền truy cập vào tài khoản của mình.
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
              Skibidi<span className="text-brand-400">Car</span>
            </span>
          </Link>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Back to login */}
            {step === 1 && (
              <Link
                to="/dang-nhap"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            )}
            
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại nhập email
              </button>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* STEP 1: REQUEST OTP */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-1">Quên mật khẩu</h2>
                <p className="text-slate-400 text-sm mb-8">
                  Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP gồm 6 chữ số để xác minh.
                </p>

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="forgot-email"
                        type="email"
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
                    disabled={isLoading || !email}
                    className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi mã OTP'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 2 && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-brand-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1 text-center">Xác minh OTP</h2>
                <p className="text-slate-400 text-sm mb-8 text-center">
                  Mã xác minh gồm 6 chữ số đã được gửi đến email <br />
                  <span className="text-brand-400 font-medium">{email}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-1.5 text-center">
                      Nhập mã OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                        if (val.length === 6 && !isLoading) {
                          setError('');
                          setIsLoading(true);
                          authService.verifyOtp(email, val)
                            .then(() => {
                              setStep(3);
                            })
                            .catch((err: any) => {
                              setError(err.response?.data?.message || 'Mã OTP không hợp lệ.');
                            })
                            .finally(() => {
                              setIsLoading(false);
                            });
                        }
                      }}
                      placeholder="• • • • • •"
                      required
                      className="w-full text-center tracking-[1em] py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xác minh...
                      </>
                    ) : (
                      'Xác minh mã'
                    )}
                  </button>
                </form>
              </>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 3 && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1 text-center">Đặt mật khẩu mới</h2>
                <p className="text-slate-400 text-sm mb-8 text-center">
                  Mã OTP đã được xác minh. Vui lòng nhập mật khẩu mới.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        minLength={8}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !password || !passwordConfirmation}
                    className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đổi mật khẩu'
                    )}
                  </button>
                </form>
              </>
            )}

            {step === 1 && (
              <p className="text-center text-slate-500 text-xs mt-6">
                Chưa có tài khoản?{' '}
                <Link to="/dang-ky" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
