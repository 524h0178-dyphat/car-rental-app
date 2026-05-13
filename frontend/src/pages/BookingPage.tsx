import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2, ChevronRight, Car, Calendar, User, CreditCard,
  MapPin, Phone, BadgeCheck, Loader2, AlertCircle, ArrowLeft,
  Building2, Wallet, QrCode,
} from 'lucide-react';
import { useCarDetail } from '@/hooks/useCarDetail';
import { useAuthStore } from '@/stores/authStore';
import { useCreateBooking } from '@/hooks/useBooking';
import { formatPrice } from '@/utils/formatters';
import { formatLocation } from '@/utils/location';
import type { BookingFormData, PaymentMethod } from '@/types/booking';

// ── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Xác nhận xe',       icon: Car },
  { label: 'Thông tin thuê',    icon: User },
  { label: 'Thanh toán',        icon: CreditCard },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                done   ? 'bg-green-500 text-white' :
                active ? 'bg-brand-500 text-white shadow-orange' :
                         'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}>
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                active ? 'text-brand-600' : done ? 'text-green-600' : 'text-slate-400 dark:text-slate-500'
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                done ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Price summary box (shared) ───────────────────────────────────────────────
function PriceSummary({ pricePerDay, totalDays }: { pricePerDay: number; totalDays: number }) {
  const total = pricePerDay * totalDays;
  return (
    <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 rounded-2xl p-5 space-y-2 text-sm">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Chi phí thuê xe</h3>
      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>{formatPrice(pricePerDay)} × {totalDays} ngày</span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>Phí dịch vụ</span>
        <span className="text-green-600 font-medium">Miễn phí</span>
      </div>
      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>Bảo hiểm</span>
        <span className="text-green-600 font-medium">Đã bao gồm</span>
      </div>
      <div className="border-t border-brand-200 dark:border-brand-900/50 pt-2 flex justify-between font-bold text-slate-900 dark:text-white text-base">
        <span>Tổng cộng</span>
        <span className="text-brand-500">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

// ── Step 1: Confirm car + dates ──────────────────────────────────────────────
function Step1({
  car, form, onNext, setForm,
}: {
  car: any;
  form: BookingFormData;
  setForm: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const totalDays = useMemo(() => {
    const d = Math.ceil(
      (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000
    );
    return Math.max(1, d);
  }, [form.start_date, form.end_date]);

  const primaryImage = car.images?.find((i: any) => i.is_primary)?.image_url ?? car.images?.[0]?.image_url;

  return (
    <div className="space-y-6">
      {/* Car summary card */}
      <div className="flex gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl items-center">
        {primaryImage && (
          <img
            src={primaryImage}
            alt={car.name}
            className="w-24 h-16 object-cover rounded-xl flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <span className="badge bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs mb-1">{car.brand}</span>
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{car.name}</h3>
          {car.location && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {formatLocation(car.location)}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-brand-500 font-bold">{formatPrice(car.price_per_day)}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">/ngày</p>
        </div>
      </div>

      {/* Date pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="book-start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Calendar className="inline w-4 h-4 mr-1 text-brand-500" />Ngày nhận xe
          </label>
          <input
            id="book-start"
            type="date"
            value={form.start_date}
            min={today}
            onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="book-end" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Calendar className="inline w-4 h-4 mr-1 text-brand-500" />Ngày trả xe
          </label>
          <input
            id="book-end"
            type="date"
            value={form.end_date}
            min={form.start_date}
            onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
            className="input-field"
          />
        </div>
      </div>

      <PriceSummary pricePerDay={car.price_per_day} totalDays={totalDays} />

      {/* Rental policy */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-400">
        <p className="font-medium mb-1">📋 Lưu ý quan trọng</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-300">
          <li>Cần chuẩn bị CCCD và bằng lái xe hợp lệ</li>
          <li>Chúng tôi sẽ xác nhận đặt xe trong vòng 30 phút</li>
          <li>Có thể hủy miễn phí trước 24 giờ nhận xe</li>
        </ul>
      </div>

      <button
        onClick={onNext}
        disabled={!form.start_date || !form.end_date}
        className="btn-primary w-full justify-center py-3 text-base"
      >
        Tiếp theo: Thông tin thuê xe
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ── Step 2: Renter info ──────────────────────────────────────────────────────
function Step2({
  form, setForm, onNext, onBack,
}: {
  form: BookingFormData;
  setForm: React.Dispatch<React.SetStateAction<BookingFormData>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const set = (key: keyof BookingFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const isValid = form.renter_name && form.renter_phone && form.renter_cccd;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label htmlFor="r-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <User className="inline w-4 h-4 mr-1 text-brand-500" />Họ và tên người thuê *
          </label>
          <input
            id="r-name"
            type="text"
            value={form.renter_name}
            onChange={set('renter_name')}
            placeholder="Nguyễn Văn A"
            required
            className="input-field"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="r-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Phone className="inline w-4 h-4 mr-1 text-brand-500" />Số điện thoại *
          </label>
          <input
            id="r-phone"
            type="tel"
            value={form.renter_phone}
            onChange={set('renter_phone')}
            placeholder="0901 234 567"
            required
            className="input-field"
          />
        </div>

        {/* CCCD */}
        <div>
          <label htmlFor="r-cccd" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <BadgeCheck className="inline w-4 h-4 mr-1 text-brand-500" />Số CCCD/CMND *
          </label>
          <input
            id="r-cccd"
            type="text"
            value={form.renter_cccd}
            onChange={set('renter_cccd')}
            placeholder="012345678901"
            required
            className="input-field"
          />
        </div>

        {/* Driver license */}
        <div className="sm:col-span-2">
          <label htmlFor="r-license" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Số bằng lái xe
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">(tùy chọn)</span>
          </label>
          <input
            id="r-license"
            type="text"
            value={form.renter_license}
            onChange={set('renter_license')}
            placeholder="B2 - 012345678901"
            className="input-field"
          />
        </div>

        {/* Pickup address */}
        <div className="sm:col-span-2">
          <label htmlFor="r-pickup" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <MapPin className="inline w-4 h-4 mr-1 text-brand-500" />Địa điểm nhận xe
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">(để trống = nhận tại văn phòng)</span>
          </label>
          <input
            id="r-pickup"
            type="text"
            value={form.pickup_address}
            onChange={set('pickup_address')}
            placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
            className="input-field"
          />
        </div>

        {/* Note */}
        <div className="sm:col-span-2">
          <label htmlFor="r-note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Ghi chú
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">(tùy chọn)</span>
          </label>
          <textarea
            id="r-note"
            value={form.note}
            onChange={set('note')}
            rows={3}
            placeholder="Yêu cầu đặc biệt, giờ nhận xe..."
            className="input-field resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-outline flex-1 py-3">
          <ArrowLeft className="w-4 h-4" />Quay lại
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="btn-primary flex-1 py-3 justify-center"
        >
          Tiếp theo: Thanh toán
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Payment + Confirm ────────────────────────────────────────────────
const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: Building2,
    desc: 'Chuyển khoản trước khi nhận xe. Số tài khoản sẽ được gửi qua email.' },
  { value: 'momo',          label: 'Ví MoMo',               icon: QrCode,
    desc: 'Thanh toán qua MoMo. Mã QR sẽ được hiển thị sau khi xác nhận.' },
  { value: 'cash',          label: 'Tiền mặt khi nhận xe',  icon: Wallet,
    desc: 'Thanh toán tiền mặt trực tiếp khi nhận xe. Cần đặt cọc 30%.' },
];

function Step3({
  form, setForm, car, onSubmit, onBack, isSubmitting, error,
}: {
  form: BookingFormData;
  setForm: React.Dispatch<React.SetStateAction<BookingFormData>>;
  car: any;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error?: string;
}) {
  const totalDays = Math.max(1, Math.ceil(
    (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000
  ));

  return (
    <div className="space-y-6">
      {/* Payment method selection */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Phương thức thanh toán</h3>
        <div className="space-y-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = form.payment_method === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, payment_method: opt.value }))}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-200 dark:hover:border-brand-700'
                }`}
                aria-pressed={selected}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  selected ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-medium text-sm ${selected ? 'text-brand-700 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
                {selected && (
                  <CheckCircle2 className="w-5 h-5 text-brand-500 ml-auto flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Final summary */}
      <div className="card dark:bg-slate-800 p-5 space-y-3 text-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Xác nhận thông tin</h3>
        {[
          ['Xe', car.name],
          ['Ngày nhận', new Date(form.start_date).toLocaleDateString('vi-VN')],
          ['Ngày trả',  new Date(form.end_date).toLocaleDateString('vi-VN')],
          ['Số ngày',   `${totalDays} ngày`],
          ['Người thuê', form.renter_name],
          ['Điện thoại', form.renter_phone],
          ['CCCD', form.renter_cccd],
          ...(form.pickup_address ? [['Nhận xe tại', form.pickup_address]] : []),
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">{k}</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium text-right">{v}</span>
          </div>
        ))}
      </div>

      <PriceSummary pricePerDay={car.price_per_day} totalDays={totalDays} />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={isSubmitting} className="btn-outline flex-1 py-3">
          <ArrowLeft className="w-4 h-4" />Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-primary flex-1 py-3 justify-center"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Đang gửi...</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" />Xác nhận đặt xe</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main BookingPage ─────────────────────────────────────────────────────────
export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { data: car, isLoading } = useCarDetail(slug ?? '');
  const createBooking = useCreateBooking();
  const [step, setStep] = useState(0);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const [form, setForm] = useState<BookingFormData>({
    car_id:         0,
    start_date:     searchParams.get('start') ?? today,
    end_date:       searchParams.get('end')   ?? tomorrow,
    renter_name:    user?.name  ?? '',
    renter_phone:   user?.phone ?? '',
    renter_cccd:    '',
    renter_license: '',
    pickup_address: '',
    pickup_note:    '',
    note:           '',
    payment_method: 'bank_transfer',
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: { pathname: `/dat-xe/${slug}` } }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Không tìm thấy xe.</p>
        <Link to="/tim-xe" className="btn-primary">Tìm xe khác</Link>
      </div>
    );
  }

  // Sync car_id into form
  const formWithCar = { ...form, car_id: car.id };

  const handleSubmit = () => {
    createBooking.mutate(
      {
        car_id:         car.id,
        start_date:     form.start_date,
        end_date:       form.end_date,
        renter_name:    form.renter_name,
        renter_phone:   form.renter_phone,
        renter_cccd:    form.renter_cccd,
        renter_license: form.renter_license || undefined,
        pickup_address: form.pickup_address || undefined,
        pickup_note:    form.pickup_note    || undefined,
        payment_method: form.payment_method,
        note:           form.note           || undefined,
      },
      {
        onSuccess: (res) => {
          setCreatedBookingId(res.data.id);
          setStep(3); // success screen
        },
      }
    );
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (step === 3 && createdBookingId) {
    return (
      <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Đặt xe thành công!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Mã đặt xe: <span className="font-mono font-bold text-brand-600">#{String(createdBookingId).padStart(6, '0')}</span>
            <br />
            Chúng tôi sẽ liên hệ xác nhận trong vòng <strong>30 phút</strong>.
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-sm text-left mb-6 space-y-3">
            <p className="font-semibold text-slate-900 dark:text-white">Bước tiếp theo</p>
            {[
              '1. Chờ xác nhận qua điện thoại hoặc email',
              '2. Chuẩn bị CCCD, bằng lái xe gốc',
              '3. Thanh toán theo phương thức đã chọn',
              '4. Nhận xe đúng giờ đã thỏa thuận',
            ].map((s) => (
              <p key={s} className="text-slate-600 dark:text-slate-400">{s}</p>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/dat-xe-cua-toi" className="btn-primary w-full justify-center">
              Xem đơn thuê của tôi
            </Link>
            <Link to="/tim-xe" className="btn-outline w-full justify-center">
              Tiếp tục tìm xe
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
          <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-300">Trang chủ</Link>
          <span>/</span>
          <Link to={`/xe/${slug}`} className="hover:text-slate-600 dark:hover:text-slate-300 truncate max-w-[150px]">{car.name}</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Đặt xe</span>
        </nav>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Đặt xe</h1>

        <StepIndicator current={step} />

        <div className="card dark:bg-slate-800 p-6 sm:p-8">
          {step === 0 && (
            <Step1 car={car} form={formWithCar} setForm={setForm} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <Step2 form={formWithCar} setForm={setForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />
          )}
          {step === 2 && (
            <Step3
              form={formWithCar}
              setForm={setForm}
              car={car}
              onSubmit={handleSubmit}
              onBack={() => setStep(1)}
              isSubmitting={createBooking.isPending}
              error={createBooking.error?.message}
            />
          )}
        </div>
      </div>
    </div>
  );
}
