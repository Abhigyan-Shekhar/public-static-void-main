"""Factory for selecting JSON or Supabase repository bundles."""

from __future__ import annotations

import os

from app.repositories.base import RepositoryBundle
from app.repositories.json_repo import get_json_repository_bundle
from app.repositories.supabase_repo import get_supabase_repository_bundle


def get_repository_bundle(backend: str | None = None) -> RepositoryBundle:
    selected = (backend or os.getenv("REPOSITORY_BACKEND", "json")).lower()

    if selected == "json":
        return get_json_repository_bundle()
    if selected == "supabase":
        return get_supabase_repository_bundle()

    raise ValueError(f"Unsupported repository backend: {selected}")
