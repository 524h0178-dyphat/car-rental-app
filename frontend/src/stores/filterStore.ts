import { create } from 'zustand';
import type { CarFilters } from '@/types';

interface FilterStore {
  filters: CarFilters;
  setFilters: (filters: Partial<CarFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: CarFilters = {
  sort_by: 'created_at',
  sort_dir: 'desc',
  per_page: '12',
  page: '1',
};

export const useFilterStore = create<FilterStore>((set) => ({
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      // Nếu đang thay đổi chính page thì giữ giá trị mới,
      // nếu thay đổi filter khác thì reset page về 1
      filters: {
        ...state.filters,
        ...newFilters,
        page: newFilters.page ?? '1',
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
