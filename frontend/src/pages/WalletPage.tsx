import { useQuery } from '@tanstack/react-query';
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { formatPrice } from '@/utils/formatters';

export default function WalletPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.getWallet,
  });

  const wallet = data?.data;

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ví điện tử</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý thu nhập từ việc cho thuê xe của bạn</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-slate-900 dark:text-white shadow-card border border-cyan-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <p className="text-brand-700 font-medium mb-2">Số dư hiện tại</p>
            {isLoading ? (
              <div className="h-10 bg-cyan-100 rounded w-48 animate-pulse" />
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                {formatPrice(wallet?.balance || 0)}
              </h2>
            )}
            <div className="mt-8 flex gap-3">
              <button className="bg-brand-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-600 transition-colors">
                Rút tiền
              </button>
              <button className="bg-cyan-50 text-brand-700 font-medium px-6 py-2.5 rounded-xl hover:bg-cyan-100 transition-colors border border-cyan-100">
                Thêm thẻ
              </button>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-card border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Lịch sử giao dịch</h3>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center animate-pulse">
                  <div className="w-12 h-12 bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Không thể tải lịch sử giao dịch.</p>
            </div>
          )}

          {!isLoading && !isError && (!wallet?.transactions || wallet.transactions.length === 0) && (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có giao dịch nào</p>
            </div>
          )}

          {!isLoading && wallet?.transactions && wallet.transactions.length > 0 && (
            <div className="space-y-4">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(tx.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className={`font-bold whitespace-nowrap ${
                    tx.type === 'credit' ? 'text-green-600' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
