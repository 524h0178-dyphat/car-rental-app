import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import type { LoginPayload, RegisterPayload } from '@/types/auth';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ data, message }) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success(`Xin chào, ${data.user.name.split(' ').at(-1)}! 👋`, {
        description: message,
      });
      navigate('/');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Email hoặc mật khẩu không chính xác.';
      toast.error('Đăng nhập thất bại', { description: msg });
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token);
      toast.success('Đăng ký thành công! 🎉', {
        description: `Chào mừng ${data.user.name} đến với SkibidiCar!`,
      });
      navigate('/');
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).flat().join(', ')
        : err?.response?.data?.message ?? 'Đăng ký thất bại.';
      toast.error('Đăng ký thất bại', { description: msg });
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      toast.info('Đã đăng xuất');
      navigate('/');
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; phone?: string }) => {
      const { default: api } = await import('@/services/api');
      const res = await api.patch('/auth/profile', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Cập nhật thông tin thành công!');
    },
    onError: () => toast.error('Không thể cập nhật thông tin.'),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => {
      const { default: api } = await import('@/services/api');
      const res = await api.patch('/auth/password', payload);
      return res.data;
    },
    onSuccess: () => toast.success('Đổi mật khẩu thành công!'),
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Mật khẩu hiện tại không đúng.';
      toast.error('Đổi mật khẩu thất bại', { description: msg });
    },
  });
}
