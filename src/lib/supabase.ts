import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  duration: number;
  genre: string;
  rating: string;
  release_date: string;
  created_at: string;
}

export interface Showtime {
  id: string;
  movie_id: string;
  theater: string;
  show_date: string;
  show_time: string;
  available_seats: number;
  total_seats: number;
  price: number;
  created_at: string;
  movies?: Movie;
}

export interface Booking {
  id: string;
  showtime_id: string;
  customer_name: string;
  customer_email: string;
  seats_booked: number;
  total_amount: number;
  booking_date: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string;
  created_at: string;
}
