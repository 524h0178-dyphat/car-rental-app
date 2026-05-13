import api from './api';

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  status: 'visible' | 'hidden';
  created_at: string;
  user?: { id: number; name: string; avatar?: string };
  car?: { id: number; name: string; slug: string };
  booking?: { id: number; start_date: string; end_date: string };
}

export interface CarReviewsResponse {
  data: Review[];
  meta: { total: number; current_page: number; last_page: number };
  average_rating: number;
}

export const reviewService = {
  /** POST /reviews — create a review for a completed booking */
  create: async (payload: {
    booking_id: number;
    rating: number;
    comment?: string;
  }): Promise<{ message: string; data: Review }> => {
    const res = await api.post('/reviews', payload);
    return res.data;
  },

  /** GET /reviews/my — list current user's reviews */
  myReviews: async (): Promise<{ data: Review[] }> => {
    const res = await api.get('/reviews/my');
    return res.data;
  },

  /** GET /cars/{id}/reviews — public reviews for a car */
  carReviews: async (carId: number, page = 1): Promise<CarReviewsResponse> => {
    const res = await api.get(`/cars/${carId}/reviews`, { params: { page } });
    return res.data;
  },
};
