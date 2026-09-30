import RatingStars from './RatingStars';
import SentimentBadge from './SentimentBadge';
import { FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

export default function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const isOwner = currentUserId && currentUserId === review.user_id;

  return (
    <div className="clay-review">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="clay-avatar clay-avatar-sm">
            {review.username[0].toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-[0.95rem] block">{review.username}</span>
            <span className="text-[0.76rem] text-gray-500">
              {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(review)} className="clay-icon-btn" title="Edit review">
              <FiEdit2 />
            </button>
            <button onClick={() => onDelete(review.id)} className="clay-icon-btn danger" title="Delete review">
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <RatingStars rating={review.rating} size="sm" />
        <p className="text-gray-400 text-sm leading-relaxed mt-2">{review.review_text}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SentimentBadge sentiment={review.sentiment} confidence={review.confidence} />
        {review.rating_sentiment_mismatch && (
          <span className="clay-badge clay-badge-mismatch" title="The star rating doesn't match the sentiment detected in your text">
            <FiAlertTriangle /> Mismatch
          </span>
        )}
      </div>
    </div>
  );
}
