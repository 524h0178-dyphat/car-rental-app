import api from './api';

export interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export const walletService = {
  getWallet: async (): Promise<{ data: WalletData }> => {
    const res = await api.get('/wallet');
    return res.data;
  },
};
