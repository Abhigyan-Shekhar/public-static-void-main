"""Shared pytest fixtures for the BorderBridge backend test suite."""
import json
from pathlib import Path

import pytest

# ── directories ──────────────────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent.parent
SEED_DIR = BACKEND_DIR / "data" / "seed"

# Files that tests mutate (via TestClient → JsonStore).
# We snapshot them before each test and restore after.
MUTABLE_TABLES = [
    "cases.json",
    "evidence_items.json",
    "score_snapshots.json",
    "audit_logs.json",
    "referrals.json",
    "announcements.json",
]


def pytest_collection_modifyitems(items):
    """Move tests that use asyncio.run() directly to the end of the run.

    On Windows + Python 3.14, calling asyncio.run() inside a pytest session
    that also uses anyio (via starlette TestClient) can corrupt the event loop
    and cause subsequent TestClient calls to crash with exit code -1073741510.
    Moving these tests last avoids the issue entirely.
    """
    LAST_FILES = {"test_repository_factory.py"}
    tail, head = [], []
    for item in items:
        if item.fspath.basename in LAST_FILES:
            tail.append(item)
        else:
            head.append(item)
    items[:] = head + tail


@pytest.fixture(autouse=True)
def restore_seed_files():
    """Snapshot mutable seed files before each test, restore them after."""
    snapshots: dict[Path, bytes] = {}
    for filename in MUTABLE_TABLES:
        path = SEED_DIR / filename
        if path.exists():
            snapshots[path] = path.read_bytes()
        else:
            snapshots[path] = None  # type: ignore[assignment]

    yield  # run the test

    for path, original in snapshots.items():
        if original is None:
            if path.exists():
                path.unlink()
        else:
            path.write_bytes(original)
