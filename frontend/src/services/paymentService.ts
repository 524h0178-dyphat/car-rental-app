import api from './api';

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  method: string;
  gateway?: string;
  transaction_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at?: string;
}

export const paymentService = {
  /** POST /payments — pay for a booking */
  pay: async (payload: {
    booking_id: number;
    method: string;
  }): Promise<{ message: string; data: Payment }> => {
    const res = await api.post('/payments', payload);
    return res.data;
  },

  /** GET /payments/{id} */
  get: async (id: number): Promise<{ data: Payment }> => {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  },
};
