import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Mail, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

interface EmailOtpModalProps {
  mode: 'verify' | 'change';
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailOtpModal({ mode, isOpen, onClose }: EmailOtpModalProps) {
  // For 'change' mode: step 1 = enter new email, step 2 = enter OTP
  // For 'verify' mode: always step 2 (OTP sent automatically on open)
  const [step, setStep] = useState<1 | 2>(mode === 'verify' ? 2 : 1);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSentRef = useRef(false);
  const { user, setAuth, token } = useAuthStore();

  // Start a 30s cooldown timer
  const startCooldown = useCallback(() => {
    setCooldown(30);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Auto-send OTP when modal opens in 'verify' mode
  useEffect(() => {
    if (isOpen && mode === 'verify' && !hasSentRef.current) {
      hasSentRef.current = true;
      (async () => {
        setIsSending(true);
        try {
          await api.post('/auth/request-verification');
          toast.success('Mã OTP đã được gửi đến email của bạn.');
          setOtpSent(true);
          startCooldown();
        } catch (error: any) {
          toast.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
          setIsSending(false);
        }
      })();
    }
  }, [isOpen, mode, startCooldown]);

  if (!isOpen) return null;

  // Send OTP for change mode (step 1 -> step 2)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSending(true);
    try {
      if (mode === 'verify') {
        await api.post('/auth/request-verification');
      } else {
        await api.post('/auth/request-email-change', { new_email: newEmail });
      }
      toast.success('Mã OTP đã được gửi đến email.');
      setOtpSent(true);
      setStep(2);
      startCooldown();
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  // Resend OTP (with cooldown)
  const handleResend = async () => {
    if (cooldown > 0) return;
    await handleRequestOtp();
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      if (mode === 'verify') {
        const res = await api.post('/auth/verify-email', { otp });
        const userData = res.data?.data;
        console.log('[EmailOtpModal] verify response:', userData);
        if (userData && token) {
          setAuth({ ...userData }, token);
        }
        toast.success('Xác thực email thành công! 🎉');
      } else {
        const res = await api.post('/auth/verify-email-change', { new_email: newEmail, otp });
        const userData = res.data?.data;
        console.log('[EmailOtpModal] change response:', userData);
        if (userData && token) {
          setAuth({ ...userData }, token);
        }
        toast.success('Đổi email thành công! 🎉');
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Mã OTP không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only allow digits in OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(val);
  };

  const title = mode === 'verify' ? 'Xác thực email' : 'Đổi email';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
            {mode === 'verify' ? (
              <ShieldCheck className="w-6 h-6 text-brand-500" />
            ) : (
              <Mail className="w-6 h-6 text-brand-500" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {step === 1
              ? 'Nhập email mới của bạn để nhận mã xác thực.'
              : `Nhập mã OTP gồm 6 chữ số vừa được gửi đến ${mode === 'verify' ? user?.email : newEmail}`}
          </p>
        </div>

        {step === 1 ? (
          /* Step 1: Enter new email (change mode only) */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email mới
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="input-field"
                placeholder="Ví dụ: name@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !newEmail}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-60"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi mã OTP'}
            </button>
          </form>
        ) : (
          /* Step 2: Enter OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {isSending && !otpSent ? (
              <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Đang gửi mã OTP...</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={handleOtpChange}
                    required
                    maxLength={6}
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="● ● ● ● ● ●"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="btn-primary w-full justify-center py-2.5 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận'}
                </button>
                <div className="text-center">
                  {cooldown > 0 ? (
                    <span className="text-sm text-slate-400">
                      Gửi lại mã sau <span className="font-semibold text-brand-500">{cooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSending}
                      className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium underline disabled:opacity-50"
                    >
                      {isSending ? 'Đang gửi...' : 'Gửi lại mã'}
                    </button>
                  )}
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
