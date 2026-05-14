import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { BookingStatus } from '@/types/booking';

interface AdminStats {
  total_cars: number;
  available_cars: number;
  total_users: number;
  total_bookings: number;
  revenue: number;
  total_amount: number;
  bookings_status: Record<BookingStatus, number>;
  recent_bookings: Array<{
    id: number;
    status: BookingStatus;
    status_label: string;
    total_price: number;
    renter_name: string;
    start_date: string;
    end_date: string;
    car_name: string;
    car_slug: string;
    created_at: string;
  }>;
  monthly_revenue: Array<{
    year: number;
    month: number;
    revenue: number;
    count: number;
  }>;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get<{ data: AdminStats }>('/admin/stats');
      return res.data.data;
    },
    staleTime: 60_000, // 1 minute
  });
}

export function useAdminBookings(page = 1, status?: string, search?: string) {
  return useQuery({
    queryKey: ['admin-bookings', page, status, search],
    queryFn: async () => {
      const res = await api.get('/admin/bookings', { params: { page, status, search } });
      return res.data;
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: BookingStatus }) => {
      const res = await api.patch(`/admin/bookings/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// ── Car Submissions ────────────────────────────────────────────────────────────

export type SubmissionStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

export interface CarSubmissionItem {
  id: number;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  transmission: string;
  fuel: string;
  seats: number;
  expected_price_per_day: number;
  location_province: string;
  description: string;
  status: SubmissionStatus;
  status_label: string;
  reject_reason: string | null;
  user: { id: number; name: string } | null;
  created_at: string;
  is_car_deleted?: boolean;
}

export function useAdminCarSubmissions(page = 1, status?: string, search?: string) {
  return useQuery({
    queryKey: ['admin-car-submissions', page, status, search],
    queryFn: async () => {
      const res = await api.get('/admin/car-submissions', { params: { page, status, search } });
      return res.data as { data: CarSubmissionItem[]; meta: { total: number; last_page: number; current_page: number } };
    },
  });
}

export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reject_reason }: { id: number; status: SubmissionStatus; reject_reason?: string }) => {
      const res = await api.patch(`/admin/car-submissions/${id}/status`, { status, reject_reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-car-submissions'] });
    },
  });
}
