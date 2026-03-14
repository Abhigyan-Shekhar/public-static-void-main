"""Supabase client — primary data store connection."""

from app.core.config import settings

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = None


def get_supabase_client():
    if not SUPABASE_AVAILABLE:
        raise RuntimeError(
            "supabase package is not installed. "
            "Run: pip install supabase, or use REPO_BACKEND=json in .env"
        )
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_KEY must be set. "
            "Check your .env file. See .env.example for template."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


_client = None


def get_client():
    global _client
    if _client is None:
        _client = get_supabase_client()
    return _client