import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Loader2, AlertCircle, CheckCircle2, Car, ArrowLeft } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/reviewService';
import { bookingService } from '@/services/bookingService';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Chọn số sao">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} sao`}
          className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          <Star
            className={`w-9 h-9 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Tuyệt vời',
};

export default function ReviewCreatePage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const id = Number(bookingId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  // Load booking detail to verify it's completed
  const { data: bookingData, isLoading: loadingBooking, isError: bookingError } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.get(id),
    enabled: !!id,
  });

  const booking = bookingData?.data;

  const submitReview = useMutation({
    mutationFn: () =>
      reviewService.create({ booking_id: id, rating, comment: comment || undefined }),
    onSuccess: () => setSuccess(true),
  });

  if (loadingBooking) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-slate-600">Không tìm thấy đơn thuê xe.</p>
          <Link to="/dat-xe-cua-toi" className="btn-primary mt-4 inline-flex">
            Quay lại đơn thuê
          </Link>
        </div>
      </div>
    );
  }

  if (booking.status !== 'completed') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">Chỉ có thể đánh giá chuyến đi đã hoàn thành.</p>
          <p className="text-sm text-slate-500 mt-1">Trạng thái hiện tại: <strong>{booking.status}</strong></p>
          <Link to="/dat-xe-cua-toi" className="btn-outline mt-4 inline-flex">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Cảm ơn bạn!</h2>
          <p className="text-slate-500 mb-6">Đánh giá của bạn đã được ghi nhận.</p>
          <Link to="/dat-xe-cua-toi" className="btn-primary">
            Về danh sách đơn thuê
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Back button */}
        <Link
          to="/dat-xe-cua-toi"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại đơn thuê xe
        </Link>

        <div className="card p-8">
          {/* Car info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
              <Car className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">Đơn #{String(booking.id).padStart(6, '0')}</p>
              <h3 className="font-semibold text-slate-900">{booking.car?.name ?? 'Xe đã thuê'}</h3>
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-6">Viết đánh giá của bạn</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (rating === 0) return;
              submitReview.mutate();
            }}
            className="space-y-6"
          >
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Đánh giá tổng quan <span className="text-red-500">*</span>
              </label>
              <StarPicker value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="mt-2 text-sm font-medium text-amber-600">{RATING_LABELS[rating]}</p>
              )}
              {submitReview.isError && rating === 0 && (
                <p className="text-xs text-red-500 mt-1">Vui lòng chọn số sao.</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-slate-700 mb-2">
                Nhận xét chi tiết <span className="text-slate-400 font-normal">(tùy chọn)</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi, tình trạng xe, chủ xe..."
                className="input-field resize-none"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/2000</p>
            </div>

            {/* Error message */}
            {submitReview.isError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{submitReview.error?.message}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="submit-review-btn"
              disabled={submitReview.isPending || rating === 0}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitReview.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi...</>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  Gửi đánh giá
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
