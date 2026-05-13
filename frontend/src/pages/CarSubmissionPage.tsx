import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, User, FileText, CheckCircle2, ChevronRight,
  ArrowLeft, Loader2, AlertCircle, MapPin, Settings,
  Fuel, Calendar, DollarSign, Phone, Mail, BadgeCheck,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';
import SEO from '@/components/common/SEO';
import { formatPrice } from '@/utils/formatters';
import { useAuthStore } from '@/stores/authStore';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubmissionForm {
  // Owner info
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  owner_cccd: string;
  owner_address: string;
  // Car info
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  transmission: 'Số tự động' | 'Số sàn';
  fuel: 'Xăng' | 'Dầu' | 'Điện' | 'Hybrid';
  seats: string;
  expected_price_per_day: string;
  location_province: string;
  description: string;
  images: string[];
}

const INIT: SubmissionForm = {
  owner_name: '', owner_phone: '', owner_email: '', owner_cccd: '', owner_address: '',
  brand: '', model: '', year: '', license_plate: '',
  transmission: 'Số tự động', fuel: 'Xăng', seats: '5',
  expected_price_per_day: '', location_province: '', description: '', images: [''],
};

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Giới thiệu',   icon: Car      },
  { label: 'Thông tin chủ',icon: User     },
  { label: 'Thông tin xe', icon: Settings },
  { label: 'Xác nhận',     icon: FileText },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done   = i < current;
        const active = i === current;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                done ? 'bg-green-500 text-white' : active ? 'bg-brand-500 text-white shadow-orange' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                active ? 'text-brand-600' : done ? 'text-green-600' : 'text-slate-400'
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Benefits list ─────────────────────────────────────────────────────────────
const BENEFITS = [
  { icon: '💰', title: 'Thu nhập thụ động', desc: 'Xe không dùng vẫn sinh lời, tối đa hóa giá trị tài sản' },
  { icon: '🛡️', title: 'Bảo hiểm toàn diện', desc: 'Bảo hiểm tai nạn và vật chất theo từng chuyến thuê' },
  { icon: '📱', title: 'Theo dõi realtime', desc: 'Xem đơn thuê, doanh thu trực tiếp trên ứng dụng' },
  { icon: '🔧', title: 'Hỗ trợ bảo dưỡng', desc: 'Đội ngũ kỹ thuật hỗ trợ định kỳ và đột xuất 24/7' },
  { icon: '💼', title: 'Quản lý chuyên nghiệp', desc: 'SkibidiCar lo toàn bộ: đặt cọc, hợp đồng, giải quyết tranh chấp' },
];

