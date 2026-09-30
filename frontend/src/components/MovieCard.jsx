import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="clay-movie-card">
      <div className="clay-movie-poster">
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
        )}
        {movie.release_year && <span className="year-badge">{movie.release_year}</span>}
      </div>
      <div className="clay-movie-info">
        <h3>{movie.title}</h3>
        <p className="genre">{movie.genre || 'General'}</p>
        <div className="meta">
          <span className="rating">
            <FiStar className="fill-yellow-400 text-yellow-400" />
            {movie.average_rating !== null && movie.average_rating !== undefined
              ? movie.average_rating
              : (movie.external_rating ? `${movie.external_rating}` : 'N/A')}
          </span>
          <span className="review-count">
            {movie.total_reviews > 0 ? `${movie.total_reviews} reviews` : (movie.status || 'Show')}
          </span>
        </div>
      </div>
    </Link>
  );
}
