import { useState } from 'react';
import { supabase, Showtime, Movie } from '../lib/supabase';
import { X, Calendar, Clock, MapPin, Users, DollarSign, CheckCircle } from 'lucide-react';

interface BookingFormProps {
  showtime: Showtime;
  movie: Movie;
  onClose: () => void;
}

export default function BookingForm({ showtime, movie, onClose }: BookingFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const totalAmount = showtime.price * seatsBooked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (seatsBooked > showtime.available_seats) {
        throw new Error('Not enough seats available');
      }

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          showtime_id: showtime.id,
          customer_name: customerName,
          customer_email: customerEmail,
          seats_booked: seatsBooked,
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const newAvailableSeats = showtime.available_seats - seatsBooked;
      const { error: updateError } = await supabase
        .from('showtimes')
        .update({ available_seats: newAvailableSeats })
        .eq('id', showtime.id);

      if (updateError) throw updateError;

      setBookingId(booking.id);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your booking has been successfully confirmed. A confirmation email has been sent to{' '}
            <strong>{customerEmail}</strong>
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-1">Booking ID</p>
            <p className="font-mono text-xs text-gray-800 mb-3">{bookingId}</p>
            <p className="text-sm text-gray-600 mb-1">Movie</p>
            <p className="font-semibold text-gray-900 mb-3">{movie.title}</p>
            <p className="text-sm text-gray-600 mb-1">Date & Time</p>
            <p className="text-gray-900 mb-3">
              {new Date(showtime.show_date + 'T00:00:00').toLocaleDateString()} at{' '}
              {showtime.show_time.substring(0, 5)}
            </p>
            <p className="text-sm text-gray-600 mb-1">Seats</p>
            <p className="text-gray-900 mb-3">{seatsBooked} seat(s)</p>
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Book Tickets</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{movie.title}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(showtime.show_date + 'T00:00:00').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{showtime.show_time.substring(0, 5)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{showtime.theater}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{showtime.available_seats} seats available</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>${showtime.price} per ticket</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Seats
              </label>
              <select
                id="seats"
                value={seatsBooked}
                onChange={(e) => setSeatsBooked(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
              >
                {Array.from({ length: Math.min(10, showtime.available_seats) }, (_, i) => i + 1).map(
                  (num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'seat' : 'seats'}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                <span>Total Amount</span>
                <span className="text-green-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
