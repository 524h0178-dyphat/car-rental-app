export interface Location {
  id: number;
  name: string;
  province: string;
  coordinates?: string;
}

export interface CarImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export interface Feature {
  id: number;
  name: string;
  icon: string;
}

export interface Car {
  id: number;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  seats: number;
  transmission: string;
  fuel: string;
  price_per_day: number;
  status: 'available' | 'rented' | 'maintenance';
  description?: string;
  primary_image?: string;
  location?: Location;
  images?: CarImage[];
  features?: Feature[];
  created_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface CarFilters {
  seats?: string;
  transmission?: string;
  fuel?: string;
  brand?: string;
  province?: string;
  price_min?: string;
  price_max?: string;
  features?: string;
  sort_by?: string;
  sort_dir?: string;
  per_page?: string;
  page?: string;
}
