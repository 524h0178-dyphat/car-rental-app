import { useQuery } from '@tanstack/react-query';
import { filterMetaService } from '@/services/filterMetaService';

/**
 * Hook lấy filter metadata từ API (brands, provinces, fuels, etc.)
 * Cached 5 phút – data ít thay đổi.
 */
export function useFilterMeta() {
  return useQuery({
    queryKey: ['filter-meta'],
    queryFn: filterMetaService.getFilterMeta,
    staleTime: 5 * 60_000, // 5 minutes
  });
}
