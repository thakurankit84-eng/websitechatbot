import { useState, useEffect } from 'react';
import { supabase, Movie, Showtime } from '../lib/supabase';
import { X, Clock, Calendar, MapPin, Users, DollarSign } from 'lucide-react';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  onBookShowtime: (showtime: Showtime) => void;
}

export default function MovieDetails({ movie, onClose, onBookShowtime }: MovieDetailsProps) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowtimes();
  }, [movie.id]);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('showtimes')
        .select('*')
        .eq('movie_id', movie.id)
        .gte('show_date', new Date().toISOString().split('T')[0])
        .order('show_date', { ascending: true })
        .order('show_time', { ascending: true });

      if (error) throw error;
      setShowtimes(data || []);
    } catch (err) {
      console.error('Error fetching showtimes:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    const date = showtime.show_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-96 object-cover"
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{movie.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="bg-red-600 text-white px-2 py-1 rounded">{movie.rating}</span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {movie.duration} min
                </span>
                <span>{movie.genre}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{movie.description}</p>

          <div className="border-t pt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Available Showtimes</h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : Object.keys(groupedShowtimes).length === 0 ? (
              <p className="text-gray-600 text-center py-8">No showtimes available for this movie.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedShowtimes).map(([date, times]) => (
                  <div key={date}>
                    <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar size={20} />
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {times.map((showtime) => (
                        <div
                          key={showtime.id}
                          className="border rounded-lg p-4 hover:border-red-600 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {showtime.show_time.substring(0, 5)}
                            </span>
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              <DollarSign size={16} />
                              {showtime.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {showtime.theater}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {showtime.available_seats} seats
                            </span>
                          </div>
                          <button
                            onClick={() => onBookShowtime(showtime)}
                            disabled={showtime.available_seats === 0}
                            className={`w-full py-2 rounded-lg font-medium transition-colors ${
                              showtime.available_seats === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {showtime.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
