import { FiStar } from 'react-icons/fi';

export default function RatingStars({ rating, onRate, interactive = false, size = 'md' }) {
  const sizeMap = {
    sm: '0.95rem',
    md: '1.3rem',
    lg: '1.7rem'
  };

  return (
    <div className="flex gap-1.5" style={{ fontSize: sizeMap[size] }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="bg-transparent border-none p-0 flex transition-all duration-200"
          style={{
            color: star <= rating ? '#fbbf24' : '#4b5563',
            cursor: interactive ? 'pointer' : 'default',
            transform: interactive && star <= rating ? 'scale(1)' : 'scale(1)',
            filter: star <= rating ? 'drop-shadow(0 0 3px rgba(251,191,36,0.3))' : 'none'
          }}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.25)')}
          onMouseLeave={(e) => interactive && (e.currentTarget.style.transform = 'scale(1)')}
          disabled={!interactive}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <FiStar className={star <= rating ? 'fill-yellow-400' : ''} />
        </button>
      ))}
    </div>
  );
}
