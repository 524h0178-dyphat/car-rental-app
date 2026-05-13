import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import FilterSidebar from '@/components/features/FilterSidebar';
import CarCard, { CarCardSkeleton } from '@/components/features/CarCard';
import SearchAutocomplete from '@/components/features/SearchAutocomplete';
import { useCarFilter } from '@/hooks/useCarFilter';
import { useFilterStore } from '@/stores/filterStore';
import type { CarFilters } from '@/types';

const SORT_OPTIONS = [
  { label: 'Mới nhất',        value: 'created_at__desc' },
  { label: 'Giá thấp → cao',  value: 'price_per_day__asc' },
  { label: 'Giá cao → thấp',  value: 'price_per_day__desc' },
  { label: 'Đời xe mới nhất', value: 'year__desc' },
];

const URL_FILTER_KEYS: (keyof CarFilters)[] = [
  'seats', 'transmission', 'fuel', 'brand', 'province',
  'price_min', 'price_max', 'start_date', 'end_date', 'sort_by', 'sort_dir', 'per_page', 'page',
];

/** Calls `onIntersect` when sentinel element enters the viewport */
function useSentinel(onIntersect: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onIntersect(); },
      { rootMargin: '200px' }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [onIntersect, enabled]);
  return ref;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters } = useFilterStore();
  const { data, isLoading, isError, isFetching } = useCarFilter();

  // ── Sync URL → Zustand (on first mount) ─────────────────────────────
  useEffect(() => {
    const fromUrl: Partial<CarFilters> = {};
    URL_FILTER_KEYS.forEach((key) => {
      const val = searchParams.get(key);
      if (val) fromUrl[key] = val;
    });
    if (Object.keys(fromUrl).length > 0) setFilters(fromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync Zustand → URL ───────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    URL_FILTER_KEYS.forEach((key) => {
      const val = filters[key];
      if (val && val !== ''
        && !(key === 'sort_by'  && val === 'created_at')
        && !(key === 'sort_dir' && val === 'desc')
        && !(key === 'per_page' && val === '12')
        && !(key === 'page'     && val === '1')) {
        params.set(key, val);
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const [sort_by, sort_dir] = e.target.value.split('__');
      setFilters({ sort_by, sort_dir });
    },
    [setFilters]
  );

  const meta        = data?.meta;
  const cars        = data?.data ?? [];
  const totalPages  = meta?.last_page ?? 1;
  const currentPage = meta?.current_page ?? 1;
  const sortValue   = `${filters.sort_by ?? 'created_at'}__${filters.sort_dir ?? 'desc'}`;
  const hasNextPage = currentPage < totalPages;

  // ── Infinite scroll sentinel (mobile only — lg: hidden) ──────────────
  const loadMore = useCallback(() => {
    if (!isFetching && hasNextPage) {
      setFilters({ page: String(currentPage + 1) });
    }
  }, [isFetching, hasNextPage, currentPage, setFilters]);
  const sentinelRef = useSentinel(loadMore, hasNextPage && !isFetching);

  // Desktop pagination
  const getPageNumbers = () => {
    const delta = 3;
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) range.push(i);
    return range;
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Mobile search bar */}
        <div className="lg:hidden mb-5">
          <SearchAutocomplete placeholder="Tìm xe theo tên, hãng..." />
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="section-title">Tìm xe</h1>
          {meta && (
            <p className="text-slate-500 mt-1">
              Tìm thấy{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{meta.total}</span> xe phù hợp
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar – Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <ArrowUpDown className="w-4 h-4" />
                <label htmlFor="sort-select" className="sr-only">Sắp xếp</label>
                <select
                  id="sort-select"
                  value={sortValue}
                  onChange={handleSortChange}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-100 bg-white px-3 py-2 shadow-sm">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <label htmlFor="search-start" className="sr-only">Ngày nhận xe</label>
                  <input
                    id="search-start"
                    type="date"
                    value={filters.start_date ?? ''}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters({ start_date: e.target.value, page: '1' })}
                    className="text-sm text-slate-700 outline-none"
                  />
                  <span className="text-slate-300">-</span>
                  <label htmlFor="search-end" className="sr-only">Ngày trả xe</label>
                  <input
                    id="search-end"
                    type="date"
                    value={filters.end_date ?? ''}
                    min={filters.start_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters({ end_date: e.target.value, page: '1' })}
                    className="text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isFetching && !isLoading && (
                  <span className="text-xs text-brand-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />Đang cập nhật...
                  </span>
                )}
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500">
                  <span>Hiển thị</span>
                  <select
                    value={filters.per_page ?? '12'}
                    onChange={(e) => setFilters({ per_page: e.target.value, page: '1' })}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    aria-label="Số xe mỗi trang"
                  >
                    {['6', '12', '24', '48'].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span>xe/trang</span>
                </div>
              </div>
            </div>

            {/* Error state */}
            {isError && (
              <div className="text-center py-24 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-slate-600">Không thể tải danh sách xe. Vui lòng thử lại.</p>
                <button onClick={() => window.location.reload()} className="btn-primary text-sm py-2">
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && cars.length === 0 && (
              <div className="text-center py-24 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <SlidersHorizontal className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">Không tìm thấy xe phù hợp</p>
                <p className="text-sm text-slate-400">Thử điều chỉnh bộ lọc để xem thêm kết quả.</p>
              </div>
            )}

            {/* Car Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {isLoading
                ? Array.from({ length: Number(filters.per_page ?? 12) }).map((_, i) => (
                    <CarCardSkeleton key={i} />
                  ))
                : cars.map((car) => <CarCard key={car.id} car={car} />)
              }
            </div>

            {/* Infinite scroll sentinel (mobile) */}
            <div ref={sentinelRef} className="lg:hidden h-4 mt-4" aria-hidden="true" />
            {isFetching && hasNextPage && (
              <div className="lg:hidden flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
              </div>
            )}

            {/* Pagination (desktop) */}
            {meta && totalPages > 1 && (
              <nav className="hidden lg:flex items-center justify-center gap-2 mt-10" aria-label="Phân trang">
                <button
                  onClick={() => setFilters({ page: String(currentPage - 1) })}
                  disabled={currentPage <= 1}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers()[0] > 1 && (
                  <>
                    <button onClick={() => setFilters({ page: '1' })}
                      className="w-9 h-9 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-brand-300 transition-all">1</button>
                    {getPageNumbers()[0] > 2 && <span className="text-slate-400 px-1">…</span>}
                  </>
                )}

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters({ page: String(page) })}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === currentPage
                        ? 'bg-brand-500 text-white shadow-orange'
                        : 'border border-slate-200 text-slate-600 hover:border-brand-300'
                    }`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}

                {getPageNumbers().at(-1)! < totalPages && (
                  <>
                    {getPageNumbers().at(-1)! < totalPages - 1 && <span className="text-slate-400 px-1">…</span>}
                    <button onClick={() => setFilters({ page: String(totalPages) })}
                      className="w-9 h-9 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-brand-300 transition-all">
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setFilters({ page: String(currentPage + 1) })}
                  disabled={currentPage >= totalPages}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
