import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bookingService } from '@/services/bookingService';
import type { StoreBookingPayload } from '@/types/booking';

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StoreBookingPayload) => bookingService.store(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Đặt xe thành công! 🎉', {
        description: `Mã đơn #${String(res.data.id).padStart(6, '0')}. Chúng tôi sẽ liên hệ trong 30 phút.`,
        duration: 6000,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Không thể đặt xe. Vui lòng thử lại.';
      toast.error('Đặt xe thất bại', { description: msg });
    },
  });
}

export function useMyBookings(page = 1) {
  return useQuery({
    queryKey: ['my-bookings', page],
    queryFn: () => bookingService.list(page),
  });
}

export function useBookingDetail(id: number) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.get(id),
    enabled: !!id,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      bookingService.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      toast.success('Đã hủy đơn thuê xe');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Không thể hủy đơn.';
      toast.error('Hủy đơn thất bại', { description: msg });
    },
  });
}

export function useMockPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingService.mockPayment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      toast.success('Thanh toán mô phỏng thành công! 🎉');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Lỗi khi mô phỏng thanh toán.';
      toast.error('Thanh toán thất bại', { description: msg });
    },
  });
}

export function useOwnerHandover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingService.ownerHandover(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['owner-bookings'] });
      toast.success(res.message || 'Đã bàn giao xe.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Lỗi khi bàn giao xe.';
      toast.error('Bàn giao thất bại', { description: msg });
    },
  });
}

export function usePickupBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingService.pickup(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      toast.success(res.message || 'Xác nhận lấy xe thành công.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Lỗi xác nhận lấy xe.';
      toast.error('Lỗi', { description: msg });
    },
  });
}

export function useRejectPickup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingService.rejectPickup(id),
    onSuccess: (res, id) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      toast.success(res.message || 'Đã báo cáo không nhận được xe.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Lỗi khi báo cáo.';
      toast.error('Lỗi', { description: msg });
    },
  });
}
