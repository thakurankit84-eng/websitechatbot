import { useState, useEffect } from 'react';
import { supabase, Movie, SUPABASE_ENABLED } from '../lib/supabase';
import MovieCard from './MovieCard';
import { Film } from 'lucide-react';

interface MovieListProps {
  onMovieSelect: (movie: Movie) => void;
}

const sampleMovies: Movie[] = [
  {
    id: 'sample-1',
    title: 'Aurora Nights',
    description: 'A visually stunning sci-fi drama exploring the edge of human consciousness.',
    poster_url: 'https://picsum.photos/seed/aurora/500/750',
    duration: 128,
    genre: 'Sci-Fi',
    rating: 'PG-13',
    release_date: '2025-01-10',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'The Last Melody',
    description: 'An emotional journey of a musician rediscovering life after loss.',
    poster_url: 'https://picsum.photos/seed/melody/500/750',
    duration: 102,
    genre: 'Drama',
    rating: 'PG',
    release_date: '2024-11-20',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Midnight Chase',
    description: 'A fast-paced thriller following a detective across the neon cityscape.',
    poster_url: 'https://picsum.photos/seed/chase/500/750',
    duration: 114,
    genre: 'Thriller',
    rating: 'R',
    release_date: '2024-12-05',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'Sunlit Shores',
    description: 'A heartwarming rom-com set on a picturesque coastal town.',
    poster_url: 'https://picsum.photos/seed/shore/500/750',
    duration: 95,
    genre: 'Romance',
    rating: 'PG-13',
    release_date: '2025-02-14',
    created_at: new Date().toISOString(),
  },
];

export default function MovieList({ onMovieSelect }: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);

      if (!SUPABASE_ENABLED) {
        // Use sample movies when Supabase is not configured
        setMovies(sampleMovies);
        return;
      }

      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('release_date', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Fallback to sample movies when the DB has no entries
        setMovies(sampleMovies);
      } else {
        setMovies(data as Movie[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchMovies}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <Film size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No movies available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onClick={() => onMovieSelect(movie)} />
      ))}
    </div>
  );
}
