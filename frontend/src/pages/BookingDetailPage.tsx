import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car, Calendar, Clock, CreditCard, MapPin, User, Phone,
  ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle,
  Star, Truck,
} from 'lucide-react';
import { useState } from 'react';
import { bookingService } from '@/services/bookingService';
import { useCancelBooking, useMockPayment } from '@/hooks/useBooking';
import { formatPrice } from '@/utils/formatters';
import type { Booking } from '@/types/booking';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Chờ xác nhận', color: 'text-amber-700 bg-amber-100',  icon: Clock        },
  confirmed: { label: 'Đã xác nhận',  color: 'text-blue-700 bg-blue-100',    icon: CheckCircle2 },
  active:    { label: 'Đang thuê',    color: 'text-green-700 bg-green-100',   icon: Truck        },
  completed: { label: 'Hoàn thành',   color: 'text-slate-600 bg-slate-100',   icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy',       color: 'text-red-600 bg-red-100',       icon: XCircle      },
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading, isError } = useQuery<{ data: Booking }>({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.get(bookingId),
    enabled: !!bookingId,
  });

  const cancelBooking = useCancelBooking();
  const mockPayment = useMockPayment();
  const booking = data?.data;

  const handleCancel = () => {
    cancelBooking.mutate(
      { id: bookingId, reason: cancelReason || 'Khách hủy' },
      { onSuccess: () => setShowCancelDialog(false) }
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-slate-600">Không tìm thấy đơn thuê xe.</p>
          <Link to="/dat-xe-cua-toi" className="btn-outline mt-4 inline-flex">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_MAP[booking.status] ?? STATUS_MAP.pending;
  const StatusIcon = statusCfg.icon;
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canPay = booking.payment_status === 'pending' && !['cancelled', 'completed'].includes(booking.status);
  const canReview = booking.status === 'completed';

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to="/dat-xe-cua-toi"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn
        </Link>

        {/* Status header */}
        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-xs text-slate-400 font-mono">Đơn #{String(booking.id).padStart(6, '0')}</p>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{booking.car?.name ?? 'Xe đã đặt'}</h1>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusCfg.label}
            </span>
          </div>

          {/* Car image */}
          {booking.car?.image && (
            <img
              src={booking.car.image}
              alt={booking.car.name}
              className="w-full h-44 object-cover rounded-xl mb-4"
            />
          )}

          {/* Price summary */}
          <div className="flex items-center justify-between p-4 bg-brand-50 rounded-xl">
            <div>
              <p className="text-sm text-slate-500">Tổng thanh toán</p>
              <p className="text-2xl font-bold text-brand-600">{formatPrice(booking.total_price)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{booking.total_days} ngày</p>
              <p className="text-sm text-slate-600">{formatPrice(booking.price_per_day)}/ngày</p>
            </div>
          </div>
        </div>

        {/* Rental details */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-slate-900 mb-2">Chi tiết chuyến đi</h2>
          <InfoRow icon={Calendar} label="Ngày nhận xe" value={formatDate(booking.start_date)} />
          <InfoRow icon={Calendar} label="Ngày trả xe" value={formatDate(booking.end_date)} />
          <InfoRow icon={Clock} label="Thời gian thuê" value={`${booking.total_days} ngày`} />
          {booking.pickup_address && (
            <InfoRow icon={MapPin} label="Địa điểm nhận xe" value={booking.pickup_address} />
          )}
        </div>

        {/* Renter info */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-slate-900 mb-2">Thông tin người thuê</h2>
          <InfoRow icon={User} label="Họ tên" value={booking.renter_name} />
          <InfoRow icon={Phone} label="Số điện thoại" value={booking.renter_phone} />
          {booking.renter_cccd && (
            <InfoRow icon={CreditCard} label="CCCD/CMND" value={booking.renter_cccd} />
          )}
        </div>

        {/* Payment info */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-2">Thanh toán</h2>
          <InfoRow
            icon={CreditCard}
            label="Phương thức"
            value={booking.payment_method ?? 'Chưa chọn'}
          />
          <InfoRow
            icon={CheckCircle2}
            label="Trạng thái"
            value={
              <span className={`font-medium ${
                booking.payment_status === 'paid' ? 'text-green-600'
                  : booking.payment_status === 'refunded' ? 'text-purple-600'
                  : 'text-amber-600'
              }`}>
                {booking.payment_status === 'paid' ? '✓ Đã thanh toán'
                  : booking.payment_status === 'refunded' ? '↩ Đã hoàn tiền'
                  : '⏳ Chưa thanh toán'}
              </span>
            }
          />
        </div>

        {/* Cancel reason */}
        {booking.status === 'cancelled' && booking.cancel_reason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <p className="text-sm font-medium text-red-700">Lý do hủy:</p>
            <p className="text-sm text-red-600 mt-1">{booking.cancel_reason}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {canPay && (
            <button
              id="pay-booking-btn"
              onClick={() => mockPayment.mutate(booking.id)}
              disabled={mockPayment.isPending}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {mockPayment.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Đang xử lý...</>
              ) : (
                <><CreditCard className="w-4 h-4" />Thanh toán ngay</>
              )}
            </button>
          )}

          {canReview && (
            <Link
              to={`/viet-danh-gia/${booking.id}`}
              id="write-review-link"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" />
              Viết đánh giá
            </Link>
          )}

          {canCancel && (
            <button
              id="cancel-booking-btn"
              onClick={() => setShowCancelDialog(true)}
              className="w-full py-3 px-4 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Hủy đơn thuê
            </button>
          )}

          {booking.car?.slug && (
            <Link
              to={`/xe/${booking.car.slug}`}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:border-brand-300 transition-colors flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              Xem thông tin xe
            </Link>
          )}
        </div>
      </div>

      {/* Cancel dialog */}
      {showCancelDialog && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Hủy đơn thuê xe</h2>
            <p className="text-slate-500 text-sm mb-4">
              Bạn có chắc muốn hủy đơn này? Hành động này không thể hoàn tác.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Lý do hủy (tùy chọn)"
              className="input-field resize-none mb-4"
            />
            {cancelBooking.isError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{cancelBooking.error?.message}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowCancelDialog(false)} className="btn-outline flex-1">
                Giữ đơn
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelBooking.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {cancelBooking.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Đang hủy...</>
                ) : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
