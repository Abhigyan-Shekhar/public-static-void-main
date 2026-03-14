from app.ml.feature_builder import build_case_features, build_features


def test_build_features_counts_evidence_classes():
    features = build_features(
        evidence_list=[
            {"evidence_type": "verified_ngo_record", "trust_class": "official", "review_status": "accepted"},
            {"evidence_type": "family_confirmation", "trust_class": "corroborated", "review_status": "accepted"},
            {"evidence_type": "profile_details", "trust_class": "self_declared", "review_status": "pending"},
        ],
        family_links=[{"trust_state": "verified"}],
        documents=[{"state": "verified"}],
        external_links=[{"match_status": "confirmed"}],
        days_in_system=12,
    )

    assert features["official_evidence_count"] == 1
    assert features["corroborated_evidence_count"] == 1
    assert features["self_declared_count"] == 1
    assert features["accepted_official_count"] == 1
    assert features["accepted_corroborated_count"] == 1
    assert features["verified_family_links_count"] == 1
    assert features["documents_verified_count"] == 1
    assert features["external_confirmed_matches"] == 1
    assert features["days_in_system"] == 12


def test_build_case_features_tracks_rejected_evidence():
    case = {"created_at": "2026-03-10T00:00:00+00:00"}
    evidence = [
        {
            "evidence_type": "verified_ngo_record",
            "trust_class": "official",
            "review_status": "accepted",
        },
        {
            "evidence_type": "government_record",
            "trust_class": "official",
            "review_status": "rejected",
        },
    ]

    features = build_case_features(case=case, evidence_list=evidence, family_links=[])

    assert features["official_evidence_count"] == 2
    assert features["accepted_official_count"] == 1
    assert features["rejected_count"] == 1
    assert features["verified_ngo_record_present"] == 1
    assert features["government_record_present"] == 1
