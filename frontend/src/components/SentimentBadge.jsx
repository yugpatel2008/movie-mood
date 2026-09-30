export default function SentimentBadge({ sentiment, confidence }) {
  if (!sentiment) return null;

  let emoji = '😐';
  let badgeStyle = {
    background: 'rgba(234, 179, 8, 0.15)',
    color: '#eab308',
    border: '1px solid rgba(234, 179, 8, 0.3)',
  };

  if (sentiment === 'Positive') {
    emoji = '😊';
    badgeStyle = {
      background: 'rgba(16, 185, 129, 0.15)',
      color: '#34d399',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    };
  } else if (sentiment === 'Negative') {
    emoji = '😞';
    badgeStyle = {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    };
  }

  return (
    <span className="clay-badge inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full" style={badgeStyle}>
      <span>{emoji}</span> {sentiment}
      {confidence != null && (
        <span style={{ opacity: 0.75, fontSize: '0.7rem' }}>
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
}
