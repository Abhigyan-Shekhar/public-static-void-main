import { useState, useEffect, useCallback } from "react";
import { AuthorityLayout } from "./authority-layout";
import { Check, X, FileText, Fingerprint, Users, Link as LinkIcon, AlertCircle, Loader2 } from "lucide-react";
import { GradientButton } from "./gradient-button";
import { listCases, listEvidence, reviewEvidence } from "../../lib/api";

type EvidenceItem = Record<string, unknown>;

function evidenceIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("finger") || t.includes("biometric")) return Fingerprint;
  if (t.includes("family") || t.includes("link")) return Users;
  if (t.includes("link") || t.includes("ngo")) return LinkIcon;
  return FileText;
}

function confLabel(ev: EvidenceItem): string {
  const cls = String(ev.evidence_class ?? ev.class ?? "").toLowerCase();
  if (cls === "official") return "High";
  if (cls === "ngo_validated" || cls === "corroborated") return "Medium";
  return "Low";
}

export const EvidenceReviewPage = () => {
  const [queue, setQueue] = useState<EvidenceItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cases = await listCases();
      // Load evidence for each case, keep only pending items
      const evidenceLists = await Promise.all(
        cases.slice(0, 10).map((c) =>
          listEvidence(String(c.case_id ?? c.id ?? "")).then((ev) =>
            // Attach case info to each evidence item
            ev.map((e) => ({
              ...e,
              _case_id: c.case_id ?? c.id,
              _person_id: (c.person as Record<string, unknown> | undefined)?.name ?? c.person_id,
            } as EvidenceItem))
          ).catch(() => [] as EvidenceItem[])
        )
      );
      const allEvidence: EvidenceItem[] = evidenceLists.flat() as EvidenceItem[];
      // Show pending first, then others
      const pending = allEvidence.filter((e) => String(e.state ?? "pending") === "pending");
      const others = allEvidence.filter((e) => String(e.state ?? "pending") !== "pending");
      const sorted = [...pending, ...others];
      setQueue(sorted);
      if (sorted.length > 0) {
        setSelectedId(String(sorted[0].id ?? sorted[0].evidence_id ?? ""));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load evidence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const handleReview = async (state: "accepted" | "rejected" | "disputed") => {
    if (!selectedId) return;
    setReviewingId(selectedId);
    try {
      await reviewEvidence(selectedId, state);
      // Update state locally
      setQueue((prev) =>
        prev.map((e) =>
          String(e.id ?? e.evidence_id ?? "") === selectedId ? { ...e, state } : e
        )
      );
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setReviewingId(null);
    }
  };

  const activeEvidence = queue.find(
    (e) => String(e.id ?? e.evidence_id ?? "") === selectedId
  );

  const pendingCount = queue.filter((e) => String(e.state ?? "pending") === "pending").length;

  return (
    <AuthorityLayout title="Evidence Review" subtitle="Verify submitted documents and identity claims.">
      {loading ? (
        <div className="flex items-center justify-center py-32 gap-3 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading evidence queue…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-red-500">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium">{error}</p>
          <button onClick={loadQueue} className="text-sm text-blue-600 hover:underline">Retry</button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">

          {/* Queue List */}
          <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Evidence Queue{" "}
                <span className="text-xs font-normal text-gray-500">
                  ({pendingCount} pending of {queue.length})
                </span>
              </h3>
            </div>
            <div className="flex-1 overflow-auto divide-y divide-gray-100 dark:divide-gray-800">
              {queue.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                  <FileText className="h-8 w-8" />
                  <p className="text-sm font-medium">No evidence items</p>
                </div>
              ) : (
                queue.map((e) => {
                  const eId = String(e.id ?? e.evidence_id ?? "");
                  const eType = String(e.evidence_type ?? e.type ?? "Evidence");
                  const personId = String(e._person_id ?? e.person_id ?? "");
                  const caseId = String(e._case_id ?? e.case_id ?? "");
                  const conf = confLabel(e);
                  const Icon = evidenceIcon(eType);
                  const eState = String(e.state ?? "pending");
                  return (
                    <button
                      key={eId}
                      onClick={() => setSelectedId(eId)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedId === eId
                          ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-500"
                          : "border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          eState !== "pending"
                            ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            : conf === "High"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : conf === "Medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}>
                          {eState !== "pending" ? eState.charAt(0).toUpperCase() + eState.slice(1) : `${conf} Conf.`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{eType.replace(/_/g, " ")}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{personId} ({caseId})</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail View */}
          <div className="w-full lg:w-2/3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
            {activeEvidence ? (
              <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {String(activeEvidence.evidence_type ?? activeEvidence.type ?? "Evidence").replace(/_/g, " ")}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Person: {String(activeEvidence._person_id ?? activeEvidence.person_id ?? "—")} •{" "}
                      Case: {String(activeEvidence._case_id ?? activeEvidence.case_id ?? "—")}
                    </p>
                  </div>
                  {String(activeEvidence.state ?? "pending") === "pending" && (
                    <div className="flex gap-2">
                      <button
                        disabled={!!reviewingId}
                        onClick={() => handleReview("rejected")}
                        className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/10 dark:hover:bg-red-900/30 rounded-lg flex items-center font-medium transition-colors disabled:opacity-60"
                      >
                        {reviewingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                        {reviewingId ? "…" : "Reject"}
                      </button>
                      <GradientButton
                        className="px-4 py-2 rounded-lg flex items-center shadow-sm"
                        disabled={!!reviewingId}
                        onClick={() => handleReview("accepted")}
                      >
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </GradientButton>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 overflow-auto">
                  {/* Document placeholder */}
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center mb-6">
                    <FileText className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">[Document Preview Rendered Here]</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider">Metadata</h4>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                        {[
                          ["Evidence Class", String(activeEvidence.evidence_class ?? "—").replace(/_/g, " ")],
                          ["State", String(activeEvidence.state ?? "pending")],
                          ["Case ID", String(activeEvidence._case_id ?? activeEvidence.case_id ?? "—")],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payload preview */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider">Payload</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-lg">
                        <pre className="text-xs text-blue-800 dark:text-blue-300 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                          {activeEvidence.payload
                            ? JSON.stringify(activeEvidence.payload, null, 2)
                            : "No payload data."}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Dispute option */}
                  {String(activeEvidence.state ?? "pending") === "pending" && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <button
                        disabled={!!reviewingId}
                        onClick={() => handleReview("disputed")}
                        className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium disabled:opacity-60"
                      >
                        {reviewingId ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Mark as Disputed
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Select evidence from the queue to review.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthorityLayout>
  );
};
