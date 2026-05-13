import { useQuery } from '@tanstack/react-query';
import { carService } from '@/services/carService';
import { reviewService } from '@/services/reviewService';

export function useCarDetail(slug: string) {
  return useQuery({
    queryKey: ['car', slug],
    queryFn: () => carService.getCarBySlug(slug),
    enabled: !!slug,
    staleTime: 120_000,
  });
}

export function useCarAvailability(slug: string) {
  return useQuery({
    queryKey: ['car', slug, 'availability'],
    queryFn: () => carService.getAvailability(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useCarReviews(carId: number, page = 1) {
  return useQuery({
    queryKey: ['car', carId, 'reviews', page],
    queryFn: () => reviewService.carReviews(carId, page),
    enabled: !!carId,
    staleTime: 60_000,
  });
}
