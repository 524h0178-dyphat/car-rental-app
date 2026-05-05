import { Star } from 'lucide-react';

// ── Static review data (UI demo — API sẽ thêm ở phase sau) ──────────────────
const DEMO_REVIEWS = [
  {
    id: 1,
    name: 'Nguyễn Minh Tú',
    avatar: null,
    rating: 5,
    date: '28/04/2026',
    text: 'Xe rất sạch sẽ, đi êm, đúng như mô tả. Chủ xe nhiệt tình, liên hệ nhanh. Chắc chắn sẽ thuê lại!',
  },
  {
    id: 2,
    name: 'Trần Thị Lan',
    avatar: null,
    rating: 5,
    date: '22/04/2026',
    text: 'Dịch vụ tốt, giao xe đúng hẹn. Xe mới, nội thất sang. Phí dịch vụ hợp lý.',
  },
  {
    id: 3,
    name: 'Phạm Văn Hùng',
    avatar: null,
    rating: 4,
    date: '15/04/2026',
    text: 'Xe ổn, nhưng giá xăng khá tốn. Tổng trải nghiệm vẫn rất đáng để thử.',
  },
];

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
function RatingSummary({ reviews }: { reviews: typeof DEMO_REVIEWS }) {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6">
      {/* Overall score */}
      <div className="flex flex-col items-center justify-center gap-2 sm:w-32 flex-shrink-0">
        <span className="text-5xl font-bold text-slate-900 dark:text-white">{avg.toFixed(1)}</span>
        <StarRating rating={avg} size="md" />
        <span className="text-xs text-slate-500">{reviews.length} đánh giá</span>
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
}

export default function ReviewsSection({ carName }: Props) {
  return (
    <section aria-labelledby="reviews-heading" className="mt-10">
      <h2 id="reviews-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        Đánh giá từ khách thuê
      </h2>

      <RatingSummary reviews={DEMO_REVIEWS} />

      <div className="space-y-4">
        {DEMO_REVIEWS.map((review) => (
          <article
            key={review.id}
            className="card p-5 flex gap-4"
            aria-label={`Đánh giá của ${review.name}`}
          >
            <ReviewAvatar name={review.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.date}</p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.text}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-center text-slate-400 mt-4">
        Hiển thị {DEMO_REVIEWS.length} trong tổng số {DEMO_REVIEWS.length} đánh giá về{' '}
        <span className="font-medium">{carName}</span>
      </p>
    </section>
  );
}
