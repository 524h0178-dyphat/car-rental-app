import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Users, Fuel, Settings, Calendar, ChevronLeft,
  ChevronRight, Shield, Check, ArrowLeft, Loader2, Lock,
} from 'lucide-react';
import { useCarAvailability, useCarDetail } from '@/hooks/useCarDetail';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/utils/formatters';
import { formatLocation } from '@/utils/location';
import ReviewsSection from '@/components/features/ReviewsSection';
import SEO from '@/components/common/SEO';
import JsonLdBreadcrumb, { JsonLdVehicle } from '@/components/common/JsonLd';

// ─── Image Carousel ──────────────────────────────────────────────────────
function ImageCarousel({ images }: { images: { image_url: string; is_primary: boolean }[] }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-slate-100 flex items-center justify-center">
        <span className="text-slate-400 text-sm">Không có ảnh</span>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-[16/9] group">
      <img
        src={images[current]?.image_url}
        alt={`Ảnh xe ${current + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((p) => (p - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrent((p) => (p + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Ảnh tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-200 ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
            }`}
            aria-label={`Ảnh ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
        {current + 1} / {images.length}
      </span>
    </div>
  );
}

// ─── Booking Form (Sticky) ───────────────────────────────────────────────
function BookingFormSticky({ pricePerDay, slug }: { pricePerDay: number; slug: string }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const { isAuthenticated } = useAuthStore();
  const { data: unavailable = [] } = useCarAvailability(slug);

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
    )
  );
  const total = days * pricePerDay;
  const hasConflict = unavailable.some((range) =>
    startDate < range.end_date && endDate > range.start_date
  );

  return (
    <div className="card dark:bg-slate-800 p-6 sticky top-24" aria-label="Form đặt xe">
      <h2 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">Đặt xe</h2>
      <p className="text-brand-500 font-bold text-2xl mb-5">
        {formatPrice(pricePerDay)}<span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ngày</span>
      </p>

      <div className="space-y-3 mb-5">
        <div>
          <label htmlFor="detail-start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Ngày nhận xe
          </label>
          <input
            id="detail-start"
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="detail-end" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Ngày trả xe
          </label>
          <input
            id="detail-end"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {unavailable.length > 0 && (
        <div className="mb-5 rounded-xl border border-cyan-100 dark:border-cyan-900/30 bg-cyan-50/60 dark:bg-cyan-900/20 p-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            Lịch đã có người đặt
          </p>
          <div className="space-y-1.5">
            {unavailable.slice(0, 4).map((range) => (
              <div key={range.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{range.start_date}</span>
                <span className="text-slate-300 dark:text-slate-600">đến</span>
                <span>{range.end_date}</span>
              </div>
            ))}
          </div>
          {unavailable.length > 4 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">+{unavailable.length - 4} khoảng ngày khác</p>
          )}
        </div>
      )}

      {hasConflict && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Khoảng ngày này đã có người đặt. Vui lòng chọn ngày khác.
        </div>
      )}

      {/* Price breakdown */}
      <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>{formatPrice(pricePerDay)} × {days} ngày</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Phí dịch vụ</span>
          <span className="text-green-600">Miễn phí</span>
        </div>
        <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-slate-900">
          <span>Tổng cộng</span>
          <span className="text-brand-500">{formatPrice(total)}</span>
        </div>
      </div>

      {isAuthenticated ? (
        <Link
          to={`/dat-xe/${slug}?start=${startDate}&end=${endDate}`}
          aria-disabled={hasConflict}
          onClick={(e) => { if (hasConflict) e.preventDefault(); }}
          className={`btn-primary w-full justify-center ${hasConflict ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          Đặt xe ngay
        </Link>
      ) : (
        <Link
          to={`/dang-nhap`}
          state={{ from: { pathname: `/dat-xe/${slug}` } }}
          className="w-full justify-center flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm transition-all duration-200"
        >
          <Lock className="w-4 h-4" />
          Đăng nhập để đặt xe
        </Link>
      )}

      <p className="text-xs text-center text-slate-400 mt-3">
        Chưa bị trừ tiền. Xác nhận sau khi hoàn tất thông tin.
      </p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function CarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: car, isLoading, isError } = useCarDetail(slug ?? '');

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-lg">Xe không tồn tại hoặc đã bị xóa.</p>
        <Link to="/tim-xe" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Quay lại tìm xe
        </Link>
      </div>
    );
  }

  const specs = [
    { icon: Users,    label: 'Số chỗ',    value: `${car.seats} chỗ ngồi` },
    { icon: Settings, label: 'Hộp số',    value: car.transmission },
    { icon: Fuel,     label: 'Nhiên liệu',value: car.fuel },
    { icon: Calendar, label: 'Đời xe',    value: String(car.year) },
  ];

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950">
      <SEO
        title={car.name}
        description={car.description ?? `Thuê ${car.name} tại ${car.location ?? 'Việt Nam'}. Giá chỉ ${formatPrice(car.price_per_day)}/ngày.`}
        image={car.images?.[0]?.image_url}
        url={`/xe/${car.slug}`}
      />
      <JsonLdBreadcrumb items={[
        { name: 'Trang chủ', url: '/' },
        { name: 'Tìm xe',    url: '/tim-xe' },
        { name: car.name,    url: `/xe/${car.slug}` },
      ]} />
      <JsonLdVehicle
        name={car.name}
        brand={car.brand}
        price={car.price_per_day}
        seats={car.seats}
        image={car.images?.[0]?.image_url}
        url={`/xe/${car.slug}`}
        description={car.description}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
          <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/tim-xe" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Tìm xe</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{car.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="badge bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 mb-2">{car.brand}</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{car.name}</h1>
                </div>
              </div>
              {car.location && (
                <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mt-1">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  {formatLocation(car.location)}
                </p>
              )}
            </div>

            {/* Carousel */}
            <ImageCarousel images={car.images ?? []} />

            {/* Specs */}
            <div className="card dark:bg-slate-800 p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Thông số kỹ thuật</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-500" />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="card dark:bg-slate-800 p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Tính năng nổi bật</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {car.features.map((feature) => (
                    <div key={feature.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      {feature.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="card dark:bg-slate-800 p-6">
                <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Mô tả xe</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                  {car.description}
                </p>
              </div>
            )}

            {/* Rental Policy */}
            <div className="card dark:bg-slate-800 p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-500" />
                Chính sách thuê xe
              </h2>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {[
                  'Cần cung cấp CCCD/Hộ chiếu hợp lệ',
                  'Bằng lái xe phù hợp với loại xe',
                  'Đặt cọc theo quy định của chủ xe',
                  'Giao nhận xe đúng giờ theo hợp đồng',
                  'Bồi thường thiệt hại nếu xảy ra sự cố',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <ReviewsSection carName={car.name} carId={car.id} />

          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-1">
            <BookingFormSticky pricePerDay={car.price_per_day} slug={car.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
