import type { Location } from '@/types';
import api from './api';

export const locationService = {
  getLocations: async (): Promise<Location[]> => {
    const res = await api.get<{ data: Location[] }>('/locations');
    return res.data.data;
  },
};
