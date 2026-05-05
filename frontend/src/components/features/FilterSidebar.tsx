import { memo, useCallback } from 'react';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { useFilterStore } from '@/stores/filterStore';
import { useFilterMeta } from '@/hooks/useFilterMeta';
import { formatPrice } from '@/utils/formatters';

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  id: string;
}

const FilterCheckbox = memo(({ label, checked, onChange, id }: FilterCheckboxProps) => (
  <label htmlFor={id} className="flex items-center gap-2 cursor-pointer group">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400"
    />
    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
      {label}
    </span>
  </label>
));

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function FilterSidebar() {
  const { filters, setFilters, resetFilters } = useFilterStore();
  const { data: meta, isLoading } = useFilterMeta();

  const toggleMulti = useCallback(
    (key: 'brand' | 'seats', value: string) => {
      const current = filters[key] ? filters[key]!.split(',').filter(Boolean) : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setFilters({ [key]: next.join(',') });
    },
    [filters, setFilters]
  );

  const seatsArr  = filters.seats  ? filters.seats.split(',')  : [];
  const brandsArr = filters.brand  ? filters.brand.split(',')  : [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-slate-100 rounded mb-3" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-4 bg-slate-50 rounded w-3/4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <aside aria-label="Bộ lọc xe">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-slate-900">Bộ lọc</h2>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
          aria-label="Xóa tất cả bộ lọc"
        >
          <X className="w-3 h-3" />
          Xóa tất cả
        </button>
      </div>

      <div className="flex flex-col gap-6">

        {/* Province – from API */}
        {meta?.provinces && meta.provinces.length > 0 && (
          <FilterSection title="Thành phố">
            <div className="flex flex-col gap-2">
              {meta.provinces.map((p) => (
                <FilterCheckbox
                  key={p}
                  id={`province-${p}`}
                  label={p}
                  checked={filters.province === p}
                  onChange={() => setFilters({ province: filters.province === p ? '' : p })}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Seats – from API */}
        {meta?.seats && meta.seats.length > 0 && (
          <FilterSection title="Số chỗ ngồi">
            <div className="flex gap-2 flex-wrap">
              {meta.seats.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleMulti('seats', String(s))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    seatsArr.includes(String(s))
                      ? 'bg-brand-500 text-white border-brand-500 shadow-orange'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  }`}
                  aria-pressed={seatsArr.includes(String(s))}
                >
                  {s} chỗ
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Transmission – from API */}
        {meta?.transmissions && meta.transmissions.length > 0 && (
          <FilterSection title="Hộp số">
            <div className="flex flex-col gap-2">
              {meta.transmissions.map((t) => (
                <FilterCheckbox
                  key={t}
                  id={`trans-${t}`}
                  label={t}
                  checked={filters.transmission === t}
                  onChange={() =>
                    setFilters({ transmission: filters.transmission === t ? '' : t })
                  }
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Fuel – from API */}
        {meta?.fuels && meta.fuels.length > 0 && (
          <FilterSection title="Nhiên liệu">
            <div className="flex flex-col gap-2">
              {meta.fuels.map((f) => (
                <FilterCheckbox
                  key={f}
                  id={`fuel-${f}`}
                  label={f}
                  checked={filters.fuel === f}
                  onChange={() => setFilters({ fuel: filters.fuel === f ? '' : f })}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Brand – from API */}
        {meta?.brands && meta.brands.length > 0 && (
          <FilterSection title="Hãng xe">
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {meta.brands.map((b) => (
                <FilterCheckbox
                  key={b}
                  id={`brand-${b}`}
                  label={b}
                  checked={brandsArr.includes(b)}
                  onChange={() => toggleMulti('brand', b)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price range */}
        <FilterSection title="Khoảng giá (VNĐ/ngày)">
          {meta?.price_range && (
            <p className="text-xs text-slate-400 mb-3">
              {formatPrice(meta.price_range.min)} – {formatPrice(meta.price_range.max)}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="price-min" className="text-xs text-slate-500 mb-1 block">
                Giá tối thiểu
              </label>
              <input
                id="price-min"
                type="number"
                placeholder={meta ? String(meta.price_range.min) : '500000'}
                value={filters.price_min ?? ''}
                onChange={(e) => setFilters({ price_min: e.target.value })}
                className="input-field text-sm"
                min={0}
                step={100_000}
              />
            </div>
            <div>
              <label htmlFor="price-max" className="text-xs text-slate-500 mb-1 block">
                Giá tối đa
              </label>
              <input
                id="price-max"
                type="number"
                placeholder={meta ? String(meta.price_range.max) : '5000000'}
                value={filters.price_max ?? ''}
                onChange={(e) => setFilters({ price_max: e.target.value })}
                className="input-field text-sm"
                min={0}
                step={100_000}
              />
            </div>
          </div>
        </FilterSection>

      </div>
    </aside>
  );
}
