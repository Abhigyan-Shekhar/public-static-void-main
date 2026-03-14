
import { useState, useEffect, useCallback } from "react";
import { AuthorityLayout } from "./authority-layout";
import { ShieldCheck, RefreshCw, Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { EvidenceGraph } from "./evidence-graph";
import { listCases, getLatestScore, recomputeScore } from "../../lib/api";
import { Link, useParams } from "react-router-dom";

type ScoreResult = Record<string, unknown> | null;

const BAND_COLORS: Record<string, string> = {
  low:    "bg-red-100 text-red-700 border-red-200",
  provisional:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  verified:      "bg-blue-100 text-blue-700 border-blue-200",
  high_confidence: "bg-green-100 text-green-700 border-green-200",
};

export const ScoringPage = () => {
  const { id: routeId } = useParams<{ id?: string }>();

  const [caseId, setCaseId] = useState<string | null>(routeId ?? null);
  const [caseLabel, setCaseLabel] = useState<string>("");
  const [score, setScore] = useState<ScoreResult>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no route id, pick first case
  const resolveCaseId = useCallback(async () => {
    if (routeId) {
      setCaseId(routeId);
      setCaseLabel(routeId);
      return;
    }
    try {
      const cases = await listCases();
      if (cases.length > 0) {
        const first = cases[0];
        const id = String(first.case_id ?? first.id ?? "");
        const person = (first.person as Record<string, unknown> | undefined) ?? {};
        setCaseId(id);
        setCaseLabel(String(person.name ?? first.person_id ?? id));
      } else {
        setError("No cases found. Register a case first.");
        setLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load cases.");
      setLoading(false);
    }
  }, [routeId]);

  useEffect(() => { resolveCaseId(); }, [resolveCaseId]);

  const loadScore = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const s = await getLatestScore(caseId);
      setScore(s);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load score.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => { if (caseId) loadScore(); }, [caseId, loadScore]);

  const handleRecompute = async () => {
    if (!caseId) return;
    setRecomputing(true);
    try {
      await recomputeScore(caseId);
      await loadScore();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Recompute failed.");
    } finally {
      setRecomputing(false);
    }
  };

  const predictedScore = score ? Number((score as Record<string, unknown>).predicted_score ?? 0) : null;
  const confidenceBand = score ? String((score as Record<string, unknown>).confidence_band ?? "") : null;
  const featureSnapshot = score
    ? ((score as Record<string, unknown>).feature_snapshot as Record<string, unknown> | null)
    : null;
  const explanation = score
    ? ((score as Record<string, unknown>).explanation as Record<string, unknown> | null)
    : null;
  const constraints = explanation
    ? (explanation.constraints as string[] | undefined)
    : undefined;

  // Score bar needle position (0-100 mapped to 0-100%)
  const needlePct = predictedScore !== null ? Math.min(100, Math.max(0, predictedScore)) : null;

  return (
    <AuthorityLayout
      title="Manual Verification"
      subtitle="Review explainable random forest signals alongside officer-led verification."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Scoring Overview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {caseLabel || "Loading case…"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {caseId ? `Case ${caseId} • Verification analysis` : "Loading…"}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 px-6 py-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Current Confidence</p>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mt-1" />
                  ) : predictedScore !== null ? (
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                      {predictedScore}
                      <span className="text-lg font-medium text-blue-500 dark:text-blue-500/70">/100</span>
                    </p>
                  ) : (
                    <p className="text-sm text-blue-500 italic mt-1">Not scored yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Score Ranges Bar */}
            <div className="mb-10">
              <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>0</span><span>39</span><span>59</span><span>79</span><span>100</span>
              </div>
              <div className="h-4 w-full flex rounded-full overflow-hidden shadow-inner relative">
                <div className="h-full bg-red-400/80 w-[40%] flex items-center justify-center relative group cursor-pointer">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap">Under Review</span>
                </div>
                <div className="h-full bg-yellow-400/80 w-[20%] flex items-center justify-center relative group cursor-pointer">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap">Provisional</span>
                </div>
                <div className="h-full bg-blue-500 w-[20%] flex items-center justify-center relative group cursor-pointer">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap">Verified</span>
                </div>
                <div className="h-full bg-green-500/80 w-[20%] flex items-center justify-center relative group cursor-pointer">
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap">High Confidence</span>
                </div>
                {/* Needle */}
                {needlePct !== null && (
                  <div
                    className="absolute top-0 h-full w-1 bg-gray-900 dark:bg-white rounded-full shadow z-10 transition-all duration-500"
                    style={{ left: `${needlePct}%` }}
                  />
                )}
              </div>
            </div>

            {/* Recompute Button */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleRecompute}
                disabled={recomputing || loading || !caseId}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {recomputing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Recompute Score
              </button>
              {caseId && (
                <Link
                  to={`/case/${caseId}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                >
                  ← Back to Case
                </Link>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">
              Identity Evidence Map
            </h3>
            <EvidenceGraph />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Confidence Band Badge */}
          {confidenceBand && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Confidence Band</h3>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${BAND_COLORS[confidenceBand] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {confidenceBand.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Feature Snapshot Breakdown */}
          {featureSnapshot && Object.keys(featureSnapshot).length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Feature Snapshot</h3>
              <ul className="space-y-3">
                {Object.entries(featureSnapshot).map(([key, val]) => {
                  const numVal = Number(val);
                  const isPos = numVal > 0;
                  const isNeg = numVal < 0;
                  return (
                    <li key={key} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        {isPos ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> : isNeg ? <TrendingDown className="h-3.5 w-3.5 text-red-400" /> : <span className="h-3.5 w-3.5" />}
                        <span>{key.replace(/_/g, " ")}</span>
                      </div>
                      <span className={`font-semibold ${isPos ? "text-green-600" : isNeg ? "text-red-500" : "text-gray-500"}`}>
                        {isPos ? "+" : ""}{String(val)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Governance Constraints */}
          {constraints && constraints.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-700/30 pb-3 mb-4">
                Governance Constraints
              </h3>
              <ul className="space-y-2">
                {constraints.map((c, i) => (
                  <li key={i} className="text-sm text-amber-800 dark:text-amber-300 flex gap-2">
                    <span className="mt-0.5">⚠</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score Ranges Guide */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-sm text-white">
              <h3 className="font-semibold mb-2">Verification bands guide</h3>
            <ul className="text-sm space-y-3 opacity-90">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-red-300 font-medium">0–39</span> <span>Under Review</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-yellow-300 font-medium">40–59</span> <span>Provisional</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-blue-300 font-medium">60–79</span> <span>Verified</span>
              </li>
              <li className="flex justify-between">
                <span className="text-green-300 font-medium">80+</span> <span>High Confidence</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
};
