import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Fuel, Settings } from 'lucide-react';
import type { Car } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { optimizeImageUrl, unsplashSrcSet } from '@/utils/imageUtils';
import { StarRating } from '@/components/features/ReviewsSection';
import { formatLocation } from '@/utils/location';

interface CarCardProps {
  car: Car;
}

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf';

function CarCard({ car }: CarCardProps) {
  const rawImg  = car.primary_image ?? PLACEHOLDER_IMG;
  const img     = optimizeImageUrl(rawImg, 600);
  const srcSet  = unsplashSrcSet(rawImg);

  return (
    <article className="card group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={img}
          srcSet={srcSet || undefined}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        {/* Status badge */}
        {car.status === 'available' && (
          <span className="badge absolute top-3 left-3 bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Có sẵn
          </span>
        )}
        {/* Brand badge */}
        <span className="badge absolute top-3 right-3 bg-white/90 text-slate-700 font-semibold">
          {car.brand}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Location */}
        {car.location && (
          <p className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            <MapPin className="w-3 h-3" />
            {formatLocation(car.location)}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-base mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors">
          {car.name}
        </h3>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {car.seats} chỗ
          </span>
          <span className="flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" />
            {car.transmission}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" />
            {car.fuel}
          </span>
          <span className="ml-auto font-medium text-slate-700">{car.year}</span>
        </div>

        {/* Rating placeholder + Price */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <StarRating rating={4.5} />
          <span className="text-xs text-slate-400 ml-1">(12)</span>
          <div className="text-right">
            <p className="text-xs text-slate-400">Chỉ từ</p>
            <p className="font-bold text-brand-500 text-lg leading-tight">
              {formatPrice(car.price_per_day)}
              <span className="text-xs font-normal text-slate-400">/ngày</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/xe/${car.slug}`}
          className="btn-primary w-full justify-center mt-3 py-2.5 text-sm"
          aria-label={`Xem chi tiết ${car.name}`}
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

// Skeleton loader
export function CarCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-3/4" />
        <div className="flex gap-3">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-12" />
        </div>
        <div className="skeleton h-10 w-full mt-2" />
      </div>
    </div>
  );
}

export default memo(CarCard);
