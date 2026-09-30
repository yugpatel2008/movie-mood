export default function SentimentBadge({ sentiment, confidence }) {
  if (!sentiment) return null;

  const isPositive = sentiment === 'Positive';

  return (
    <span className={`clay-badge ${isPositive ? 'clay-badge-positive' : 'clay-badge-negative'}`}>
      {isPositive ? '😊' : '😞'} {sentiment}
      {confidence != null && (
        <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
}
