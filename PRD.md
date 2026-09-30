# MovieMood - Product Requirements Document

## Overview
MovieMood is an ML-powered movie review platform. Users browse movies and series, read reviews, submit reviews that are automatically analyzed for sentiment, and receive personalized in-app notifications based on their learned genre preferences. The tagline is: **Watch. Review. Feel the Mood.**

## ML Model (Source of Truth)
- **Algorithm**: MultinomialNB (sklearn)
- **Vectorizer**: CountVectorizer (5000 features)
- **Training Data**: IMDB Dataset
- **Classes**: Binary — **Positive** and **Negative** ONLY (no Neutral)
- **Confidence**: Supported via `predict_proba()`
- **Preprocessing Pipeline** (must reproduce exactly):
  1. Remove HTML tags: `re.sub('<.*?>', ' ', text)`
  2. Remove non-alpha chars: `re.sub('[^a-zA-Z]', ' ', text).lower()`
  3. Tokenize + Porter Stemmer + remove NLTK English stopwords
  4. Join back to string
- **Files**: `sentiment_model.pkl`, `vectorizer.pkl`

## Architecture

### Tech Stack
- **Frontend**: React + Vite + JavaScript + React Router + Axios
- **Backend**: Python + FastAPI + SQLAlchemy + Pydantic + JWT (python-jose) + bcrypt + httpx
- **Database**: SQLite (PostgreSQL-ready schema)
- **ML**: Pickle models loaded in FastAPI only
- **Provider**: TVmaze public API (dynamic show metadata)
- **UI**: Claymorphism design system (soft clay-like elevation, rounded forms, inset shadows)

### Deployment Architecture (Render)
- **Frontend**: React + Vite SPA deployed as a **Render Static Site** (with SPA rewrite `/*` → `/index.html`). Communicates with backend via `VITE_API_BASE_URL`.
- **Backend**: FastAPI Web Service deployed as a **Render Web Service** running via Uvicorn (`0.0.0.0:$PORT`).
- **Production Database**: PostgreSQL (via `DATABASE_URL` environment variable; fallback to SQLite for local development).
- **External Content**: TVmaze public API called server-side by FastAPI.
- **ML Sentiment Engine**: `sentiment_model.pkl` + `vectorizer.pkl` loaded backend-only at FastAPI startup.

### Structure
```
/backend
  /app
    main.py
    /api          - auth.py, movies.py, reviews.py, notifications.py, preferences.py
    /models       - user.py, review.py, genre_preference.py, notification.py
    /schemas      - auth.py, movie.py, review.py, notification.py, preference.py
    /services     - sentiment_service.py, tvmaze_service.py, preference_service.py, notification_service.py
    /ml           - sentiment_model.pkl, vectorizer.pkl, predict.py
    /database     - database.py
    /core         - config.py, security.py

/frontend
  /src
    /components   - Navbar, NotificationBell, NotificationDropdown, NotificationItem, GenrePreferences, MovieCard, MovieGrid, SearchBar, RatingStars, ReviewForm, ReviewCard, SentimentBadge, LoadingIndicator, ErrorMessage, EmptyState
    /pages        - Home, Movies, MovieDetails, Login, Register, Profile, NotFound
    /services     - api.js, authApi.js, movieApi.js, reviewApi.js, notificationApi.js, preferenceApi.js
    /context      - AuthContext.jsx
    App.jsx
    main.jsx
    index.css     - Claymorphism design system
```

### Database Tables
- **users**: `id`, `username`, `email`, `hashed_password`, `notifications_enabled` (bool), `created_at`
- **reviews**: `id`, `movie_id` (TVmaze show ID), `user_id` (FK), `movie_title`, `movie_poster_url`, `rating` (1-5), `review_text`, `sentiment`, `confidence`, `created_at`, `updated_at`
  - UNIQUE constraint on `(user_id, movie_id)`
- **user_genre_preferences**: `id`, `user_id` (FK), `genre` (str), `score` (int), `updated_at`
  - UNIQUE constraint on `(user_id, genre)`
- **notifications**: `id`, `user_id` (FK), `external_movie_id` (int), `title` (str), `poster_url` (str), `message` (str), `matched_genres` (str), `is_read` (bool), `created_at`
  - UNIQUE constraint on `(user_id, external_movie_id)` for recommendation notifications.

### Personalized Genre Preferences & Algorithm
- **Preference Score Formula per Review**:
  - Rating Score: 5 stars (+3), 4 stars (+2), 3 stars (0), 2 stars (-1), 1 star (-2)
  - Sentiment Modifier: Positive (+1), Negative (-1)
  - Net genre impact = `Rating Score + Sentiment Modifier`
    - e.g., 5-star + Positive = +4
    - e.g., 1-star + Negative = -3
- **Recalculation Strategy**:
  - Automatically triggered upon Review Create, Edit, or Delete.
  - Recalculates all genre preference scores for the user from scratch using their active reviews to prevent score inflation or phantom preference persistence.
- **Interested Genre Threshold**:
  - A score `>= 2` indicates an interested genre.

### In-App Recommendation & Notification Engine
- **Matching & Deduplication**:
  - Scans newly discovered/recent titles from TVmaze.
  - Matches title genres against user's interested genres (`score >= 2`).
  - Skips titles already reviewed by the user.
  - Skips titles already notified (`unique(user_id, external_movie_id)`).
  - Consolidates multi-genre matches into a single notification per title (e.g. "New Crime & Thriller title you might like: Dark Winds").
- **Privacy & User Control**:
  - Users can toggle `notifications_enabled` (ON/OFF) in Profile settings.

### API Endpoints
- `POST  /api/auth/register`
- `POST  /api/auth/login`
- `GET   /api/auth/me`
- `GET   /api/movies`
- `GET   /api/movies/{id}`
- `GET   /api/movies/{id}/reviews`
- `POST  /api/movies/{id}/reviews`
- `PUT   /api/reviews/{id}`
- `DELETE /api/reviews/{id}`
- `GET   /api/users/me/reviews`
- `GET   /api/notifications`
- `GET   /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/read-all`
- `GET   /api/users/me/preferences`
- `PATCH /api/users/me/settings`

### Auth & Security
- JWT Bearer tokens.
- All notification and preference endpoints require JWT auth.
- Backend strictly derives `user_id` from token; frontend user IDs are never trusted.

### UI Theme — Claymorphism
- Dark navy/purple background
- Soft clay-like elevation (outer shadow + inset highlight)
- Interactive Claymorphism notification bell with unread badge counter and soft dropdown list
- Clay stat cards, genre progress bars, and tactile buttons
- Fully responsive across desktop, tablet, and mobile layouts

## Future Features (NOT in MVP)
- Browser push / SMS / Email notifications
- Review likes/votes & comment threads
- Admin analytics dashboard
