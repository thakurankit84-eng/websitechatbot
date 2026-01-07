// Simple FAQ data for Node.js backend (JS version of defaultFaqs)
// Keep this in sync with src/lib/faqRepository.ts if you update FAQs.

const defaultFaqs = [
  {
    id: 'faq-ticket-prices',
    question: 'What are the ticket prices and payment options?',
    answer:
      'Ticket prices vary depending on the showtime and theater. Matinee shows (before 5 PM) start at $12.99 (~?1,078), while evening shows are $15.99 (~?1,327). Premium theaters like our Luxury Theater range from $18.99 to $20.99 (~?1,576–?1,742). You can see the exact price for each showtime when selecting your movie. (INR values are approximate; conversion used: 1 USD ? ?83.)',
    category: 'Ticketing',
    keywords: 'ticket price,price,payment,payment options,fees,promo code',
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-show-timings',
    question: 'How can I check show timings and availability?',
    answer:
      "Show timings and seat availability are displayed on each movie's details page. Use the date selector to pick a day and the theater filter to narrow results. Each showtime shows remaining seats; clicking a showtime opens the seat map so you can pick specific seats. Availability is updated in real-time — popular shows can sell out quickly, so book early. If a showtime is sold out, try a different theater or time.",
    category: 'Showtimes',
    keywords: 'show timing,show timings,availability,showtime,show times,seat map',
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-cancellation-refund',
    question: 'What is the cancellation and refund policy?',
    answer:
      'You can cancel or modify your booking up to 2 hours before the showtime for a full refund. Cancellations made less than 2 hours before the show will receive a 50% refund. No-shows are not eligible for refunds. To cancel, please contact our support team with your booking ID.',
    category: 'Refunds',
    keywords: 'cancellation,refund,refund policy,booking cancellation',
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-booking-process',
    question: 'How does the booking process work?',
    answer:
      'To book tickets: 1) Choose a movie; 2) Select a date, theater and showtime; 3) Pick seats from the seat map and confirm attendee counts; 4) Enter contact details and any promo code; 5) Complete payment. After successful payment you will receive an email and SMS confirmation with an e-ticket/QR code. Keep the confirmation handy at entry. You can view and manage bookings in the "My Bookings" section — there you can cancel (if allowed), change seats (if supported) or request refunds.',
    category: 'Booking',
    keywords: 'booking process,how to book,book tickets,e-ticket,confirmation',
    created_at: new Date().toISOString(),
  },
  {
    id: 'faq-age-restrictions',
    question: 'Are there age restrictions for movies?',
    answer:
      'Movies are rated according to local classification systems (for example: U, PG, 12A/PG-13, 15/18/R). The required minimum age is shown on the movie details page. Some theaters may require ID at the entrance for age-restricted films and may refuse entry to underage patrons. If you are unsure about a rating or need a parental guidance policy, contact the theater before booking.',
    category: 'Policies',
    keywords: 'age restriction,age restrictions,rating,classification,ID check',
    created_at: new Date().toISOString(),
  },
];

module.exports = { defaultFaqs };
