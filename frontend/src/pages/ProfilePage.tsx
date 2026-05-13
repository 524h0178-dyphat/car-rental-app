import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Loader2,
  Car, ChevronRight, Shield, Check, BadgeCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile, useChangePassword } from '@/hooks/useAuth';
import { useMyBookings } from '@/hooks/useBooking';
import { formatPrice } from '@/utils/formatters';
import EmailOtpModal from '@/components/common/EmailOtpModal';

type Tab = 'profile' | 'security' | 'bookings' | 'submissions';

const PASSWORD_RULES = [
  { label: 'Ít nhất 8 ký tự',  test: (p: string) => p.length >= 8 },
  { label: 'Có chữ hoa',        test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Có chữ số',         test: (p: string) => /\d/.test(p) },
];

// ── Avatar lớn với initials ──────────────────────────────────────────────────
function BigAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-orange">
      {initials}
    </div>
  );
}

// ── Tab: Thông tin cá nhân ───────────────────────────────────────────────────
function ProfileTab() {
  const { user, setAuth, token } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [modalMode, setModalMode] = useState<'verify' | 'change' | null>(null);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, phone: user.phone ?? '' });
  }, [user]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form, {
      onSuccess: (res) => {
        // Update Zustand store with fresh user data
        if (res.data && token) setAuth(res.data, token);
      },
    });
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
        <BigAvatar name={user?.name ?? 'U'} />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{user?.name}</h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            user?.role === 'admin'
              ? 'bg-brand-100 text-brand-700'
              : 'bg-slate-100 text-slate-500 dark:text-slate-400'
          }`}>
            {user?.role === 'admin' ? '⭐ Admin' : '👤 Khách hàng'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="p-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <User className="inline w-4 h-4 mr-1 text-brand-500" />Họ và tên
          </label>
          <input id="p-name" type="text" value={form.name} onChange={set('name')}
            required className="input-field" />
        </div>
        <div>
          <label htmlFor="p-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Mail className="inline w-4 h-4 mr-1 text-brand-500" />Email
          </label>
          <div className="relative">
            <input id="p-email" type="email" value={form.email} onChange={set('email')}
              disabled
              required className="input-field disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:text-slate-400 disabled:opacity-70 disabled:cursor-not-allowed" />
          </div>
          <div className="mt-1.5">
            {user?.email_verified_at ? (
              <button type="button" onClick={() => setModalMode('change')} className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">Đổi email</button>
            ) : (
              <button type="button" onClick={() => setModalMode('verify')} className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium underline">Xác thực ngay</button>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="p-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Phone className="inline w-4 h-4 mr-1 text-brand-500" />Số điện thoại
          </label>
          <input id="p-phone" type="tel" value={form.phone} onChange={set('phone')}
            placeholder="0901 234 567" className="input-field" />
        </div>
      </div>

      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="btn-primary py-2.5 px-6 disabled:opacity-60"
      >
        {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>

    {modalMode && (
      <EmailOtpModal
        mode={modalMode}
        isOpen={true}
        onClose={() => setModalMode(null)}
      />
    )}
    </>
  );
}

// ── Tab: Bảo mật ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const changePassword = useChangePassword();
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword.mutate(form, {
      onSuccess: () => setForm({ current_password: '', password: '', password_confirmation: '' }),
    });
  };

  const toggle = (k: 'current' | 'new' | 'confirm') =>
    setShow((p) => ({ ...p, [k]: !p[k] }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2">
        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p className="text-sm text-blue-700">Mật khẩu mạnh giúp bảo vệ tài khoản của bạn.</p>
      </div>

      {/* Current password */}
      <div>
        <label htmlFor="cp-current" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Mật khẩu hiện tại
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="cp-current"
            type={show.current ? 'text' : 'password'}
            value={form.current_password}
            onChange={set('current_password')}
            required
            className="input-field pl-10 pr-10"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => toggle('current')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-1.5 text-right">
          <Link to="/quen-mat-khau" className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium">
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      {/* New password */}
      <div>
        <label htmlFor="cp-new" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Mật khẩu mới
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="cp-new"
            type={show.new ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            required
            className="input-field pl-10 pr-10"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => toggle('new')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.password.length > 0 && (
          <div className="mt-2 flex gap-4 flex-wrap">
            {PASSWORD_RULES.map(({ label, test }) => {
              const ok = test(form.password);
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-slate-200'}`}>
                    {ok && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span className={`text-xs ${ok ? 'text-green-600' : 'text-slate-400'}`}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="cp-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Xác nhận mật khẩu mới
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="cp-confirm"
            type={show.confirm ? 'text' : 'password'}
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            required
            className={`input-field pl-10 pr-10 ${
              form.password_confirmation && form.password !== form.password_confirmation
                ? 'border-red-300 focus:ring-red-400'
                : ''
            }`}
            placeholder="••••••••"
          />
          <button type="button" onClick={() => toggle('confirm')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.password_confirmation && form.password !== form.password_confirmation && (
          <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
        )}
      </div>

      <button
        type="submit"
        disabled={changePassword.isPending || (!!form.password_confirmation && form.password !== form.password_confirmation)}
        className="btn-primary py-2.5 px-6 disabled:opacity-60"
      >
        {changePassword.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" />Đang đổi...</>
          : <><Shield className="w-4 h-4" />Đổi mật khẩu</>
        }
      </button>
    </form>
  );
}

