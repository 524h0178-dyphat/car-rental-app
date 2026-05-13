import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, Calendar, MapPin, ChevronRight, Loader2,
  Clock, CheckCircle2, XCircle, Truck, AlertCircle, X,
} from 'lucide-react';
import { useMyBookings, useCancelBooking, useMockPayment, usePickupBooking, useRejectPickup } from '@/hooks/useBooking';
import { formatPrice } from '@/utils/formatters';
import type { Booking, BookingStatus } from '@/types/booking';

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700',  icon: Clock        },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700',    icon: CheckCircle2 },
  active:    { label: 'Đang thuê',    color: 'bg-green-100 text-green-700',   icon: Truck        },
  completed: { label: 'Hoàn thành',   color: 'bg-slate-100 text-slate-600',   icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-600',       icon: XCircle      },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ── Cancel dialog ─────────────────────────────────────────────────────────────
function CancelDialog({
  bookingId,
  onClose,
}: {
  bookingId: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const cancelBooking = useCancelBooking();

  const handleCancel = () => {
    cancelBooking.mutate(
      { id: bookingId, reason: reason || 'Khách hủy' },
      { onSuccess: onClose }
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 id="cancel-dialog-title" className="text-lg font-bold text-slate-900">Hủy đơn thuê xe</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <p className="text-slate-600 text-sm mb-4">
          Bạn có chắc muốn hủy đơn này? Hành động này không thể hoàn tác.
        </p>
        <div className="mb-5">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-slate-700 mb-1.5">
            Lý do hủy <span className="text-slate-400 font-normal">(tùy chọn)</span>
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Thay đổi kế hoạch, tìm được xe khác..."
            className="input-field resize-none"
          />
        </div>
        {cancelBooking.isError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{cancelBooking.error?.message}</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">
            Giữ đơn
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelBooking.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {cancelBooking.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Đang hủy...</>
            ) : (
              'Xác nhận hủy'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ booking }: { booking: Booking }) {
  const [showCancel, setShowCancel] = useState(false);
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canPay = booking.payment_status === 'pending' && booking.status !== 'cancelled' && booking.status !== 'completed';
  const mockPayment = useMockPayment();
  const confirmPickup = usePickupBooking();
  const rejectPickup = useRejectPickup();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      <div className="card p-5 hover:shadow-card-hover transition-all duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Car image */}
          {booking.car?.image && (
            <img
              src={booking.car.image}
              alt={booking.car.name}
              className="w-full sm:w-28 h-20 object-cover rounded-xl flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
              <div>
                <p className="text-xs text-slate-400 mb-0.5 font-mono">
                  #{String(booking.id).padStart(6, '0')}
                </p>
                <h3 className="font-semibold text-slate-900 truncate">
                  {booking.car?.name ?? 'Xe đã đặt'}
                </h3>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>{formatDate(booking.start_date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>{formatDate(booking.end_date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>{booking.total_days} ngày</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                {formatPrice(booking.total_price)}
              </div>
            </div>

            {/* Payment badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  booking.payment_status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : booking.payment_status === 'refunded'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {booking.payment_status === 'paid' ? '✓ Đã thanh toán'
                    : booking.payment_status === 'refunded' ? '↩ Đã hoàn tiền'
                    : '⏳ Chưa thanh toán'}
                </span>
                {canPay && (
                  <button
                    onClick={() => mockPayment.mutate(booking.id)}
                    disabled={mockPayment.isPending}
                    className="text-xs bg-brand-500 text-white font-medium px-3 py-1 rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-1"
                  >
                    {mockPayment.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Mô phỏng Thanh toán
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canCancel && (
                  <button
                    onClick={() => setShowCancel(true)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Hủy đơn
                  </button>
                )}
                {booking.status === 'confirmed' && booking.handed_over_at && (
                  <>
                    <button
                      onClick={() => rejectPickup.mutate(booking.id)}
                      disabled={rejectPickup.isPending}
                      className="text-xs text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 font-medium transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      {rejectPickup.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Chưa nhận được xe
                    </button>
                    <button
                      onClick={() => confirmPickup.mutate(booking.id)}
                      disabled={confirmPickup.isPending}
                      className="text-xs text-white bg-green-500 hover:bg-green-600 font-medium transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      {confirmPickup.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Đã nhận xe
                    </button>
                  </>
                )}
                {booking.car?.slug && (
                  <Link
                    to={`/xe/${booking.car.slug}`}
                    className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
                  >
                    Xem xe <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Cancel reason */}
            {booking.status === 'cancelled' && booking.cancel_reason && (
              <p className="text-xs text-red-400 mt-2 italic">
                Lý do: {booking.cancel_reason}
              </p>
            )}
          </div>
        </div>
      </div>

      {showCancel && (
        <CancelDialog bookingId={booking.id} onClose={() => setShowCancel(false)} />
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const STATUS_TABS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'Tất cả' },
  { value: 'pending',   label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'active',    label: 'Đang thuê' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function MyBookingsPage() {
  const [page, setPage]       = useState(1);
  const [tab, setTab]         = useState<BookingStatus | 'all'>('all');
  const { data, isLoading, isError } = useMyBookings(page);

  const filtered = tab === 'all'
    ? data?.data
    : data?.data.filter((b) => b.status === tab);

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Đơn thuê xe của tôi</h1>
            {data?.meta && (
              <p className="text-sm text-slate-500 mt-1">
                {data.meta.total} đơn tất cả
              </p>
            )}
          </div>
          <Link to="/tim-xe" className="btn-primary py-2 px-4 text-sm">
            <Car className="w-4 h-4" />
            Thuê thêm xe
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setTab(value); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === value
                  ? 'bg-brand-500 text-white shadow-orange'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-28 h-20 bg-slate-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-5 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-slate-500">Không thể tải danh sách đơn.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!filtered || filtered.length === 0) && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Car className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">Chưa có đơn thuê xe nào</p>
            <p className="text-sm text-slate-400">Hãy khám phá và đặt xe ngay!</p>
            <Link to="/tim-xe" className="btn-primary mt-2">
              Tìm xe ngay
            </Link>
          </div>
        )}

        {/* Booking list */}
        {!isLoading && filtered && filtered.length > 0 && (
          <div className="flex flex-col gap-4">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.meta && data.meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-sm text-slate-500">
              Trang {page} / {data.meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.meta.last_page}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
