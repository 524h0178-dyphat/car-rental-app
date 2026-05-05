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
