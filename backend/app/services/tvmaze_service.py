"""
TVmaze API service for MovieMood.
Handles all communication with https://api.tvmaze.com
Normalizes responses to a MovieMood-agnostic format so the provider
can be swapped (e.g. TMDB, OMDb) without changing the rest of the app.
"""

import httpx
import re
import time
from app.core.config import settings

TVMAZE_BASE = "https://api.tvmaze.com"
_CLIENT_TIMEOUT = 10.0

# ── Simple in-memory TTL cache ──────────────────────────────────────
_cache: dict = {}
_CACHE_TTL = 300  # 5 minutes


def _get_cached(key: str):
    entry = _cache.get(key)
    if entry and (time.time() - entry[1]) < _CACHE_TTL:
        return entry[0]
    _cache.pop(key, None)
    return None


def _set_cache(key: str, value):
    _cache[key] = (value, time.time())


# ── Helpers ─────────────────────────────────────────────────────────
def _get_params(extra: dict = None) -> dict:
    params = extra.copy() if extra else {}
    if settings.TVMAZE_API_KEY:
        params["apikey"] = settings.TVMAZE_API_KEY
    return params


def _strip_html(text: str | None) -> str:
    """Remove HTML tags from TVmaze summaries."""
    if not text:
        return ""
    return re.sub(r"<[^>]+>", "", text).strip()


def _normalize_show(raw: dict) -> dict:
    """Convert a raw TVmaze show object to MovieMood's normalized format."""
    image = raw.get("image") or {}
    rating = raw.get("rating") or {}
    premiered = raw.get("premiered") or ""

    release_year = None
    if premiered:
        try:
            release_year = int(premiered[:4])
        except (ValueError, IndexError):
            pass

    genres = raw.get("genres") or []

    return {
        "id": raw.get("id"),
        "title": raw.get("name") or "Unknown",
        "poster_url": image.get("medium") or image.get("original"),
        "genres": genres,
        "genre": ", ".join(genres) if genres else None,
        "summary": _strip_html(raw.get("summary")),
        "description": _strip_html(raw.get("summary")),
        "release_date": premiered or None,
        "release_year": release_year,
        "external_rating": rating.get("average"),
        "language": raw.get("language"),
        "status": raw.get("status"),
    }


# ── Public API ──────────────────────────────────────────────────────
def get_shows(page: int = 0) -> list[dict]:
    """Fetch a page of shows from TVmaze (250 per page)."""
    cache_key = f"shows_page_{page}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    try:
        resp = httpx.get(
            f"{TVMAZE_BASE}/shows",
            params=_get_params({"page": page}),
            timeout=_CLIENT_TIMEOUT,
        )
        resp.raise_for_status()
        shows = [_normalize_show(s) for s in resp.json()]
        # Filter out shows without images for better UX
        shows_with_images = [s for s in shows if s["poster_url"]]
        _set_cache(cache_key, shows_with_images)
        return shows_with_images
    except Exception as e:
        print(f"[TVmaze] get_shows error: {e}")
        return []


def search_shows(query: str) -> list[dict]:
    """Search for shows on TVmaze."""
    if not query or not query.strip():
        return []

    cache_key = f"search_{query.lower().strip()}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    try:
        resp = httpx.get(
            f"{TVMAZE_BASE}/search/shows",
            params=_get_params({"q": query}),
            timeout=_CLIENT_TIMEOUT,
        )
        resp.raise_for_status()
        results = resp.json()
        shows = [_normalize_show(r["show"]) for r in results if r.get("show")]
        _set_cache(cache_key, shows)
        return shows
    except Exception as e:
        print(f"[TVmaze] search error: {e}")
        return []


def get_show(show_id: int) -> dict | None:
    """Fetch details for a single show by TVmaze ID."""
    cache_key = f"show_{show_id}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    try:
        resp = httpx.get(
            f"{TVMAZE_BASE}/shows/{show_id}",
            params=_get_params(),
            timeout=_CLIENT_TIMEOUT,
        )
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        show = _normalize_show(resp.json())
        _set_cache(cache_key, show)
        return show
    except Exception as e:
        print(f"[TVmaze] get_show({show_id}) error: {e}")
        return None
