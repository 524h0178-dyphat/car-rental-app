import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatters';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Plus, ChevronRight } from 'lucide-react';
import api from '@/services/api';

interface Submission {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  status_label: string;
  reject_reason?: string;
  created_at: string;
  car_id?: number;
  slug?: string;
  price?: number;
  car_status?: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  pending:   { color: 'text-amber-700',  bg: 'bg-amber-100',  icon: Clock         },
  reviewing: { color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Clock         },
  approved:  { color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle2  },
  rejected:  { color: 'text-red-600',    bg: 'bg-red-100',    icon: XCircle       },
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cfg = STATUS_CONFIG[status] ?? { color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function useMySubmissions() {
  return useQuery<{ data: Submission[] }>({
    queryKey: ['car-submissions-my'],
    queryFn: async () => {
      const res = await api.get('/car-submissions/my');
      return res.data;
    },
  });
}

export default function MyCarSubmissionsPage() {
  const { data, isLoading, isError } = useMySubmissions();
  const [editingCar, setEditingCar] = useState<{ id: number; price: number; status: string } | null>(null);
  const queryClient = useQueryClient();

  const updateCar = useMutation({
    mutationFn: async (vars: { id: number; price: number; status: string }) => {
      const res = await api.put(`/cars/${vars.id}`, {
        price_per_day: vars.price,
        status: vars.status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-submissions-my'] });
      setEditingCar(null);
    },
  });

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Đơn ký gửi xe của tôi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Theo dõi trạng thái các đơn ký gửi xe bạn đã gửi
            </p>
          </div>
          <Link
            to="/ky-gui-xe"
            id="new-submission-btn"
            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ký gửi thêm
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse dark:bg-slate-800">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Không thể tải danh sách đơn ký gửi.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!data?.data || data.data.length === 0) && (
          <div className="text-center py-20 flex flex-col items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">Bạn chưa có đơn ký gửi xe nào</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Ký gửi xe của bạn để kiếm thêm thu nhập!</p>
            <Link to="/ky-gui-xe" className="btn-primary mt-2">
              Ký gửi xe ngay
            </Link>
          </div>
        )}

        {/* Submission list */}
        {!isLoading && data?.data && data.data.length > 0 && (
          <div className="flex flex-col gap-4">
            {data.data.map((submission) => (
              <div key={submission.id} className="card p-5 hover:shadow-card-hover transition-all duration-200 dark:bg-slate-800">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mb-1">
                      #{String(submission.id).padStart(6, '0')}
                    </p>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                      {submission.brand} {submission.model} {submission.year}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Biển số: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{submission.license_plate}</span>
                    </p>
                    
                    {submission.status === 'approved' && (
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          submission.car_status === 'available' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {submission.car_status === 'available' ? '✓ Đang cho thuê' : '⏳ Đang bảo dưỡng'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          Giá: {formatPrice(submission.price ?? 0)}/ngày
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                      Gửi lúc: {new Date(submission.created_at).toLocaleDateString('vi-VN')}
                    </p>

                    {/* Rejection reason */}
                    {submission.status === 'rejected' && submission.reject_reason && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-0.5">Lý do từ chối:</p>
                        <p className="text-sm text-red-600 dark:text-red-300">{submission.reject_reason}</p>
                      </div>
                    )}

                    {/* Approved message */}
                    {submission.status === 'approved' && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-lg flex items-center justify-between gap-2">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          ✓ Xe của bạn đã được duyệt!
                        </p>
                        {submission.car_id && (
                          <button
                            onClick={() => setEditingCar({ id: submission.car_id!, price: submission.price ?? 500000, status: submission.car_status ?? 'available' })}
                            className="btn-outline py-1.5 px-3 text-xs border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 flex-shrink-0"
                          >
                            Quản lý xe
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <StatusBadge status={submission.status} label={submission.status_label} />
                    <Link
                      to={`/ky-gui-xe/${submission.id}`}
                      className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
                    >
                      Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal chỉnh sửa xe */}
        {editingCar && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quản lý xe cho thuê</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Giá thuê (VNĐ/ngày)
                  </label>
                  <input
                    type="number"
                    value={editingCar.price}
                    onChange={(e) => setEditingCar({ ...editingCar, price: parseInt(e.target.value) })}
                    className="input-field"
                    step={50000}
                    min={100000}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={editingCar.status}
                    onChange={(e) => setEditingCar({ ...editingCar, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="available">Cho thuê (Có sẵn)</option>
                    <option value="maintenance">Tạm ngưng (Bảo dưỡng)</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditingCar(null)}
                    className="btn-outline flex-1 justify-center py-2"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => updateCar.mutate(editingCar)}
                    disabled={updateCar.isPending}
                    className="btn-primary flex-1 justify-center py-2"
                  >
                    {updateCar.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
