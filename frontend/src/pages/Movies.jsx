import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMovies } from '../services/movieApi';
import MovieGrid from '../components/MovieGrid';
import SearchBar from '../components/SearchBar';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchMovies = (search = '') => {
    setLoading(true);
    setError('');
    getMovies(search)
      .then((res) => setMovies(res.data))
      .catch(() => setError('Failed to load movies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    setSearchQuery(initialSearch);
    fetchMovies(initialSearch);
  }, [searchParams]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
    fetchMovies(query);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-extrabold w-full md:w-auto text-center md:text-left">🎬 Movies & Shows</h1>
        <div className="w-full md:w-auto">
          <SearchBar onSearch={handleSearch} placeholder="Search movies or shows..." />
        </div>
      </div>

      {loading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && movies.length === 0 && (
        <EmptyState message={searchQuery ? `No movies found for "${searchQuery}"` : 'No movies available'} />
      )}
      {!loading && !error && movies.length > 0 && <MovieGrid movies={movies} />}
    </div>
  );
}
