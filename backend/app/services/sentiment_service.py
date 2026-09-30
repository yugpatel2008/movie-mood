from app.ml.predict import predict_sentiment

def analyze_sentiment(review_text: str, rating: int = None) -> dict:
    """Clean interface for backend sentiment prediction combining text and star rating."""
    return predict_sentiment(review_text, rating=rating)

def check_rating_sentiment_mismatch(rating: int, sentiment: str) -> bool:
    """
    Check if star rating disagrees with ML sentiment.
    1-2 stars + Positive = mismatch
    4-5 stars + Negative = mismatch
    3 stars or Neutral = no mismatch
    """
    if sentiment is None or sentiment == "Neutral":
        return False
    if rating <= 2 and sentiment == "Positive":
        return True
    if rating >= 4 and sentiment == "Negative":
        return True
    return False
