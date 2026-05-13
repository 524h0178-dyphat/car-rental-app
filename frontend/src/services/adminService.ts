import api from './api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'blocked';
  created_at: string;
}

export interface AdminCar {
  id: number;
  name: string;
  brand: string;
  model?: string;
  price_per_day: number;
  status: string;
  deleted_at?: string;
}

export interface AdminReview {
  id: number;
  rating: number;
  comment?: string;
  status: string;
  deleted_at?: string;
  created_at: string;
  user?: { id: number; name: string };
  car?: { id: number; name: string };
}

export interface PaginatedMeta {
  total: number;
  current_page: number;
  last_page: number;
}

export const adminService = {
  // ── Users ────────────────────────────────────────────────────────────

  getUsers: async (params?: { search?: string; status?: string; page?: number }) => {
    const res = await api.get('/admin/users', { params });
    return res.data as { data: AdminUser[]; meta: PaginatedMeta };
  },

  updateUserStatus: async (id: number, status: 'active' | 'blocked') => {
    const res = await api.patch(`/admin/users/${id}/status`, { status });
    return res.data as { message: string };
  },

  // ── Cars ─────────────────────────────────────────────────────────────

  getCars: async (params?: { search?: string; status?: string; page?: number }) => {
    const res = await api.get('/admin/cars', { params });
    return res.data as { data: AdminCar[]; meta: PaginatedMeta };
  },

  createCar: async (payload: Record<string, unknown>) => {
    const res = await api.post('/admin/cars', payload);
    return res.data;
  },

  updateCar: async (id: number, payload: Record<string, unknown>) => {
    const res = await api.put(`/admin/cars/${id}`, payload);
    return res.data;
  },

  hideCar: async (id: number) => {
    const res = await api.patch(`/admin/cars/${id}/hide`);
    return res.data;
  },

  deleteCar: async (id: number) => {
    const res = await api.delete(`/admin/cars/${id}`);
    return res.data;
  },

  // ── Bookings ─────────────────────────────────────────────────────────

  getBookings: async (params?: { status?: string; search?: string; page?: number }) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  updateBookingStatus: async (id: number, status: string) => {
    const res = await api.patch(`/admin/bookings/${id}/status`, { status });
    return res.data;
  },

  // ── Car Submissions ───────────────────────────────────────────────────

  getSubmissions: async (params?: { status?: string; page?: number }) => {
    const res = await api.get('/admin/car-submissions', { params });
    return res.data;
  },

  approveSubmission: async (id: number) => {
    const res = await api.patch(`/admin/car-submissions/${id}/approve`);
    return res.data;
  },

  rejectSubmission: async (id: number, rejection_reason?: string) => {
    const res = await api.patch(`/admin/car-submissions/${id}/reject`, { rejection_reason });
    return res.data;
  },

  // ── Reviews ───────────────────────────────────────────────────────────

  getReviews: async (params?: { status?: string; page?: number }) => {
    const res = await api.get('/admin/reviews', { params });
    return res.data as { data: AdminReview[]; meta: PaginatedMeta };
  },

  hideReview: async (id: number) => {
    const res = await api.patch(`/admin/reviews/${id}/hide`);
    return res.data;
  },

  deleteReview: async (id: number) => {
    const res = await api.delete(`/admin/reviews/${id}`);
    return res.data;
  },

  // ── Stats ─────────────────────────────────────────────────────────────

  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
};
