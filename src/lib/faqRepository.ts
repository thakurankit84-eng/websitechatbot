import { FAQ } from './supabase';

export function getDefaultFaqs(): FAQ[] {
  return [
    {
      id: 'default-1',
      question: 'What is the refund policy?',
      answer: 'Refunds are available up to 24 hours before the showtime. Contact support for assistance.',
      category: 'Refunds',
      keywords: 'refund,cancellation,refund policy,money back',
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-2',
      question: 'How can I change my seat?',
      answer: 'Seat changes are allowed depending on availability. Go to your booking and select "Change Seats".',
      category: 'Booking',
      keywords: 'seat change,seats,change booking,modify seats',
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-3',
      question: 'Are children allowed?',
      answer: 'Children are allowed; parental guidance may be required for certain ratings. Check the movie rating.',
      category: 'Policies',
      keywords: 'children,age,age restrictions,kids,family',
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-4',
      question: 'What are the ticket prices?',
      answer: 'Ticket prices vary by theater and showtime. We accept credit/debit cards, Apple Pay, Google Pay, and major UPI/NetBanking methods where available. Service fees may apply.',
      category: 'Ticketing',
      keywords: 'ticket price,price,payment,payment options,cost,how much',
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-5',
      question: 'How do I check show timings?',
      answer: 'Show timings are listed on the movie details page. Click a movie to see available showtimes and seat availability for each time. You can also filter by date and theater.',
      category: 'Showtimes',
      keywords: 'show timing,show timings,availability,showtime,show times,when',
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-6',
      question: 'How does the booking process work?',
      answer: 'Select a movie, pick a showtime, choose your seats, and complete payment. You will receive an email confirmation and e-ticket after successful payment.',
      category: 'Booking',
      keywords: 'booking process,how to book,book tickets,make reservation',
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-7',
      question: 'What are the age restrictions?',
      answer: 'Movies are rated according to local guidelines (e.g., U, PG, PG-13, R). Please check the movie rating on the details page. Some theaters may enforce ID checks for age-restricted screenings.',
      category: 'Policies',
      keywords: 'age restriction,age restrictions,rating,rated,mature content',
      created_at: new Date().toISOString(),
    },
  ];
}
