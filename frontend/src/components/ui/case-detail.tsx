"use client"
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Loader2,
  X,
  FileCheck
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { EvidenceGraph } from "./evidence-graph";
import { GradientButton } from "./gradient-button";
import { ShaderAnimation } from "./shader-animation";
import {
  getCase,
  listEvidence,
  getLatestScore,
  recomputeScore,
  addEvidence,
  reviewEvidence,
} from "../../lib/api";

type Evidence = Record<string, unknown>;
type ScoreData = Record<string, unknown> | null;

// ── helper: map backend status values to labels
function statusLabel(s: string) {
  const m: Record<string, string> = {
    pending: "Pending Review",
    accepted: "Accepted",
    rejected: "Rejected",
    disputed: "Disputed",
  };
  return m[s] ?? s;
}

function evidenceClassLabel(c: string) {
  const m: Record<string, string> = {
    official: "Official",
    ngo_validated: "NGO Validated",
    corroborated: "Corroborated",
    self_declared: "Self-Declared",
  };
  return m[c] ?? c;
}

// ── Add Evidence Modal
function AddEvidenceModal({
  caseId,
  personId,
  onClose,
  onAdded,
}: {
  caseId: string;
  personId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [evidenceClass, setEvidenceClass] = useState("official");
  const [evidenceType, setEvidenceType] = useState("");
  const [payloadText, setPayloadText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceType.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      let payload: Record<string, unknown> = {};
      if (payloadText.trim()) {
        try {
          payload = JSON.parse(payloadText);
        } catch {
          payload = { note: payloadText.trim() };
        }
      }
      await addEvidence(caseId, {
        case_id: caseId,
        person_id: personId,
        evidence_class: evidenceClass,
        evidence_type: evidenceType.trim(),
        payload,
      });
      onAdded();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add evidence.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Evidence</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence Type</label>
            <input
              type="text"
              required
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              placeholder="e.g. passport, biometric_scan, ngo_letter"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trust Class</label>
            <select
              value={evidenceClass}
              onChange={(e) => setEvidenceClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="official">Official</option>
              <option value="ngo_validated">NGO Validated</option>
              <option value="corroborated">Corroborated</option>
              <option value="self_declared">Self-Declared</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payload (optional JSON or plain text)</label>
            <textarea
              rows={3}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              placeholder='{"doc_number": "A123456"} or plain note'
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <GradientButton type="submit" className="flex-1 py-2 rounded-lg" disabled={submitting || !evidenceType.trim()}>
              {submitting ? "Adding…" : "Add Evidence"}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Create Referral Modal (navigates to /referrals with state)
function navigateToReferrals(caseId: string) {
  window.location.href = `/referrals?caseId=${caseId}`;
}

export const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const caseId = id ?? "";

  const [caseData, setCaseData] = useState<Record<string, unknown> | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData>(null);
  const [loading, setLoading] = useState(true);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadCase = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, ev, sc] = await Promise.all([
        getCase(caseId),
        listEvidence(caseId),
        getLatestScore(caseId).catch(() => null),
      ]);
      setCaseData(c);
      setEvidence(ev);
      setScoreData(sc);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load case.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { loadCase(); }, [loadCase]);

  const handleRecompute = async () => {
    if (!caseId) return;
    setScoreLoading(true);
    try {
      await recomputeScore(caseId);
      const sc = await getLatestScore(caseId);
      setScoreData(sc);
    } catch (err: unknown) {
      console.error("Recompute failed:", err);
    } finally {
      setScoreLoading(false);
    }
  };

  const handleReview = async (evidenceId: string, state: "accepted" | "rejected" | "disputed") => {
    setReviewingId(evidenceId);
    try {
      await reviewEvidence(evidenceId, state);
      setEvidence((prev) =>
        prev.map((e) =>
          String(e.id ?? e.evidence_id) === evidenceId ? { ...e, state } : e
        )
      );
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="font-medium">Loading case {caseId}…</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4 text-red-500">
          <AlertCircle className="h-10 w-10" />
          <p className="font-medium">{error ?? "Case not found."}</p>
          <Link to="/cases" className="text-sm text-blue-600 hover:underline">← Back to Cases</Link>
        </div>
      </div>
    );
  }

  const status = String(caseData.status ?? "");
  const person = (caseData.person as Record<string, unknown> | undefined) ?? {};
  const personId = String(person.name ?? caseData.person_id ?? "");
  const intakeLoc = String(caseData.intake_location ?? caseData.owner_agency ?? "");
  const ownerAgency = String(caseData.owner_agency ?? "");
  const caseCode = String(caseData.case_code ?? caseId);

  const predictedScore = scoreData ? Number((scoreData as Record<string, unknown>).predicted_score ?? 0) : null;
  const confidenceBand = scoreData ? String((scoreData as Record<string, unknown>).confidence_band ?? "") : null;
  const featureSnapshot = scoreData
    ? ((scoreData as Record<string, unknown>).feature_snapshot as Record<string, unknown> | null)
    : null;
  const explanation = scoreData
    ? ((scoreData as Record<string, unknown>).explanation as Record<string, unknown> | null)
    : null;
  const topLevelConstraints = scoreData
    ? ((scoreData as Record<string, unknown>).blocking_constraints as string[] | undefined)
    : undefined;
  const constraints = topLevelConstraints && topLevelConstraints.length > 0
    ? topLevelConstraints
    : explanation
      ? (explanation.constraints as string[] | undefined)
      : undefined;

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-gray-50/50 dark:bg-gray-950 font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.1]">
          <ShaderAnimation className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/94 via-gray-50/82 to-gray-50/96 dark:from-gray-950/95 dark:via-gray-950/86 dark:to-gray-950/96" />
      </div>
      <div className="relative z-10 flex-1 overflow-auto p-4 md:p-8 max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm font-medium text-gray-500 mb-6 group">
          <Link to="/cases" className="flex items-center hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" /> Cases
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 font-semibold">{caseCode}</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Case {caseCode}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-gray-500 text-sm max-w-xl">
              Manage evidence, review identity flags, and monitor confidence scores.
            </p>
          </div>

          {/* Score Widget */}
          <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl p-4 min-w-[220px] gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Confidence Score</p>
              {predictedScore !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900 dark:text-gray-100">{predictedScore}</span>
                  {confidenceBand && (
                    <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">
                      {confidenceBand}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Not scored yet</span>
              )}
            </div>
            {predictedScore !== null ? (
              predictedScore >= 60 ? (
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-6 w-6 text-yellow-600" />
                </div>
              )
            ) : null}
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Person Details */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Person Details</h2>
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Person ID</dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{personId}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Location
                      </dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">{intakeLoc || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Agency
                      </dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">{ownerAgency || "—"}</dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Case Code</dt>
                    <dd className="text-sm font-mono text-gray-900 dark:text-gray-100">{caseCode}</dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Score Breakdown */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Score Breakdown</h2>
                <p className="text-xs text-gray-500 mt-1">Feature snapshot from the ML engine.</p>
              </div>
              <div className="p-4">
                {featureSnapshot && Object.keys(featureSnapshot).length > 0 ? (
                  <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                    {Object.entries(featureSnapshot).map(([key, val]) => {
                      const numVal = Number(val);
                      const isPositive = numVal > 0;
                      const isNegative = numVal < 0;
                      return (
                        <li key={key} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${isPositive ? "bg-green-100 text-green-600" : isNegative ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : isNegative ? <TrendingDown className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key.replace(/_/g, " ")}</span>
                          </div>
                          <span className={`text-sm font-bold ${isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500"}`}>
                            {isPositive ? "+" : ""}{String(val)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : scoreData !== null ? (
                  <p className="text-sm text-gray-400 text-center py-4">No feature data available yet.</p>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Run "Recompute Score" to see breakdown.</p>
                )}
                {/* Governance constraints */}
                {constraints && constraints.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Governance Constraints</p>
                    <ul className="space-y-1">
                      {constraints.map((c, i) => (
                        <li key={i} className="text-xs text-amber-800 dark:text-amber-300 flex gap-2">
                          <span>⚠</span><span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Evidence Table */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Submitted Evidence</h2>
                  <p className="text-sm text-gray-500 mt-1">{evidence.length} item{evidence.length !== 1 ? "s" : ""} on record</p>
                </div>
                <GradientButton
                  className="h-10 px-4 py-2 min-w-0 rounded-lg"
                  onClick={() => setShowAddEvidence(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Evidence
                </GradientButton>
              </div>

              {evidence.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                  <FileText className="h-10 w-10" />
                  <p className="font-medium text-gray-500">No evidence yet</p>
                  <button
                    onClick={() => setShowAddEvidence(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Add the first piece of evidence →
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {evidence.map((item) => {
                        const eId = String(item.id ?? item.evidence_id ?? "");
                        const eState = String(item.state ?? "pending");
                        const reviewing = reviewingId === eId;
                        return (
                          <tr key={eId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileCheck className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {String(item.evidence_type ?? item.type ?? "")}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {evidenceClassLabel(String(item.evidence_class ?? item.class ?? ""))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <EvidenceStateBadge state={eState} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              {eState === "pending" && (
                                <div className="flex gap-2 justify-end">
                                  <button
                                    disabled={reviewing}
                                    onClick={() => handleReview(eId, "accepted")}
                                    className="px-3 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
                                  >
                                    {reviewing ? "…" : "Accept"}
                                  </button>
                                  <button
                                    disabled={reviewing}
                                    onClick={() => handleReview(eId, "rejected")}
                                    className="px-3 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    disabled={reviewing}
                                    onClick={() => handleReview(eId, "disputed")}
                                    className="px-3 py-1 text-xs font-semibold rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50 transition-colors"
                                  >
                                    Dispute
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <EvidenceGraph personName={personId} evidence={evidence} />
          </div>
        </div>

        {/* Timeline link */}
        <div className="mt-6">
          <Link
            to={`/timeline/${caseId}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Clock className="h-4 w-4" /> View Full Timeline
          </Link>
        </div>

        {/* Action Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            onClick={handleRecompute}
            disabled={scoreLoading}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors flex items-center justify-center disabled:opacity-60"
          >
            {scoreLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Recompute Score
          </button>
          <GradientButton
            className="w-full sm:w-auto rounded-lg"
            onClick={() => navigateToReferrals(caseId)}
          >
            Create Referral <ChevronRight className="h-4 w-4 ml-1" />
          </GradientButton>
        </div>
      </div>

      {showAddEvidence && (
        <AddEvidenceModal
          caseId={caseId}
          personId={personId}
          onClose={() => setShowAddEvidence(false)}
          onAdded={loadCase}
        />
      )}
    </div>
  );
};

// ── Helpers
const StatusBadge = ({ status }: { status: string }) => {
  const m: Record<string, { label: string; cls: string }> = {
    arrival_recorded:  { label: "Arrival Recorded",  cls: "bg-gray-50 text-gray-700 border-gray-200" },
    evidence_review:   { label: "Evidence Review",   cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    provisional:       { label: "Provisional",       cls: "bg-blue-50 text-blue-700 border-blue-200" },
    verified:          { label: "Verified",           cls: "bg-green-50 text-green-700 border-green-200" },
    integration_ready: { label: "Integration Ready", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    closed:            { label: "Closed",             cls: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const e = m[status] ?? { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${e.cls}`}>
      {status === "evidence_review" && <Clock className="h-3 w-3 mr-1" />}
      {status === "verified" && <ShieldCheck className="h-3 w-3 mr-1" />}
      {e.label}
    </span>
  );
};

const EvidenceStateBadge = ({ state }: { state: string }) => {
  const m: Record<string, string> = {
    accepted: "bg-green-100 text-green-700",
    rejected:  "bg-red-100 text-red-700",
    disputed:  "bg-orange-100 text-orange-700",
    pending:   "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${m[state] ?? "bg-gray-100 text-gray-700"}`}>
      {statusLabel(state)}
    </span>
  );
};

export default CaseDetail;
