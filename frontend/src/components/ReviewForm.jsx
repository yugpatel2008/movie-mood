import { useState } from 'react';
import RatingStars from './RatingStars';

export default function ReviewForm({ onSubmit, initialData = null, loading = false }) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [reviewText, setReviewText] = useState(initialData?.review_text || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    onSubmit({ rating, review_text: reviewText });
  };

  return (
    <form className="clay-form mb-8" onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-6">{initialData ? '✏️ Edit Your Review' : '✍️ Write a Review'}</h3>
      
      <div className="clay-input-group">
        <label>Your Rating</label>
        <RatingStars rating={rating} onRate={setRating} interactive size="lg" />
      </div>

      <div className="clay-input-group">
        <label htmlFor="review-text">Your Review</label>
        <textarea
          id="review-text"
          className="clay-input"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          rows={4}
          maxLength={5000}
        />
        <span className="block text-right text-xs text-gray-500 mt-1.5">{reviewText.length}/5000</span>
      </div>

      {error && <div className="clay-alert clay-alert-error mb-4">{error}</div>}

      <button type="submit" className="clay-btn clay-btn-primary" disabled={loading}>
        {loading ? 'Submitting...' : (initialData ? 'Update Review' : 'Submit Review')}
      </button>
    </form>
  );
}
