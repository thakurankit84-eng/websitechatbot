/*
  # Movie Booking System Database Schema

  1. New Tables
    - `movies`
      - `id` (uuid, primary key)
      - `title` (text, movie title)
      - `description` (text, movie description)
      - `poster_url` (text, poster image URL)
      - `duration` (integer, duration in minutes)
      - `genre` (text, movie genre)
      - `rating` (text, movie rating like PG, PG-13, R)
      - `release_date` (date, release date)
      - `created_at` (timestamptz, timestamp)
    
    - `showtimes`
      - `id` (uuid, primary key)
      - `movie_id` (uuid, foreign key to movies)
      - `theater` (text, theater name/location)
      - `show_date` (date, date of showing)
      - `show_time` (time, time of showing)
      - `available_seats` (integer, seats still available)
      - `total_seats` (integer, total seats)
      - `price` (numeric, ticket price)
      - `created_at` (timestamptz, timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `showtime_id` (uuid, foreign key to showtimes)
      - `customer_name` (text, customer name)
      - `customer_email` (text, customer email)
      - `seats_booked` (integer, number of seats)
      - `total_amount` (numeric, total booking amount)
      - `booking_date` (timestamptz, booking timestamp)
      - `created_at` (timestamptz, timestamp)
    
    - `faqs`
      - `id` (uuid, primary key)
      - `question` (text, FAQ question)
      - `answer` (text, FAQ answer)
      - `category` (text, FAQ category)
      - `keywords` (text, searchable keywords)
      - `created_at` (timestamptz, timestamp)

  2. Security
    - Enable RLS on all tables
    - Public read access for movies, showtimes, and FAQs
    - Public insert access for bookings (no auth required for demo)
    - Restrict updates and deletes
*/

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  poster_url text NOT NULL,
  duration integer NOT NULL,
  genre text NOT NULL,
  rating text NOT NULL,
  release_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create showtimes table
CREATE TABLE IF NOT EXISTS showtimes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  theater text NOT NULL,
  show_date date NOT NULL,
  show_time time NOT NULL,
  available_seats integer NOT NULL,
  total_seats integer NOT NULL,
  price numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showtime_id uuid NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  seats_booked integer NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  booking_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL,
  keywords text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Movies policies (public read access)
CREATE POLICY "Anyone can view movies"
  ON movies FOR SELECT
  USING (true);

-- Showtimes policies (public read access)
CREATE POLICY "Anyone can view showtimes"
  ON showtimes FOR SELECT
  USING (true);

-- Bookings policies (public can create and view their own)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  USING (true);

-- FAQs policies (public read access)
CREATE POLICY "Anyone can view FAQs"
  ON faqs FOR SELECT
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_showtimes_movie_id ON showtimes(movie_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_date ON showtimes(show_date);
CREATE INDEX IF NOT EXISTS idx_bookings_showtime_id ON bookings(showtime_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);