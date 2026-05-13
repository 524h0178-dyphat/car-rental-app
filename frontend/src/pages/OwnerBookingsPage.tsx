import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car, Clock, CheckCircle2, XCircle, Truck, AlertCircle, X, User as UserIcon
} from 'lucide-react';
import { bookingService } from '@/services/bookingService';
import { formatPrice } from '@/utils/formatters';
import type { Booking, BookingStatus } from '@/types/booking';

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Chờ duyệt',    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',  icon: Clock        },
  confirmed: { label: 'Đã duyệt',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    icon: CheckCircle2 },
  active:    { label: 'Đang cho thuê', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   icon: Truck        },
  completed: { label: 'Hoàn thành',   color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',   icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',       icon: XCircle      },
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

// ── Reject dialog ─────────────────────────────────────────────────────────────
function RejectDialog({
  bookingId,
  onClose,
}: {
  bookingId: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  
  const rejectMutation = useMutation({
    mutationFn: (r: string) => bookingService.ownerReject(bookingId, r),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Từ chối đơn thuê xe</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          Bạn đang từ chối đơn đặt xe này. Hãy cho khách hàng biết lý do (xe bận, bảo dưỡng...).
        </p>
        <div className="mb-5">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Lý do từ chối (bắt buộc)..."
            required
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">
            Quay lại
          </button>
          <button
            onClick={() => rejectMutation.mutate(reason)}
            disabled={rejectMutation.isPending || !reason.trim()}
            className="flex-1 btn-primary bg-red-500 hover:bg-red-600 disabled:opacity-60"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking card ─────────────────────────────────────────────────────────────
function OwnerBookingCard({ booking }: { booking: Booking }) {
  const [showReject, setShowReject] = useState(false);
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: () => bookingService.ownerConfirm(booking.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-bookings'] }),
  });

  const returnMutation = useMutation({
    mutationFn: () => bookingService.ownerReturn(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  const handoverMutation = useMutation({
    mutationFn: () => bookingService.ownerHandover(booking.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-bookings'] }),
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      <div className="card p-5 hover:shadow-card-hover transition-all duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {booking.car?.image && (
            <img
              src={booking.car.image}
              alt={booking.car.name}
              className="w-full sm:w-28 h-20 object-cover rounded-xl flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
              <div>
                <p className="text-xs text-slate-400 mb-0.5 font-mono">
                  #{String(booking.id).padStart(6, '0')}
                </p>
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                  {booking.car?.name ?? 'Xe của bạn'}
                </h3>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-xs text-slate-400 mb-0.5">Khách thuê</span>
                <div className="flex items-center gap-1 text-slate-900 dark:text-white font-medium">
                  <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                  <span className="truncate">{booking.renter_name}</span>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-xs text-slate-400 mb-0.5">Lịch trình</span>
                <span className="text-slate-900 dark:text-white">{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-0.5">Thời gian</span>
                <span className="text-slate-900 dark:text-white">{booking.total_days} ngày</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-0.5">Thu nhập</span>
                <span className="text-green-600 font-bold">{formatPrice(booking.total_price)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                booking.payout_status === 'paid' 
                  ? 'bg-green-100 text-green-700' 
                  : booking.payment_status === 'paid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-500 dark:text-slate-400'
              }`}>
                {booking.payout_status === 'paid' 
                  ? '✓ Đã nhận tiền' 
                  : booking.payment_status === 'paid'
                    ? '⏳ Tiền tạm giữ (Chờ khách nhận xe)'
                    : '⏳ Chờ khách thanh toán'}
              </span>

              <div className="flex items-center gap-2">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => setShowReject(true)}
                      className="btn-outline px-4 py-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => confirmMutation.mutate()}
                      disabled={confirmMutation.isPending}
                      className="btn-primary px-4 py-1.5 text-xs bg-green-500 hover:bg-green-600"
                    >
                      Xác nhận cho thuê
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && booking.payment_status === 'paid' && !booking.handed_over_at && (
                  <button
                    onClick={() => handoverMutation.mutate()}
                    disabled={handoverMutation.isPending}
                    className="btn-primary px-4 py-1.5 text-xs bg-brand-500 hover:bg-brand-600"
                  >
                    Bàn giao xe
                  </button>
                )}
                {booking.status === 'confirmed' && booking.handed_over_at && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">⏳ Chờ khách xác nhận nhận xe</span>
                )}
                {booking.status === 'active' && (
                  <button
                    onClick={() => returnMutation.mutate()}
                    disabled={returnMutation.isPending}
                    className="btn-primary px-4 py-1.5 text-xs bg-brand-500 hover:bg-brand-600"
                  >
                    Xác nhận khách đã trả xe
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showReject && <RejectDialog bookingId={booking.id} onClose={() => setShowReject(false)} />}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OwnerBookingsPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab]   = useState<BookingStatus | 'all'>('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['owner-bookings', page],
    queryFn: () => bookingService.ownerList(page),
  });

  const filtered = tab === 'all'
    ? data?.data
    : data?.data.filter((b) => b.status === tab);

  const STATUS_TABS: { value: BookingStatus | 'all'; label: string }[] = [
    { value: 'all',       label: 'Tất cả' },
    { value: 'pending',   label: 'Chờ duyệt' },
    { value: 'confirmed', label: 'Đã duyệt' },
    { value: 'active',    label: 'Đang cho thuê' },
    { value: 'completed', label: 'Hoàn thành' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý xe cho thuê</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý các yêu cầu thuê xe của khách hàng</p>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setTab(value); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === value
                  ? 'bg-brand-500 text-white shadow-orange'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 dark:text-slate-300 hover:border-brand-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 h-40 animate-pulse bg-white dark:bg-slate-800" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Không thể tải danh sách đơn.</p>
          </div>
        )}

        {!isLoading && !isError && (!filtered || filtered.length === 0) && (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <Car className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có yêu cầu thuê xe nào</p>
          </div>
        )}

        {!isLoading && filtered && filtered.length > 0 && (
          <div className="flex flex-col gap-4">
            {filtered.map((booking) => (
              <OwnerBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}

        {data?.meta && data.meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="px-4 py-2 rounded-xl border border-slate-200 text-sm">Trước</button>
            <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">Trang {page} / {data.meta.last_page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.meta.last_page} className="px-4 py-2 rounded-xl border border-slate-200 text-sm">Sau</button>
          </div>
        )}
      </div>
    </div>
  );
}
