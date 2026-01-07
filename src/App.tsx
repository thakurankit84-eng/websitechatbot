import { useState } from 'react';
import { Movie, Showtime } from './lib/supabase';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import BookingForm from './components/BookingForm';
import Chatbot from './components/Chatbot';
import { Film, Sparkles } from 'lucide-react';

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseMovieDetails = () => {
    setSelectedMovie(null);
  };

  const handleBookShowtime = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
  };

  const handleCloseBooking = () => {
    setSelectedShowtime(null);
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
                <Film size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CineBook</h1>
                <p className="text-slate-400 text-sm">Your premier movie booking experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Sparkles size={20} />
              <span className="text-sm font-medium">Now Showing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Featured Movies</h2>
          <p className="text-slate-400">Book your tickets for the latest blockbusters</p>
        </div>
        <MovieList onMovieSelect={handleMovieSelect} />
      </main>

      <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">About CineBook</h3>
              <p className="text-slate-400 text-sm">
                Your trusted platform for seamless movie ticket booking. Experience cinema like never before.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Need Help?</h3>
              <p className="text-slate-400 text-sm mb-2">
                Chat with our AI assistant for instant answers to your questions!
              </p>
              <p className="text-red-400 text-sm">Click the chat icon below</p>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-400 text-sm">
            © 2024 CineBook. All rights reserved.
          </div>
        </div>
      </footer>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={handleCloseMovieDetails}
          onBookShowtime={handleBookShowtime}
        />
      )}

      {selectedShowtime && selectedMovie && (
        <BookingForm
          showtime={selectedShowtime}
          movie={selectedMovie}
          onClose={handleCloseBooking}
        />
      )}

      <Chatbot />
    </div>
  );
}

export default App;
