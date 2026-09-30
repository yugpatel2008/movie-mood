import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovies } from '../services/movieApi';
import MovieGrid from '../components/MovieGrid';
import SearchBar from '../components/SearchBar';
import LoadingIndicator from '../components/LoadingIndicator';
import { FiFilm, FiTrendingUp, FiStar } from 'react-icons/fi';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovies()
      .then((res) => setMovies(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredMovies = movies.slice(0, 6);

  const handleSearch = (query) => {
    if (query.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10" style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, rgba(124,58,237,0.08) 40%, transparent 70%)' }}></div>
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] pointer-events-none -z-10" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)' }}></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 p-3 rounded-2xl text-white text-3xl md:text-4xl flex items-center justify-center" style={{ boxShadow: 'var(--clay-shadow-elevated)' }}>
              <FiFilm />
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-primary-300 via-primary-400 to-primary-200 bg-clip-text text-transparent leading-tight">
            MovieMood
          </h1>
          <p className="text-primary-300/70 text-lg md:text-xl font-medium mb-3 tracking-wide">
            Watch. Review. Feel the Mood.
          </p>
          <p className="text-gray-400 text-base md:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Discover movies, share your thoughts, and let AI understand the mood behind every review.
          </p>

          <div className="flex justify-center mb-6">
            <SearchBar onSearch={handleSearch} placeholder="Search for a movie..." />
          </div>

          <div className="flex justify-center gap-4">
            <Link to="/movies" className="clay-btn clay-btn-primary text-base px-8 py-3.5">
              <FiTrendingUp /> Explore Movies
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="px-6 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2"><FiStar className="text-primary-400" /> Featured Movies</h2>
          <Link to="/movies" className="text-primary-400 font-semibold text-sm transition-colors hover:text-primary-300">View All →</Link>
        </div>
        {loading ? <LoadingIndicator /> : <MovieGrid movies={featuredMovies} />}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-8 md:py-16">
        <div className="clay-feature">
          <span className="text-4xl block mb-4">🎬</span>
          <h3 className="text-lg font-bold mb-2">Discover Movies</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Browse our curated collection and find your next favorite film.</p>
        </div>
        <div className="clay-feature">
          <span className="text-4xl block mb-4">✍️</span>
          <h3 className="text-lg font-bold mb-2">Share Reviews</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Write reviews and rate movies to help others decide what to watch.</p>
        </div>
        <div className="clay-feature">
          <span className="text-4xl block mb-4">🤖</span>
          <h3 className="text-lg font-bold mb-2">AI Sentiment</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Our ML model analyzes the mood behind every review automatically.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t border-white/6">
        <p className="text-gray-500 text-sm">© 2024 MovieMood. Movies + Mood, powered by machine learning.</p>
      </footer>
    </div>
  );
}
