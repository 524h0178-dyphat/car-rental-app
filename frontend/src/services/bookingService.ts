import api from './api';
import type { Booking, StoreBookingPayload } from '@/types/booking';

interface PaginatedBookings {
  data: Booking[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export const bookingService = {
  /** POST /bookings — create a new booking */
  store: async (payload: StoreBookingPayload): Promise<{ message: string; data: Booking }> => {
    const res = await api.post('/bookings', payload);
    return res.data;
  },

  /** GET /bookings — list current user's bookings */
  list: async (page = 1): Promise<PaginatedBookings> => {
    const res = await api.get('/bookings', { params: { page } });
    return res.data;
  },

  /** GET /bookings/:id */
  get: async (id: number): Promise<{ data: Booking }> => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  /** POST /bookings/:id/cancel */
  cancel: async (id: number, reason?: string): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },
};
