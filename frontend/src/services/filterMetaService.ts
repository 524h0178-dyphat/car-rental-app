import api from './api';

export interface FilterMeta {
  brands: string[];
  provinces: string[];
  transmissions: string[];
  fuels: string[];
  seats: number[];
  features: { id: number; name: string; icon: string }[];
  price_range: { min: number; max: number };
}

export const filterMetaService = {
  getFilterMeta: async (): Promise<FilterMeta> => {
    const res = await api.get<{ data: FilterMeta }>('/filter-meta');
    return res.data.data;
  },
};
