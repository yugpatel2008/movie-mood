import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMovie } from '../services/movieApi';
import { getMovieReviews, createReview, updateReview, deleteReview } from '../services/reviewApi';
import RatingStars from '../components/RatingStars';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { FiStar, FiMessageSquare, FiTrendingUp, FiLogIn, FiTrendingDown } from 'react-icons/fi';

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([getMovie(id), getMovieReviews(id)])
      .then(([movieRes, reviewsRes]) => {
        setMovie(movieRes.data);
        setReviews(reviewsRes.data);
      })
      .catch(() => setError('Failed to load movie details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const userReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  const handleSubmitReview = async (data) => {
    setSubmitting(true);
    setFormError('');
    try {
      if (editingReview) {
        await updateReview(editingReview.id, data);
        setEditingReview(null);
      } else {
        await createReview(id, data);
      }
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(reviewId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    window.scrollTo({ top: document.querySelector('.review-section')?.offsetTop - 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;
  if (!movie) return <ErrorMessage message="Movie not found" />;

  return (
    <div>
      {/* Movie Hero with blur background */}
      <div className="relative min-h-[520px]">
        <div className="absolute inset-0 overflow-hidden -z-10">
          {movie.poster_url && <img src={movie.poster_url} alt="" className="w-full h-full object-cover blur-3xl brightness-[0.3] scale-110" />}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(12,12,24,0.6), var(--color-bg-primary))' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
          {/* Poster */}
          <div className="shrink-0 w-64 md:w-72 overflow-hidden" style={{ borderRadius: 'var(--radius-xl)', boxShadow: 'var(--clay-shadow-elevated)' }}>
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center text-6xl bg-bg-secondary">🎬</div>
            )}
          </div>

          {/* Movie Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black mb-3">{movie.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-4 text-sm">
              {movie.release_year && <span className="clay-badge" style={{ background: 'var(--color-bg-card)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}>{movie.release_year}</span>}
              {movie.genre && <span className="clay-badge" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--color-primary-400)', border: '1px solid rgba(124,58,237,0.25)' }}>{movie.genre}</span>}
              {movie.language && <span className="clay-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>{movie.language}</span>}
              {movie.status && <span className="clay-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>{movie.status}</span>}
            </div>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-3xl text-sm md:text-base">{movie.description}</p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              {movie.external_rating && (
                <div className="clay-stat">
                  <div className="clay-stat-icon text-yellow-400"><FiStar /></div>
                  <div className="clay-stat-value">{movie.external_rating}</div>
                  <div className="clay-stat-label">TVmaze Rating</div>
                </div>
              )}
              <div className="clay-stat">
                <div className="clay-stat-icon"><FiStar /></div>
                <div className="clay-stat-value">{movie.average_rating || 'N/A'}</div>
                <div className="clay-stat-label">User Rating</div>
              </div>
              <div className="clay-stat">
                <div className="clay-stat-icon"><FiMessageSquare /></div>
                <div className="clay-stat-value">{movie.total_reviews}</div>
                <div className="clay-stat-label">Reviews</div>
              </div>
              <div className="clay-stat">
                <div className="clay-stat-icon"><FiTrendingUp /></div>
                <div className="clay-stat-value" style={{ color: '#34d399' }}>{movie.positive_percentage}%</div>
                <div className="clay-stat-label">Positive Mood</div>
              </div>
              <div className="clay-stat">
                <div className="clay-stat-icon"><FiTrendingDown /></div>
                <div className="clay-stat-value" style={{ color: '#f87171' }}>{movie.negative_percentage}%</div>
                <div className="clay-stat-label">Negative Mood</div>
              </div>
            </div>

            {/* Sentiment bar */}
            {movie.total_reviews > 0 && (
              <div className="max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Audience Mood</span>
                  <span>{movie.total_reviews} reviews</span>
                </div>
                <div className="clay-sentiment-bar">
                  <div className="positive" style={{ width: `${movie.positive_percentage}%` }}></div>
                  <div className="negative" style={{ width: `${movie.negative_percentage}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="review-section max-w-7xl mx-auto px-6 py-8 md:py-12">
        {user ? (
          !userReview || editingReview ? (
            <div>
              <ReviewForm
                onSubmit={handleSubmitReview}
                initialData={editingReview}
                loading={submitting}
              />
              {editingReview && (
                <button onClick={handleCancelEdit} className="clay-btn clay-btn-secondary mt-2">
                  Cancel Edit
                </button>
              )}
              {formError && <div className="clay-alert clay-alert-error mt-3">{formError}</div>}
            </div>
          ) : (
            <div className="clay-alert clay-alert-success mb-8">
              ✅ You've already reviewed this movie. You can edit or delete your review below.
            </div>
          )
        ) : (
          <div className="clay-form text-center mb-8">
            <p className="text-gray-400 mb-4">Want to share your thoughts?</p>
            <Link to="/login" className="clay-btn clay-btn-primary">
              <FiLogIn /> Login to Write a Review
            </Link>
          </div>
        )}

        <h2 className="text-xl font-bold mb-6 pb-3 border-b border-white/6">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <EmptyState message="No reviews yet. Be the first to review!" icon="✍️" />
        ) : (
          <div className="flex flex-col">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
