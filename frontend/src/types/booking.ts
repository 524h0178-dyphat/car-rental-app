export type PaymentMethod = 'bank_transfer' | 'cash' | 'momo';
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface BookingCar {
  id: number;
  name: string;
  slug: string;
  brand: string;
  image?: string;
}

export interface Booking {
  id: number;
  status: BookingStatus;
  status_label: string;
  start_date: string;
  end_date: string;
  total_days: number;
  price_per_day: number;
  total_price: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  renter_name: string;
  renter_phone: string;
  renter_cccd?: string;
  pickup_address?: string;
  note?: string;
  cancel_reason?: string;
  confirmed_at?: string;
  handed_over_at?: string;
  picked_up_at?: string;
  returned_at?: string;
  payout_status?: string;
  created_at: string;
  car?: BookingCar;
}

export interface StoreBookingPayload {
  car_id: number;
  start_date: string;
  end_date: string;
  renter_name: string;
  renter_phone: string;
  renter_cccd: string;
  renter_license?: string;
  pickup_address?: string;
  pickup_note?: string;
  payment_method: PaymentMethod;
  note?: string;
}

/** Wizard step data — accumulated across 3 steps */
export interface BookingFormData {
  // Step 1 — car + dates (pre-filled from URL/detail page)
  car_id: number;
  start_date: string;
  end_date: string;
  // Step 2 — renter info
  renter_name: string;
  renter_phone: string;
  renter_cccd: string;
  renter_license: string;
  pickup_address: string;
  pickup_note: string;
  note: string;
  // Step 3 — payment
  payment_method: PaymentMethod;
}
