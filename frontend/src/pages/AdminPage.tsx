import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Car, Users, Calendar, TrendingUp,
  Search, RefreshCw, BarChart3,
  CheckCircle2, Clock, Truck, XCircle, FileText,
  Star, EyeOff, Trash2, Lock, Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  useAdminStats, useAdminBookings, useUpdateBookingStatus,
  useAdminCarSubmissions, useUpdateSubmissionStatus,
} from '@/hooks/useAdmin';
import type { CarSubmissionItem, SubmissionStatus } from '@/hooks/useAdmin';
import { formatPrice } from '@/utils/formatters';
import type { BookingStatus } from '@/types/booking';
import { adminService } from '@/services/adminService';

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="card p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<BookingStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',  icon: Clock        },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',    icon: CheckCircle2 },
  active:    { label: 'Đang thuê',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   icon: Truck        },
  completed: { label: 'Hoàn thành',   color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',   icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy',       color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',       icon: XCircle      },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

// ── Status updater dropdown ──────────────────────────────────────────────────
const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['active', 'cancelled'],
  active:    ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function StatusUpdater({ id, current }: { id: number; current: BookingStatus }) {
  const update = useUpdateBookingStatus();
  const nexts  = NEXT_STATUSES[current];

  if (!nexts.length) return <StatusBadge status={current} />;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={current} />
      <div className="flex flex-wrap items-center gap-1.5">
        {nexts.map((s) => (
          <button
            key={s}
            onClick={() =>
              update.mutate({ id, status: s }, {
                onSuccess: () => toast.success(`Đã cập nhật → ${STATUS_CFG[s].label}`),
                onError: ()   => toast.error('Cập nhật thất bại'),
              })
            }
            disabled={update.isPending}
            className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            → {STATUS_CFG[s].label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Submission status config ─────────────────────────────────────────────────
const SUB_STATUS_CFG: Record<SubmissionStatus, { label: string; color: string }> = {
  pending:   { label: 'Chờ xét duyệt', color: 'bg-amber-100 text-amber-700' },
  reviewing: { label: 'Đang xem xét',  color: 'bg-blue-100 text-blue-700'   },
  approved:  { label: 'Đã duyệt',      color: 'bg-green-100 text-green-700' },
  rejected:  { label: 'Từ chối',       color: 'bg-red-100 text-red-600'     },
};

function SubmissionStatusUpdater({ item }: { item: CarSubmissionItem }) {
  const update = useUpdateSubmissionStatus();
  const nexts: SubmissionStatus[] = item.status === 'pending'
    ? ['reviewing', 'approved', 'rejected']
    : item.status === 'reviewing'
      ? ['approved', 'rejected']
      : [];
  const cfg = SUB_STATUS_CFG[item.status];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        {cfg.label}
      </span>
      {nexts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {nexts.map((s) => (
            <button
              key={s}
              onClick={() => update.mutate(
                { id: item.id, status: s },
                {
                  onSuccess: () => toast.success(`Đã cập nhật → ${SUB_STATUS_CFG[s].label}`),
                  onError: () => toast.error('Cập nhật thất bại'),
                }
              )}
              disabled={update.isPending}
              className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              → {SUB_STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Car Submissions Table ─────────────────────────────────────────────────────
function CarSubmissionsTable() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery]   = useState('');
  const { data, isLoading, refetch } = useAdminCarSubmissions(page, status || undefined, query || undefined);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-500" />
          Quản lý xe ký gửi
        </h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            aria-label="Lọc trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(SUB_STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên / SĐT / Biển số..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setQuery(search); setPage(1); } }}
              className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 dark:text-white"
            />
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" aria-label="Tải lại">
            <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {['Mã', 'Xe', 'Chủ xe', 'Biển số', 'Giá dự kiến/ngày', 'Tỉnh/TP', 'Trạng thái'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              : !data?.data?.length
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                      Chưa có yêu cầu ký gửi xe nào.
                    </td>
                  </tr>
                )
                : data.data.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">#{String(s.id).padStart(4, '0')}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-white">{s.brand} {s.model}</p>
                      <p className="text-xs text-slate-400">{s.year} · {s.seats} chỗ · {s.fuel}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-white">{s.owner_name}</p>
                      <p className="text-xs text-slate-400">{s.owner_phone}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{s.license_plate}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{formatPrice(s.expected_price_per_day)}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{s.location_province}</td>
                    <td className="px-4 py-3"><SubmissionStatusUpdater item={s} /></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 dark:text-slate-400">{data.meta.total} yêu cầu · Trang {page}/{data.meta.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Trước</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.meta.last_page} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Bookings table ───────────────────────────────────────────────────────────
function BookingsTable() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery]   = useState('');

  const { data, isLoading, refetch } = useAdminBookings(page, status || undefined, query || undefined);

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-500" />
          Quản lý đơn thuê xe
        </h2>
        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên / SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setQuery(search); setPage(1); } }}
              className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 dark:text-white"
            />
          </div>

          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            aria-label="Tải lại"
          >
            <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {['Mã đơn', 'Xe', 'Người thuê', 'Thời gian', 'Tổng tiền', 'Trạng thái'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data?.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      #{String(b.id).padStart(6, '0')}
                    </td>
                    <td className="px-4 py-3">
                      {b.car?.slug ? (
                        <Link to={`/xe/${b.car.slug}`} className="text-brand-600 hover:underline font-medium truncate block max-w-[140px]">
                          {b.car?.name ?? '—'}
                        </Link>
                      ) : <span className="text-slate-500 dark:text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-white">{b.renter_name}</p>
                      <p className="text-xs text-slate-400">{b.renter_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <p>{b.start_date}</p>
                      <p className="text-xs text-slate-400">{b.total_days} ngày</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {formatPrice(b.total_price)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusUpdater id={b.id} current={b.status} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data.meta.total} đơn · Trang {page}/{data.meta.last_page}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Trước
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.meta.last_page}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Users Table ──────────────────────────────────────────────────────────────
function UsersTable() {
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery]   = useState('');
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, query, status],
    queryFn: () => adminService.getUsers({ search: query || undefined, status: status || undefined, page }),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'blocked' }) =>
      adminService.updateUserStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'blocked' ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Cập nhật thất bại.'),
  });

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-500" /> Quản lý thành viên
        </h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Đã khóa</option>
          </select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên / Email / SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setQuery(search); setPage(1); } }}
              className="pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 dark:text-white"
            />
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" aria-label="Tải lại">
            <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {['ID', 'Tên', 'Email', 'Điện thoại', 'Trạng thái', 'Ngày tạo', 'Hành động'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              : !data?.data?.length
                ? (<tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">Không có người dùng nào.</td></tr>)
                : data.data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">#{u.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {u.status === 'active' ? <><CheckCircle2 className="w-3 h-3" />Hoạt động</> : <><XCircle className="w-3 h-3" />Đã khóa</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      <button
                        id={`toggle-user-${u.id}`}
                        onClick={() => toggleStatus.mutate({ id: u.id, status: u.status === 'active' ? 'blocked' : 'active' })}
                        disabled={toggleStatus.isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          u.status === 'active'
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-700 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {u.status === 'active' ? <><Lock className="w-3 h-3" />Khóa</> : <><Unlock className="w-3 h-3" />Mở khóa</>}
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 dark:text-slate-400">{data.meta.total} người dùng · Trang {page}/{data.meta.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Trước</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.meta.last_page} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reviews Table ─────────────────────────────────────────────────────────────
function ReviewsTable() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews', page, status],
    queryFn: () => adminService.getReviews({ status: status || undefined, page }),
  });

  const hide = useMutation({
    mutationFn: (id: number) => adminService.hideReview(id),
    onSuccess: () => { toast.success('Đã ẩn đánh giá.'); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
    onError: () => toast.error('Thao tác thất bại.'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminService.deleteReview(id),
    onSuccess: () => { toast.success('Đã xóa đánh giá.'); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
    onError: () => toast.error('Thao tác thất bại.'),
  });

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-brand-500" /> Kiểm duyệt đánh giá
        </h2>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">Tất cả</option>
            <option value="visible">Hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" aria-label="Tải lại">
            <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {['ID', 'Người dùng', 'Xe', 'Sao', 'Nhận xét', 'Trạng thái', 'Hành động'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              : !data?.data?.length
                ? (<tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">Chưa có đánh giá nào.</td></tr>)
                : data.data.map((r) => (
                  <tr key={r.id} className={`hover:bg-slate-50/50 transition-colors ${r.deleted_at ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">#{r.id}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{r.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">{r.car?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{r.comment ?? <span className="text-slate-300 italic">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.status === 'visible' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 dark:text-slate-400'
                      }`}>
                        {r.status === 'visible' ? 'Hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {r.status === 'visible' && !r.deleted_at && (
                          <button
                            id={`hide-review-${r.id}`}
                            onClick={() => { if (confirm('Ẩn đánh giá này?')) hide.mutate(r.id); }}
                            disabled={hide.isPending}
                            className="p-1.5 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                            title="Ẩn"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        {!r.deleted_at && (
                          <button
                            id={`delete-review-${r.id}`}
                            onClick={() => { if (confirm('Xóa vĩnh viễn đánh giá này?')) remove.mutate(r.id); }}
                            disabled={remove.isPending}
                            className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 dark:text-slate-400">{data.meta.total} đánh giá · Trang {page}/{data.meta.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Trước</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.meta.last_page} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'submissions' | 'users' | 'reviews'>('bookings');
  const { data: stats, isLoading } = useAdminStats();

  // Guard: only admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const MONTH_NAMES = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-brand-500" />
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quản lý xe và đơn thuê của SkibidiCar</p>
          </div>
          <Link to="/" className="btn-outline text-sm py-2 px-4">
            Xem trang web
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse h-28">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                  <div className="h-6 bg-slate-100 rounded w-1/3" />
                </div>
              ))
            : [
                { label: 'Tổng xe',       value: stats?.total_cars     ?? 0, sub: `${stats?.available_cars ?? 0} xe còn trống`,  icon: Car,         color: 'bg-brand-500' },
                { label: 'Người dùng',    value: stats?.total_users    ?? 0, sub: 'Khách hàng đã đăng ký',                        icon: Users,       color: 'bg-blue-500'  },
                { label: 'Tổng đơn',      value: stats?.total_bookings ?? 0, sub: `${stats?.bookings_status?.pending ?? 0} chờ xác nhận`, icon: Calendar,    color: 'bg-sky-500'},
                { label: 'Doanh thu',     value: formatPrice(stats?.revenue ?? 0), sub: 'Từ đơn đã xác nhận',                   icon: TrendingUp,  color: 'bg-green-500' },
              ].map((s) => <StatCard key={s.label} {...s} />)
          }
        </div>

        {/* Status distribution + Monthly revenue */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status distribution */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Trạng thái đơn</h2>
              <div className="space-y-3">
                {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                  const count = stats.bookings_status?.[key as BookingStatus] ?? 0;
                  const pct = stats.total_bookings ? Math.round((count / stats.total_bookings) * 100) : 0;
                  const Icon = cfg.icon;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly revenue chart (simple bar) */}
            <div className="card p-6 lg:col-span-2">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Doanh thu 6 tháng gần nhất</h2>
              {stats.monthly_revenue.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
              ) : (
                <div className="flex items-end gap-2 h-32">
                  {stats.monthly_revenue.map((m) => {
                    const maxRev = Math.max(...stats.monthly_revenue.map((x) => x.revenue), 1);
                    const h = Math.max(4, Math.round((m.revenue / maxRev) * 100));
                    return (
                      <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-brand-400 group-hover:bg-brand-500 rounded-t-lg transition-colors"
                            style={{ height: `${h}px` }}
                            title={formatPrice(m.revenue)}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{MONTH_NAMES[m.month]}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          {([
            { key: 'bookings',    label: 'Đơn thuê xe',   icon: Calendar  },
            { key: 'submissions', label: 'Xe ký gửi',      icon: FileText  },
            { key: 'users',       label: 'Thành viên',     icon: Users     },
            { key: 'reviews',     label: 'Đánh giá',       icon: Star      },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              id={`admin-tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex-shrink-0 ${
                activeTab === key
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'bookings'    && <BookingsTable />}
        {activeTab === 'submissions' && <CarSubmissionsTable />}
        {activeTab === 'users'       && <UsersTable />}
        {activeTab === 'reviews'     && <ReviewsTable />}

      </div>
    </div>
  );
}
