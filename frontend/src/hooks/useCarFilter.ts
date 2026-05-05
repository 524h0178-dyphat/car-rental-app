import { useQuery } from '@tanstack/react-query';
import { carService } from '@/services/carService';
import { useFilterStore } from '@/stores/filterStore';

/** Hook dùng cho trang tìm xe – lấy danh sách xe theo filters */
export function useCarFilter() {
  const { filters } = useFilterStore();

  const query = useQuery({
    queryKey: ['cars', filters],
    queryFn: () => carService.getCars(filters),
    staleTime: 30_000,   // 30s cache
    placeholderData: (prev) => prev, // giữ data cũ khi đang fetch – tránh layout shift
  });

  return query;
}

/** Hook dùng cho homepage – lấy xe nổi bật */
export function useFeaturedCars() {
  return useQuery({
    queryKey: ['cars', 'featured'],
    queryFn: carService.getFeatured,
    staleTime: 60_000,
  });
}