// ── Tab: Đơn thuê xe ─────────────────────────────────────────────────────────
function BookingsSummaryTab() {
  const { data, isLoading } = useMyBookings(1);

  const COLORS: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    active:    'bg-green-100 text-green-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  const LABELS: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    active: 'Đang thuê', completed: 'Hoàn thành', cancelled: 'Đã hủy',
  };

  if (isLoading) return <div className="animate-pulse space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-16 bg-slate-100 rounded-xl"/>)}</div>;

  if (!data?.data?.length) return (
    <div className="text-center py-12">
      <Car className="w-12 h-12 text-slate-200 mx-auto mb-3" />
      <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có đơn thuê xe nào</p>
      <Link to="/tim-xe" className="btn-primary text-sm py-2 px-5">Thuê xe ngay</Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {data.data.slice(0, 5).map((b) => (
        <div key={b.id} className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 truncate text-sm">{b.car?.name ?? 'Xe đã đặt'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(b.start_date).toLocaleDateString('vi-VN')} → {new Date(b.end_date).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-semibold text-slate-800">{formatPrice(b.total_price)}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORS[b.status]}`}>
              {LABELS[b.status]}
            </span>
          </div>
        </div>
      ))}
      {data.meta.total > 5 && (
        <Link
          to="/dat-xe-cua-toi"
          className="flex items-center justify-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium py-3 transition-colors"
        >
          Xem tất cả {data.meta.total} đơn
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// ── Tab: Xe ký gửi ───────────────────────────────────────────────────────────
function SubmissionsSummaryTab() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    import('@/services/api').then(({ default: api }) => {
      api.get('/car-submissions/my')
        .then(res => { setData(res.data); setIsLoading(false); })
        .catch(() => setIsLoading(false));
    });
  }, []);

  const COLORS: Record<string, string> = {
    reviewing: 'bg-amber-100 text-amber-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-600',
  };

  if (isLoading) return <div className="animate-pulse space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-16 bg-slate-100 rounded-xl"/>)}</div>;

  if (!data?.data?.length) return (
    <div className="text-center py-12">
      <Car className="w-12 h-12 text-slate-200 mx-auto mb-3" />
      <p className="text-slate-500 dark:text-slate-400 mb-4">Bạn chưa ký gửi xe nào</p>
      <Link to="/ky-gui-xe" className="btn-primary text-sm py-2 px-5">Đăng ký ký gửi ngay</Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {data.data.map((s: any) => (
        <div key={s.id} className="flex items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 truncate text-sm">{s.brand} {s.model}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biển số: {s.license_plate} • Ngày gửi: {new Date(s.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORS[s.status] || 'bg-slate-100'}`}>
              {s.status_label}
            </span>
          </div>
        </div>
      ))}

      <Link
        to="/don-ky-gui"
        className="flex items-center justify-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 font-medium py-2 mt-2 transition-colors"
      >
        Xem chi tiết và quản lý xe
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile',     label: 'Thông tin',   icon: User    },
  { key: 'security',    label: 'Bảo mật',     icon: Shield  },
  { key: 'bookings',    label: 'Đơn thuê xe', icon: Car     },
  { key: 'submissions', label: 'Xe ký gửi',   icon: BadgeCheck },
];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tài khoản của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{user?.email}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="card p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 lg:flex-none ${
                    tab === key
                      ? 'bg-brand-500 text-white shadow-orange'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="inline">{label}</span>
                </button>
              ))}

              <div className="hidden lg:block border-t border-slate-100 pt-2 mt-2">
                {user?.email_verified_at ? (
                  <div className="flex items-center gap-2 px-4 py-2">
                    <BadgeCheck className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Tài khoản đã xác minh</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">Tài khoản chưa xác minh</span>
                  </div>
                )}
              </div>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 card p-6 sm:p-8">
            {tab === 'profile'     && <ProfileTab />}
            {tab === 'security'    && <SecurityTab />}
            {tab === 'bookings'    && <BookingsSummaryTab />}
            {tab === 'submissions' && <SubmissionsSummaryTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
