import { Movie } from '../lib/supabase';
import { Clock, Calendar } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="relative h-96 overflow-hidden">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {movie.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{movie.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{movie.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{movie.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{new Date(movie.release_date).getFullYear()}</span>
          </div>
        </div>
        <div className="mt-3 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
          {movie.genre}
        </div>
      </div>
    </div>
  );
}
