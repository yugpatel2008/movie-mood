# 🎬 MovieMood

**Watch. Review. Feel the Mood.**

MovieMood is an ML-powered movie review platform that lets users browse movies, write reviews, and automatically analyzes the sentiment behind every review using a machine learning model.

## ✨ Features

- 🎬 Browse and search a curated movie collection
- ⭐ Rate movies from 1–5 stars
- ✍️ Write detailed reviews
- 🤖 Automatic ML-powered sentiment analysis (Positive/Negative)
- 📊 Audience Mood statistics per movie
- 🔐 JWT authentication (register, login, logout)
- 👤 Profile page with personal review history
- ✏️ Edit your own reviews (ML re-runs on edit)
- 🗑️ Delete your own reviews
- ⚠️ Rating-sentiment mismatch detection
- 🎨 Claymorphism UI design system

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, JavaScript, React Router, Axios |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic, JWT |
| **Database** | SQLite (PostgreSQL-ready) |
| **ML** | scikit-learn MultinomialNB, CountVectorizer, NLTK |
| **UI** | Claymorphism design with Tailwind CSS v4 |

## 📁 Project Structure

```
MovieMood/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, seed data, startup
│   │   ├── api/                  # Route handlers
│   │   │   ├── auth.py           # Register, login, me
│   │   │   ├── movies.py         # Movie listing and details
│   │   │   └── reviews.py        # CRUD reviews, user reviews
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Sentiment service
│   │   ├── ml/                   # ML model files and predict.py
│   │   │   ├── sentiment_model.pkl
│   │   │   ├── vectorizer.pkl
│   │   │   └── predict.py
│   │   ├── database/             # Database setup
│   │   └── core/                 # Config, security
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API service layer
│   │   ├── context/              # Auth context
│   │   ├── index.css             # Claymorphism design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── PRD.md
├── run.bat
└── README.md
```

## 🤖 ML Model

- **Algorithm**: MultinomialNB (Naive Bayes)
- **Vectorizer**: CountVectorizer with 5000 features
- **Training**: IMDB movie review dataset
- **Classes**: Binary — **Positive** and **Negative** only
- **Confidence**: Available via `predict_proba()`
- **Files**: `backend/app/ml/sentiment_model.pkl`, `backend/app/ml/vectorizer.pkl`
- **Preprocessing**: HTML removal → non-alpha removal → lowercase → Porter stemming → stopword removal

## 🚀 Getting Started

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data (automatic on first run)

# Copy env file
copy .env.example .env

# Run backend
uvicorn app.main:app --reload
```

Backend will be at: **http://localhost:8000**
API docs: **http://localhost:8000/api/docs**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend will be at: **http://localhost:5173**

### Quick Start (Windows)

Double-click `run.bat` to start both servers simultaneously.

## 🔧 Environment Variables

### Backend (`backend/.env`)

```
SECRET_KEY=your-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./moviemood.db
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/movies` | No | List movies (with search) |
| GET | `/api/movies/{id}` | No | Movie details + stats |
| GET | `/api/movies/{id}/reviews` | No | Movie reviews |
| POST | `/api/movies/{id}/reviews` | Yes | Create review + ML |
| PUT | `/api/reviews/{id}` | Yes | Edit review + ML rerun |
| DELETE | `/api/reviews/{id}` | Yes | Delete own review |
| GET | `/api/users/me/reviews` | Yes | My review history |

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Backend enforces ownership on review edit/delete
- User ID derived from token, never from frontend
- Unique constraints on username, email, and (user_id, movie_id)

## 🐛 Troubleshooting

| Issue | Solution |
|-------|---------|
| `ModuleNotFoundError` | Activate venv: `venv\Scripts\activate` |
| CORS errors | Check `FRONTEND_URL` in backend `.env` |
| ML model error | Ensure `sentiment_model.pkl` and `vectorizer.pkl` exist in `backend/app/ml/` |
| NLTK error | Run `python -c "import nltk; nltk.download('stopwords')"` |
| Login fails | Backend must be running at port 8000 |

## 🚀 Deploying MovieMood on Render

MovieMood is configured for 1-click or manual deployment on **Render**.

### Option A: 1-Click Deployment with `render.yaml` (Blueprint)
1. Push this repository to GitHub.
2. In Render, click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and provision:
   - Render PostgreSQL Database (`moviemood-db`)
   - Backend FastAPI Web Service (`moviemood-backend`)
   - Frontend Static Site (`moviemood-frontend`)

---

### Option B: Manual Deployment Steps

#### 1. Database Setup (Render PostgreSQL)
1. In Render Dashboard, click **New +** → **PostgreSQL**.
2. Name: `moviemood-db`, Database: `moviemood`, User: `moviemood_user`.
3. Choose the **Free** tier.
4. Copy the **Internal Database URL** (or External Database URL if connecting externally).

#### 2. Backend Deployment (Render Web Service)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `moviemood-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `ENVIRONMENT`: `production`
   - `SECRET_KEY`: `<generate-a-strong-random-secret-key>`
   - `DATABASE_URL`: `<your-render-postgresql-url>`
   - `FRONTEND_URL`: `<your-render-frontend-url>` (e.g. `https://moviemood.onrender.com`)
5. Click **Create Web Service** and copy the deployed backend URL (e.g. `https://moviemood-api.onrender.com`).

#### 3. Frontend Deployment (Render Static Site)
1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `moviemood-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   - `VITE_API_BASE_URL`: `<your-deployed-backend-url>` (e.g. `https://moviemood-api.onrender.com/api`)
5. **SPA Redirect Rule**:
   - Go to **Redirects / Rewrites** in the static site settings.
   - Add rule: `Source: /*` -> `Destination: /index.html` (Action: `Rewrite`).
6. Click **Create Static Site**.

