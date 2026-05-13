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

  /** POST /bookings/:id/mock-payment */
  mockPayment: async (id: number): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/mock-payment`);
    return res.data;
  },

  // ── Owner Routes ───────────────────────────────────────────────────

  /** GET /bookings/owner */
  ownerList: async (page = 1): Promise<PaginatedBookings> => {
    const res = await api.get('/bookings/owner', { params: { page } });
    return res.data;
  },

  /** POST /bookings/:id/owner-confirm */
  ownerConfirm: async (id: number): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/owner-confirm`);
    return res.data;
  },

  /** POST /bookings/:id/owner-reject */
  ownerReject: async (id: number, reason?: string): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/owner-reject`, { reason });
    return res.data;
  },

  /** POST /bookings/:id/pickup (Renter) */
  pickup: async (id: number): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/pickup`);
    return res.data;
  },

  /** POST /bookings/:id/reject-pickup (Renter) */
  rejectPickup: async (id: number): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/reject-pickup`);
    return res.data;
  },

  /** POST /bookings/:id/owner-handover */
  ownerHandover: async (id: number): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/owner-handover`);
    return res.data;
  },

  /** POST /bookings/:id/return */
  ownerReturn: async (id: number): Promise<{ message: string; data: Booking }> => {
    const res = await api.post(`/bookings/${id}/return`);
    return res.data;
  },
};
