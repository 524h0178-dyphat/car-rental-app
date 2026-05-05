import type { Car, CarFilters, PaginatedResponse } from '@/types';
import api from './api';

export const carService = {
  /** GET /cars/featured – Homepage featured cars */
  getFeatured: async (): Promise<Car[]> => {
    const res = await api.get<{ data: Car[] }>('/cars/featured');
    return res.data.data;
  },

  /** GET /cars – Search/filter with pagination */
  getCars: async (filters: CarFilters): Promise<PaginatedResponse<Car>> => {
    // Remove empty values
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    const res = await api.get<PaginatedResponse<Car>>('/cars', { params });
    return res.data;
  },

  /** GET /cars/:slug – Detail page */
  getCarBySlug: async (slug: string): Promise<Car> => {
    const res = await api.get<{ data: Car }>(`/cars/${slug}`);
    return res.data.data;
  },
};