// ── Step 0: Intro ─────────────────────────────────────────────────────────────
function StepIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-orange">
          <Car className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ký gửi xe cùng SkibidiCar</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Biến xe nhàn rỗi thành nguồn thu nhập. Quy trình đơn giản, an toàn, minh bạch.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BENEFITS.map((b) => (
          <div key={b.title} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <span className="text-2xl flex-shrink-0">{b.icon}</span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{b.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-3 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/50 rounded-xl sm:col-span-2">
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-semibold text-brand-700 text-sm">Quy trình 4 bước đơn giản</p>
            <p className="text-xs text-brand-600 mt-0.5">
              Điền thông tin → Xem xét (24h) → Ký hợp đồng → Bắt đầu cho thuê
            </p>
          </div>
        </div>
      </div>

      <button onClick={onNext} className="btn-primary w-full justify-center py-3 text-base">
        Bắt đầu đăng ký <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ── Step 1: Owner info ────────────────────────────────────────────────────────
function StepOwner({ form, setForm, onNext, onBack }: any) {
  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }));

  const valid = form.owner_name && form.owner_phone && form.owner_email && form.owner_cccd;

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 dark:text-white text-lg">Thông tin chủ xe</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="o-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <User className="inline w-4 h-4 mr-1 text-brand-500" />Họ và tên *
          </label>
          <input id="o-name" type="text" value={form.owner_name} onChange={s('owner_name')}
            placeholder="Nguyễn Văn A" required className="input-field" />
        </div>
        <div>
          <label htmlFor="o-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Phone className="inline w-4 h-4 mr-1 text-brand-500" />Số điện thoại *
          </label>
          <input id="o-phone" type="tel" value={form.owner_phone} onChange={s('owner_phone')}
            placeholder="0901 234 567" required className="input-field" />
        </div>
        <div>
          <label htmlFor="o-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Mail className="inline w-4 h-4 mr-1 text-brand-500" />Email *
          </label>
          <input id="o-email" type="email" value={form.owner_email} onChange={s('owner_email')}
            placeholder="email@example.com" required className="input-field" />
        </div>
        <div>
          <label htmlFor="o-cccd" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <BadgeCheck className="inline w-4 h-4 mr-1 text-brand-500" />Số CCCD *
          </label>
          <input id="o-cccd" type="text" value={form.owner_cccd} onChange={s('owner_cccd')}
            placeholder="012345678901" required className="input-field" />
        </div>
        <div>
          <label htmlFor="o-addr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <MapPin className="inline w-4 h-4 mr-1 text-brand-500" />Địa chỉ
          </label>
          <input id="o-addr" type="text" value={form.owner_address} onChange={s('owner_address')}
            placeholder="123 Nguyễn Huệ, Q.1" className="input-field" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-outline flex-1 py-3">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <button onClick={onNext} disabled={!valid} className="btn-primary flex-1 py-3 justify-center">
          Tiếp theo <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Car info ──────────────────────────────────────────────────────────
const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hội An', 'Huế',
  'Nha Trang', 'Đà Lạt', 'Cần Thơ', 'Hải Phòng', 'Vũng Tàu',
  'Quy Nhơn', 'Phú Quốc', 'Bình Dương', 'Đồng Nai',
];

