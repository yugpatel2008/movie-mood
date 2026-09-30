from app.ml.predict import predict_sentiment

def analyze_sentiment(review_text: str) -> dict:
    """Clean interface for the rest of the backend."""
    return predict_sentiment(review_text)

def check_rating_sentiment_mismatch(rating: int, sentiment: str) -> bool:
    """
    Check if star rating disagrees with ML sentiment.
    1-2 stars + Positive = mismatch
    4-5 stars + Negative = mismatch
    3 stars = no mismatch (ambiguous)
    """
    if sentiment is None:
        return False
    if rating <= 2 and sentiment == "Positive":
        return True
    if rating >= 4 and sentiment == "Negative":
        return True
    return False
