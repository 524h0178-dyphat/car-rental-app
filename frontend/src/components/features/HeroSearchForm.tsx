import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ChevronDown } from 'lucide-react';
import { useFilterMeta } from '@/hooks/useFilterMeta';
import { useFilterStore } from '@/stores/filterStore';

export default function HeroSearchForm() {
  const navigate = useNavigate();
  const { data: meta } = useFilterMeta();
  const { setFilters } = useFilterStore();

  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const [province,  setProvince]  = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate,   setEndDate]   = useState(tomorrow);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Push province filter into Zustand so SearchPage picks it up instantly
      setFilters({
        province: province || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      const params = new URLSearchParams();
      if (province)  params.set('province',   province);
      if (startDate) params.set('start_date', startDate);
      if (endDate)   params.set('end_date',   endDate);
      navigate(`/tim-xe?${params.toString()}`);
    },
    [province, startDate, endDate, navigate, setFilters]
  );

  // Provinces from API, fallback to common ones
  const provinces = meta?.provinces?.length
    ? meta.provinces
    : ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Nha Trang'];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2"
      aria-label="Form tìm xe nhanh"
    >
      {/* Location */}
      <div className="flex-1 relative">
        <label htmlFor="hero-location" className="sr-only">Địa điểm</label>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-100 hover:border-brand-300 transition-colors">
          <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium">Địa điểm</p>
            <div className="relative">
              <select
                id="hero-location"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full text-sm font-medium text-slate-800 bg-transparent appearance-none outline-none pr-4"
              >
                <option value="">Chọn thành phố...</option>
                {provinces.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px bg-slate-100 my-2" />

      {/* Start Date */}
      <div className="flex-1">
        <label htmlFor="hero-start" className="sr-only">Ngày nhận xe</label>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-100 hover:border-brand-300 transition-colors">
          <Calendar className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium">Ngày nhận xe</p>
            <input
              id="hero-start"
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm font-medium text-slate-800 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px bg-slate-100 my-2" />

      {/* End Date */}
      <div className="flex-1">
        <label htmlFor="hero-end" className="sr-only">Ngày trả xe</label>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-100 hover:border-brand-300 transition-colors">
          <Calendar className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-medium">Ngày trả xe</p>
            <input
              id="hero-end"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-sm font-medium text-slate-800 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary px-8 rounded-xl flex items-center gap-2 whitespace-nowrap"
      >
        <Search className="w-4 h-4" />
        Tìm xe
      </button>
    </form>
  );
}
