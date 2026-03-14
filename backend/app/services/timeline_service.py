"""Timeline service — aggregates case events into a timeline."""

from __future__ import annotations

from app.repositories.audit_repo import AuditRepo
from app.repositories.case_repo import CaseRepo
from app.repositories.evidence_repo import EvidenceRepo
from app.repositories.referral_repo import ReferralRepo
from app.repositories.score_repo import ScoreRepo


class TimelineService:
    def __init__(self) -> None:
        self.case_repo = CaseRepo()
        self.audit_repo = AuditRepo()
        self.evidence_repo = EvidenceRepo()
        self.referral_repo = ReferralRepo()
        self.score_repo = ScoreRepo()

    async def get_timeline(self, case_id: str) -> list[dict]:
        """Return a chronological timeline assembled from the case lifecycle."""
        case = await self.case_repo.find_by_id(case_id)
        if not case:
            return []

        events: list[dict] = []
        seen: set[tuple[str, str, str]] = set()

        def add_event(kind: str, timestamp: str | None, detail: str, **extra: object) -> None:
            if not timestamp:
                return
            key = (kind, timestamp, detail)
            if key in seen:
                return
            seen.add(key)
            payload = {
                "kind": kind,
                "timestamp": timestamp,
                "detail": detail,
                **extra,
            }
            events.append(payload)

        person = case.get("person", {}) or {}
        person_name = person.get("name") or person.get("person_id") or case.get("case_code") or case_id
        created_at = case.get("created_at")
        add_event(
            "case_created",
            created_at,
            f"Case opened for {person_name}.",
            case_code=case.get("case_code"),
            status=case.get("status"),
        )

        evidence_items = await self.evidence_repo.find_by_case(case_id)
        for item in sorted(evidence_items, key=lambda entry: entry.get("created_at", "")):
            evidence_type = str(item.get("evidence_type", "evidence")).replace("_", " ")
            trust_class = str(item.get("trust_class", "record")).replace("_", " ")
            source = item.get("source") or "case file"
            add_event(
                "evidence_submitted",
                item.get("created_at"),
                f"{evidence_type.title()} submitted as {trust_class}.",
                evidence_type=item.get("evidence_type"),
                trust_class=item.get("trust_class"),
                source=source,
                review_status=item.get("review_status"),
                details=item.get("details", {}),
            )
            reviewed_at = item.get("reviewed_at")
            review_state = item.get("state") or item.get("review_status")
            if reviewed_at and review_state:
                reviewer = item.get("reviewed_by") or "review officer"
                add_event(
                    "evidence_reviewed",
                    reviewed_at,
                    f"Evidence marked {str(review_state).replace('_', ' ')} by {reviewer}.",
                    evidence_type=item.get("evidence_type"),
                    review_status=review_state,
                    reviewed_by=reviewer,
                )

        score_snapshots = await self.score_repo.find_by_case(case_id)
        for score in score_snapshots:
            band = str(score.get("confidence_band", "under_review")).replace("_", " ")
            add_event(
                "score_computed",
                score.get("computed_at") or score.get("created_at"),
                f"Identity score updated to {score.get('predicted_score', 0)} ({band}).",
                predicted_score=score.get("predicted_score"),
                confidence_band=score.get("confidence_band"),
                model_name=score.get("model_name") or score.get("model_version"),
                top_factors=score.get("top_factors", []),
                blocking_constraints=score.get("blocking_constraints", []),
            )

        referrals = await self.referral_repo.find_by_case(case_id)
        for referral in sorted(referrals, key=lambda entry: entry.get("created_at", "")):
            referral_type = str(referral.get("referral_type", "support referral")).replace("_", " ")
            status = str(referral.get("status", "open")).replace("_", " ")
            target = referral.get("partner_id") or "partner queue"
            description = referral.get("description") or f"{referral_type.title()} referral created."
            add_event(
                "referral_created",
                referral.get("created_at"),
                description,
                referral_type=referral.get("referral_type"),
                referral_status=status,
                partner_id=target,
            )

        audit_entries = await self.audit_repo.get_log(case_id)
        for entry in audit_entries:
            action = str(entry.get("action", "case_event"))
            if action in {"add_evidence", "review_evidence", "create_referral", "case_created"}:
                continue
            add_event(
                action,
                entry.get("created_at"),
                self._describe_audit_entry(entry),
                user_id=entry.get("user_id"),
                payload=entry.get("details", {}),
            )

        updated_at = case.get("updated_at")
        if updated_at and updated_at != created_at and case.get("status"):
            add_event(
                "status_updated",
                updated_at,
                f"Case status is now {str(case.get('status')).replace('_', ' ')}.",
                status=case.get("status"),
            )

        return sorted(events, key=lambda entry: entry.get("timestamp") or "")

    def _describe_audit_entry(self, entry: dict) -> str:
        action = str(entry.get("action", "case_event")).replace("_", " ")
        details = entry.get("details", {}) or {}
        if isinstance(details, dict) and details:
            summary = ", ".join(
                f"{str(key).replace('_', ' ')}: {value}"
                for key, value in details.items()
            )
            return f"{action.title()} ({summary})."
        return action.title()
