from app.repositories.factory import get_repository_bundle
from app.repositories.json_repo import get_json_repository_bundle


def test_factory_returns_json_bundle_by_default():
    bundle = get_repository_bundle("json")

    assert bundle.cases is not None
    assert bundle.scores is not None
    assert bundle.audit is not None


def test_json_bundle_uses_shared_store():
    bundle = get_json_repository_bundle()

    assert bundle.cases.store is bundle.evidence.store
    assert bundle.evidence.store is bundle.scores.store
