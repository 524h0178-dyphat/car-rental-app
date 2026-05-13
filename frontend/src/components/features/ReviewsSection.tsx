import { useState } from 'react';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { useCarReviews } from '@/hooks/useCarDetail';

// ── Star component ────────────────────────────────────────────────────────────
export function StarRating({
  rating,
  max = 5,
  size = 'sm',
}: {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sz = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }[size];
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} trên ${max} sao`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half   = !filled && i < rating;
        return (
          <Star
            key={i}
            className={`${sz} ${
              filled ? 'text-amber-400 fill-amber-400'
              : half  ? 'text-amber-400 fill-amber-200'
              :         'text-slate-200 fill-slate-100'
            }`}
          />
        );
      })}
    </div>
  );
}

// ── Review avatar ─────────────────────────────────────────────────────────────
function ReviewAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
  const colors   = ['bg-brand-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-teal-400'];
  const color    = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Rating summary bar ────────────────────────────────────────────────────────
function RatingSummary({ averageRating, distribution, total }: { averageRating: number; distribution: Record<number, number>; total: number }) {
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = distribution[star] || 0;
    const pct = total > 0 ? (count / total) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6">
      {/* Overall score */}
      <div className="flex flex-col items-center justify-center gap-2 sm:w-32 flex-shrink-0">
        <span className="text-5xl font-bold text-slate-900 dark:text-white">{averageRating.toFixed(1)}</span>
        <StarRating rating={averageRating} size="md" />
        <span className="text-xs text-slate-500">{total} đánh giá</span>
      </div>

      {/* Distribution */}
      <div className="flex-1 space-y-2">
        {dist.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-4">{star}</span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-3">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Reviews Section ──────────────────────────────────────────────────────
interface Props {
  carName?: string;
  carId: number;
}

export default function ReviewsSection({ carName, carId }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useCarReviews(carId, page);

  if (isLoading) {
    return (
      <div className="mt-10 flex items-center justify-center p-10">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        <span className="ml-2 text-slate-500 text-sm">Đang tải đánh giá...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-10 flex items-center justify-center p-10 text-red-500 text-sm">
        <AlertCircle className="w-5 h-5 mr-2" />
        Lỗi khi tải đánh giá.
      </div>
    );
  }

  const reviews = data?.data || [];
  const total = data?.meta.total || 0;
  const averageRating = data?.average_rating || 0;
  const distribution = data?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <section aria-labelledby="reviews-heading" className="mt-10">
      <h2 id="reviews-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        Đánh giá từ khách thuê
      </h2>

      <RatingSummary averageRating={averageRating} distribution={distribution} total={total} />

      {reviews.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
          Chưa có đánh giá nào cho xe này.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="card p-5 flex gap-4"
              aria-label={`Đánh giá của ${review.user?.name ?? 'Khách'}`}
            >
              <ReviewAvatar name={review.user?.name ?? 'Khách'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{review.user?.name ?? 'Khách'}</p>
                    <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment || 'Không có nhận xét.'}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {total > 0 && (
        <p className="text-xs text-center text-slate-400 mt-4">
          Hiển thị {reviews.length} trong tổng số {total} đánh giá về{' '}
          <span className="font-medium">{carName}</span>
        </p>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Trước
          </button>
          <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
            Trang {page} / {data.meta.last_page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.meta.last_page}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Sau →
          </button>
        </div>
      )}
    </section>
  );
}