function StepCar({ form, setForm, onNext, onBack }: any) {
  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }));
  const setImage = (idx: number, value: string) =>
    setForm((p: any) => ({
      ...p,
      images: p.images.map((url: string, i: number) => (i === idx ? value : url)),
    }));
  const addImage = () =>
    setForm((p: any) => ({ ...p, images: [...p.images, ''].slice(0, 6) }));
  const removeImage = (idx: number) =>
    setForm((p: any) => ({ ...p, images: p.images.filter((_: string, i: number) => i !== idx) }));

  const valid = form.brand && form.model && form.year && form.license_plate &&
    form.expected_price_per_day && form.location_province;

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 dark:text-white text-lg">Thông tin xe</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-brand" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Hãng xe *
          </label>
          <input id="c-brand" type="text" value={form.brand} onChange={s('brand')}
            placeholder="Toyota, Honda, Kia..." required className="input-field" />
        </div>
        <div>
          <label htmlFor="c-model" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Mẫu xe *
          </label>
          <input id="c-model" type="text" value={form.model} onChange={s('model')}
            placeholder="Camry, CR-V, Seltos..." required className="input-field" />
        </div>
        <div>
          <label htmlFor="c-year" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Calendar className="inline w-4 h-4 mr-1 text-brand-500" />Năm sản xuất *
          </label>
          <input id="c-year" type="number" value={form.year} onChange={s('year')}
            placeholder="2020" min="2010" max={new Date().getFullYear() + 1} required className="input-field" />
        </div>
        <div>
          <label htmlFor="c-plate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Biển số xe *
          </label>
          <input id="c-plate" type="text" value={form.license_plate} onChange={s('license_plate')}
            placeholder="51A-123.45" required className="input-field" />
        </div>
        <div>
          <label htmlFor="c-trans" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Settings className="inline w-4 h-4 mr-1 text-brand-500" />Hộp số *
          </label>
          <select id="c-trans" value={form.transmission} onChange={s('transmission')} className="input-field">
            <option>Số tự động</option>
            <option>Số sàn</option>
          </select>
        </div>
        <div>
          <label htmlFor="c-fuel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Fuel className="inline w-4 h-4 mr-1 text-brand-500" />Nhiên liệu *
          </label>
          <select id="c-fuel" value={form.fuel} onChange={s('fuel')} className="input-field">
            <option>Xăng</option>
            <option>Dầu</option>
            <option>Điện</option>
            <option>Hybrid</option>
          </select>
        </div>
        <div>
          <label htmlFor="c-seats" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Số chỗ ngồi *
          </label>
          <select id="c-seats" value={form.seats} onChange={s('seats')} className="input-field">
            {['4','5','7','9'].map((n) => <option key={n} value={n}>{n} chỗ</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="c-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <DollarSign className="inline w-4 h-4 mr-1 text-brand-500" />Giá kỳ vọng (₫/ngày) *
          </label>
          <input id="c-price" type="number" value={form.expected_price_per_day} onChange={s('expected_price_per_day')}
            placeholder="800000" min="100000" step="50000" required className="input-field" />
          {form.expected_price_per_day && (
            <p className="text-xs text-brand-500 mt-1">{formatPrice(+form.expected_price_per_day)}/ngày</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-prov" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <MapPin className="inline w-4 h-4 mr-1 text-brand-500" />Tỉnh/Thành phố *
          </label>
          <select id="c-prov" value={form.location_province} onChange={s('location_province')} className="input-field">
            <option value="">-- Chọn tỉnh thành --</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Mô tả thêm <span className="text-slate-400 font-normal">(tùy chọn)</span>
          </label>
          <textarea id="c-desc" value={form.description} onChange={s('description')} rows={3}
            placeholder="Tình trạng xe, trang bị đặc biệt, lịch sử bảo dưỡng..."
            className="input-field resize-none" />
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Ảnh xe <span className="text-slate-400 font-normal">(URL, tối đa 6 ảnh)</span>
            </label>
            <button
              type="button"
              onClick={addImage}
              disabled={form.images.length >= 6}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-40"
            >
              Thêm ảnh
            </button>
          </div>
          <div className="space-y-2">
            {form.images.map((url: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setImage(idx, e.target.value)}
                  placeholder="https://example.com/car-image.jpg"
                  className="input-field"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:bg-slate-900/50"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-outline flex-1 py-3">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <button onClick={onNext} disabled={!valid} className="btn-primary flex-1 py-3 justify-center">
          Xem lại & Xác nhận <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Review + Submit ───────────────────────────────────────────────────
function StepConfirm({ form, onBack, onSubmit, isLoading, error }: any) {
  const sections = [
    {
      title: 'Thông tin chủ xe',
      rows: [
        ['Họ tên', form.owner_name], ['Điện thoại', form.owner_phone],
        ['Email', form.owner_email], ['CCCD', form.owner_cccd],
        form.owner_address && ['Địa chỉ', form.owner_address],
      ].filter(Boolean),
    },
    {
      title: 'Thông tin xe',
      rows: [
        ['Hãng & Mẫu', `${form.brand} ${form.model}`],
        ['Năm SX', form.year], ['Biển số', form.license_plate],
        ['Hộp số', form.transmission], ['Nhiên liệu', form.fuel],
        ['Số chỗ', `${form.seats} chỗ`],
        ['Giá kỳ vọng', formatPrice(+form.expected_price_per_day) + '/ngày'],
        ['Tỉnh/Thành', form.location_province],
        ['Ảnh xe', `${form.images.filter(Boolean).length} ảnh`],
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-slate-900 dark:text-white text-lg">Xác nhận thông tin</h2>

      {sections.map((sec) => (
        <div key={sec.title} className="card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">{sec.title}</h3>
          <div className="space-y-2">
            {sec.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500 flex-shrink-0">{k}</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
        <p className="font-medium mb-1">📋 Cam kết của SkibidiCar</p>
        <ul className="space-y-1 text-amber-600 text-xs list-disc list-inside">
          <li>Liên hệ xác nhận trong vòng 24 giờ làm việc</li>
          <li>Thông tin được bảo mật tuyệt đối</li>
          <li>Miễn phí đăng ký, không ràng buộc</li>
        </ul>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={isLoading} className="btn-outline flex-1 py-3">
          <ArrowLeft className="w-4 h-4" /> Chỉnh sửa
        </button>
        <button onClick={onSubmit} disabled={isLoading} className="btn-primary flex-1 py-3 justify-center">
          {isLoading
            ? <><Loader2 className="w-5 h-5 animate-spin" />Đang gửi...</>
            : <><CheckCircle2 className="w-5 h-5" />Gửi đăng ký</>
          }
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CarSubmissionPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SubmissionForm>(INIT);
  const [success, setSuccess] = useState(false);

  const { isAuthenticated } = useAuthStore();

  const submit = useMutation({
    mutationFn: async (data: SubmissionForm) => {
      const res = await api.post('/car-submissions', {
        ...data,
        year: parseInt(data.year),
        seats: parseInt(data.seats),
        expected_price_per_day: parseInt(data.expected_price_per_day),
        images: data.images.map((url) => url.trim()).filter(Boolean),
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success('Đăng ký ký gửi xe thành công! 🎉', {
        description: 'Chúng tôi sẽ liên hệ trong 24 giờ.',
        duration: 6000,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Gửi đăng ký thất bại, thử lại.';
      toast.error('Lỗi', { description: msg });
    },
  });

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center px-4">
        <SEO title="Đăng ký ký gửi xe" description="Ký gửi xe với SkibidiCar" />
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Gửi đăng ký thành công!</h1>
          <p className="text-slate-500 mb-8">
            Cảm ơn bạn đã tin tưởng SkibidiCar. Đội ngũ tư vấn sẽ liên hệ qua số{' '}
            <strong>{form.owner_phone}</strong> trong vòng <strong>24 giờ</strong>.
          </p>
          <div className="bg-white border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-sm text-left mb-6 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white mb-3">Các bước tiếp theo</p>
            {[
              '1. Nhân viên tư vấn liên hệ xác nhận thông tin',
              '2. Kiểm định xe và chụp ảnh (miễn phí)',
              '3. Ký hợp đồng ký gửi',
              '4. Xe bắt đầu xuất hiện trên nền tảng',
            ].map((t) => <p key={t} className="text-slate-600">{t}</p>)}
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/" className="btn-primary w-full justify-center">Về trang chủ</Link>
            <Link to="/tim-xe" className="btn-outline w-full justify-center">Khám phá xe cho thuê</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center px-4">
        <SEO title="Yêu cầu đăng nhập" />
        <div className="max-w-md w-full text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Yêu cầu đăng nhập</h1>
          <p className="text-slate-500 mb-8">
            Bạn cần đăng nhập để có thể ký gửi xe. Điều này giúp chúng tôi quản lý xe và thanh toán thu nhập cho bạn một cách an toàn.
          </p>
          <Link to="/dang-nhap" state={{ from: '/ky-gui-xe' }} className="btn-primary w-full justify-center py-3">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900/50">
      <SEO title="Ký gửi xe" description="Đăng ký ký gửi xe tự lái cùng SkibidiCar. Thu nhập thụ động, bảo hiểm toàn diện." url="/ky-gui-xe" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-slate-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Ký gửi xe</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Đăng ký ký gửi xe</h1>

        <StepBar current={step} />

        <div className="card p-6 sm:p-8">
          {step === 0 && <StepIntro onNext={() => setStep(1)} />}
          {step === 1 && <StepOwner form={form} setForm={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepCar   form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <StepConfirm
              form={form}
              onBack={() => setStep(2)}
              onSubmit={() => submit.mutate(form)}
              isLoading={submit.isPending}
              error={submit.error?.message}
            />
          )}
        </div>
      </div>
    </div>
  );
}
