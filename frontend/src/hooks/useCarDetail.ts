import { useQuery } from '@tanstack/react-query';
import { carService } from '@/services/carService';

export function useCarDetail(slug: string) {
  return useQuery({
    queryKey: ['car', slug],
    queryFn: () => carService.getCarBySlug(slug),
    enabled: !!slug,
    staleTime: 120_000,
  });
}
