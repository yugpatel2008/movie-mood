import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyReviews, deleteReview } from '../services/reviewApi';
import RatingStars from '../components/RatingStars';
import SentimentBadge from '../components/SentimentBadge';
import GenrePreferences from '../components/GenrePreferences';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { FiUser, FiMail, FiTrash2, FiEdit2, FiFilm } from 'react-icons/fi';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReviews();
  }, [user]);

  const fetchReviews = () => {
    setLoading(true);
    getMyReviews()
      .then((res) => setReviews(res.data))
      .catch(() => setError('Failed to load reviews'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="clay-card-elevated flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 p-8">
        <div className="clay-avatar clay-avatar-lg">
          {user.username[0].toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2 mb-2"><FiUser /> {user.username}</h1>
          <p className="text-gray-400 flex items-center justify-center md:justify-start gap-1.5 text-sm"><FiMail /> {user.email}</p>
          <p className="text-gray-500 text-xs mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''} written</p>
        </div>
      </div>

      {/* Genre Preferences & Recommendations Section */}
      <GenrePreferences />

      {/* My Reviews */}
      <div>
        <h2 className="text-xl font-bold mb-6">My Reviews ({reviews.length})</h2>

        {loading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && reviews.length === 0 && (
          <EmptyState message="You haven't written any reviews yet" icon="✍️" />
        )}

        {!loading && !error && reviews.map((review) => (
          <div key={review.id} className="clay-review flex flex-col sm:flex-row gap-6 mb-4">
            <div className="shrink-0 flex sm:flex-col items-center gap-3 sm:w-[100px]">
              <Link to={`/movies/${review.movie_id}`} className="flex flex-col items-center text-center gap-2">
                {review.movie_poster_url ? (
                  <img src={review.movie_poster_url} alt={review.movie_title} className="w-16 sm:w-full aspect-[2/3] object-cover" style={{ borderRadius: 'var(--radius-md)' }} />
                ) : (
                  <div className="w-16 sm:w-full aspect-[2/3] flex items-center justify-center text-2xl bg-bg-secondary" style={{ borderRadius: 'var(--radius-md)' }}><FiFilm /></div>
                )}
                <span className="text-xs font-semibold text-primary-400">{review.movie_title}</span>
              </Link>
            </div>
            <div className="flex-1">
              <RatingStars rating={review.rating} size="sm" />
              <p className="text-gray-400 text-sm leading-relaxed mt-2 mb-4">{review.review_text}</p>
              <div className="flex items-center flex-wrap gap-3 mt-auto">
                <SentimentBadge sentiment={review.sentiment} confidence={review.confidence} />
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
                <div className="ml-auto flex gap-1">
                  <Link to={`/movies/${review.movie_id}`} className="clay-icon-btn" title="Edit review">
                    <FiEdit2 />
                  </Link>
                  <button onClick={() => handleDelete(review.id)} className="clay-icon-btn danger" title="Delete review">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
