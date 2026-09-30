import pickle
import re
import os
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# Download stopwords quietly
nltk.download('stopwords', quiet=True)

stemmer = PorterStemmer()

# Load model and vectorizer once at module level
_model = None
_vectorizer = None
_model_loaded = False

def _get_model_path(filename):
    return os.path.join(os.path.dirname(__file__), filename)

def load_model():
    global _model, _vectorizer, _model_loaded
    if _model_loaded:
        return _model, _vectorizer
    try:
        with open(_get_model_path('sentiment_model.pkl'), 'rb') as f:
            _model = pickle.load(f)
        with open(_get_model_path('vectorizer.pkl'), 'rb') as f:
            _vectorizer = pickle.load(f)
        _model_loaded = True
        print("ML model and vectorizer loaded successfully")
    except Exception as e:
        print(f"Error loading ML model: {e}")
        _model = None
        _vectorizer = None
    return _model, _vectorizer

def preprocess_review(review_text: str) -> str:
    """Reproduce the exact same preprocessing used during training."""
    # Remove HTML tags
    review_text = re.sub('<.*?>', ' ', review_text)
    # Remove non-alphabetic characters, lowercase
    review_text = re.sub('[^a-zA-Z]', ' ', review_text).lower()
    # Tokenize, stem, remove stopwords
    stop_words = set(stopwords.words('english'))
    words = [stemmer.stem(w) for w in review_text.split() if w not in stop_words]
    return ' '.join(words)

def predict_sentiment(review_text: str) -> dict:
    """
    Predict sentiment for a review text.
    Returns dict with 'sentiment', 'confidence', and 'error' keys.
    """
    model, vectorizer = load_model()
    
    if model is None or vectorizer is None:
        return {"sentiment": None, "confidence": None, "error": "ML model not loaded"}
    
    try:
        processed = preprocess_review(review_text)
        vectorized = vectorizer.transform([processed])
        
        # Get prediction
        prediction = model.predict(vectorized)[0]
        
        # Get confidence from predict_proba
        confidence = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(vectorized)[0]
            confidence = float(max(proba))
        
        # Map prediction to label
        sentiment = "Positive" if prediction == 1 or prediction == "positive" else "Negative"
        
        return {
            "sentiment": sentiment,
            "confidence": round(confidence, 4) if confidence else None,
            "error": None
        }
    except Exception as e:
        return {"sentiment": None, "confidence": None, "error": str(e)}
