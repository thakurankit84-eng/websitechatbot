-- Create FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  keywords text,
  created_at timestamptz DEFAULT now()
);

-- Sample data (existing and explicit entries for common topics)
INSERT INTO public.faqs (question, answer, category, keywords)
VALUES
('What is the refund policy?', 'Refunds are available up to 24 hours before the showtime. Contact support for assistance.', 'Refunds', 'refund,cancellation,refund policy'),
('How can I change my seat?', 'Seat changes are allowed depending on availability. Go to your booking and select "Change Seats".', 'Booking', 'seat change,seats,change booking'),
('Are children allowed?', 'Children are allowed; parental guidance may be required for certain ratings. Check the movie rating.', 'Policies', 'children,age,age restrictions'),
('What are the ticket prices and payment options?', 'Ticket prices vary by theater and showtime. We accept credit/debit cards, Apple Pay, Google Pay, and major UPI/NetBanking methods where available. Service fees may apply.', 'Ticketing', 'ticket price,price,payment,payment options'),
('How do I check show timings and availability?', 'Show timings are listed on the movie details page. Click a movie to see available showtimes and seat availability for each time. You can also filter by date and theater.', 'Showtimes', 'show timing,show timings,availability,showtime,show times'),
('What is the cancellation and refund policy?', 'You can cancel bookings up to 24 hours before the showtime for a full refund minus any service fees. Cancellations within 24 hours may not be eligible for a refund. Check your booking details for specifics.', 'Refunds', 'cancellation,refund,refund policy'),
('How does the booking process work?', 'Select a movie, pick a showtime, choose your seats, and complete payment. You will receive an email confirmation and e-ticket after successful payment.', 'Booking', 'booking process,how to book,book tickets'),
('Are there age restrictions for movies?', 'Movies are rated according to local guidelines (e.g., U, PG, PG-13, R). Please check the movie rating on the details page. Some theaters may enforce ID checks for age-restricted screenings.', 'Policies', 'age restriction,age restrictions,rating'),
('Ticket prices and payment', 'Ticket prices depend on theater, seat type, and showtime. You can view the exact price when selecting seats. We accept major credit/debit cards, Apple Pay, Google Pay, and commonly supported local payment methods. Service fees and taxes may apply and will be shown at checkout.', 'Ticketing', 'ticket price,price,payment,payment options'),
('Show timings and availability', 'Show timings and seat availability are displayed on each movie\'s details page. Use the date and theater filters to find specific showtimes. Availability is updated in real-time, and seats may sell out quickly for popular shows.', 'Showtimes', 'show timing,show timings,availability,showtime,show times'),
('Cancellation and refund policy', 'Cancellations are allowed up to 24 hours before the scheduled showtime for a full refund minus service fees. For cancellations within 24 hours, partial or no refund may be provided depending on the theater policy. Refunds are processed to the original payment method and may take several business days to appear.', 'Refunds', 'cancellation,refund,refund policy'),
('Booking process', 'To book tickets: 1) Choose a movie; 2) Select a showtime and theater; 3) Pick your seats; 4) Enter attendee details; 5) Complete payment. After successful payment you will receive an email confirmation and e-ticket. You can manage bookings from the "My Bookings" section.', 'Booking', 'booking process,how to book,book tickets'),
('Age restrictions', 'Age restrictions (ratings) vary by country and theater. Check the rating on the movie details page (e.g., U, PG, PG-13, R). Some screenings may require ID checks at entry for restricted movies. If in doubt, contact the theater for their policy.', 'Policies', 'age restriction,age restrictions,rating');
