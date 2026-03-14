import { useState, useEffect, useCallback } from "react";
import { AuthorityLayout } from "./authority-layout";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, UserCheck, ShieldCheck, HeartHandshake,
  Clock, Loader2, AlertCircle, ListChecks
} from "lucide-react";
import { GradientButton } from "./gradient-button";
import { getCaseTimeline, getCase, listCases } from "../../lib/api";

type TimelineEntry = Record<string, unknown>;

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .filter((item) => item !== "—")
      .join(", ");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key.replace(/_/g, " ")}: ${formatValue(item)}`)
      .join(", ");
  }
  return String(value);
}

function eventIcon(kind: string) {
  const k = kind.toLowerCase();
  if (k.includes("arrival") || k.includes("intake") || k.includes("created")) return MapPin;
  if (k.includes("evidence") || k.includes("review")) return UserCheck;
  if (k.includes("score") || k.includes("verified") || k.includes("verif")) return ShieldCheck;
  if (k.includes("referral") || k.includes("integration")) return HeartHandshake;
  return ListChecks;
}

function eventColor(kind: string) {
  const k = kind.toLowerCase();
  if (k.includes("arrival") || k.includes("intake") || k.includes("created")) return "bg-blue-500";
  if (k.includes("evidence") || k.includes("review")) return "bg-indigo-500";
  if (k.includes("score") || k.includes("verif")) return "bg-green-500";
  if (k.includes("referral")) return "bg-purple-500";
  return "bg-gray-400";
}

function formatDate(ts: string | undefined) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export const CaseTimelinePage = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const [caseId, setCaseId] = useState<string>(routeId ?? "");
  const [casePersonId, setCasePersonId] = useState<string>("");
  const [caseStatus, setCaseStatus] = useState<string>("—");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async () => {
    let id = routeId ?? "";
    if (!id) {
      try {
        const cases = await listCases();
        if (cases.length > 0) id = String(cases[0].case_id ?? cases[0].id ?? "");
      } catch {
        setError("No cases found.");
        setLoading(false);
        return;
      }
    }
    setCaseId(id);

    try {
      const [caseData, events] = await Promise.all([
        getCase(id),
        getCaseTimeline(id),
      ]);
      const person = (caseData.person as Record<string, unknown> | undefined) ?? {};
      setCasePersonId(String(person.name ?? caseData.person_id ?? id));
      setCaseStatus(String(caseData.status ?? "—"));
      setTimeline(events);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load timeline.");
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  useEffect(() => { resolve(); }, [resolve]);

  const statusLabel = (s: string) => {
    const m: Record<string, string> = {
      arrival_recorded: "Arrival Recorded",
      evidence_review: "Evidence Review",
      provisional: "Provisional",
      verified: "Verified",
      integration_ready: "Integration Ready",
      closed: "Closed",
    };
    return m[s] ?? s;
  };

  return (
    <AuthorityLayout
      title="Case Timeline Journey"
      subtitle={casePersonId ? `Visual progress tracking for ${casePersonId}` : "Loading case…"}
    >
      <div className="max-w-4xl mx-auto py-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            to={caseId ? `/case/${caseId}` : "/cases"}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {caseId ? "Back to Case Details" : "Back to Cases"}
          </Link>
          {caseStatus && caseStatus !== "—" && (
            <GradientButton className="h-9 px-4 rounded-lg pointer-events-none shadow-sm opacity-90">
              Status: {statusLabel(caseStatus)}
            </GradientButton>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 gap-3 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" /> Loading timeline…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p className="font-medium">{error}</p>
            <Link to="/cases" className="text-sm text-blue-600 hover:underline">Back to Cases</Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-8 sm:p-12 relative">
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
                <Clock className="h-10 w-10" />
                <p className="font-medium text-gray-500">No timeline events yet</p>
                <p className="text-sm text-center text-gray-400">
                  Events will appear here as actions are taken on this case<br />
                  (evidence submissions, reviews, scoring runs, referrals).
                </p>
                <Link
                  to={caseId ? `/case/${caseId}` : "/cases"}
                  className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Go to Case →
                </Link>
              </div>
            ) : (
              <>
                {/* Connecting line */}
                <div className="absolute left-[92px] sm:left-[118px] top-24 bottom-24 w-1 -translate-x-1/2 bg-gradient-to-b from-blue-500 via-indigo-500 to-gray-200 dark:to-gray-800 rounded-full" />

                <div className="space-y-12">
                  {timeline.map((event, idx) => {
                    const kind = String(event.kind ?? event.event_type ?? event.action ?? "event");
                    const detail = formatValue(event.detail ?? event.description ?? event.payload ?? "");
                    const ts = String(event.timestamp ?? event.created_at ?? "");
                    const Icon = eventIcon(kind);
                    const color = eventColor(kind);
                    const isLast = idx === timeline.length - 1;

                    return (
                      <div key={idx} className="relative grid grid-cols-[120px_minmax(0,1fr)] gap-6 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-12">
                        <div className="relative z-10 flex min-w-0 flex-col items-center">
                          <div className={`h-12 w-12 rounded-full ${color} border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-md shrink-0`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {ts && (
                            <div className="mt-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                              {formatDate(ts)}
                            </div>
                          )}
                        </div>
                        <div className={`min-w-0 pt-1 ${isLast ? "" : ""}`}>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                            {kind.replace(/_/g, " ")}
                          </h3>
                          {detail && (
                            <p className="text-sm text-gray-500 mt-1 mb-3">{detail}</p>
                          )}
                          {/* Extra fields */}
                          {Object.entries(event)
                            .filter(([k]) => !["kind", "event_type", "action", "detail", "description", "timestamp", "created_at", "id", "case_id"].includes(k))
                            .length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                              <dl className="space-y-1">
                                {Object.entries(event)
                                  .filter(([k]) => !["kind", "event_type", "action", "detail", "description", "timestamp", "created_at", "id", "case_id", "payload"].includes(k))
                                  .map(([k, v]) => (
                                    <div key={k} className="flex gap-2 text-sm">
                                      <dt className="text-gray-500 font-medium capitalize">{k.replace(/_/g, " ")}:</dt>
                                      <dd className="text-gray-700 dark:text-gray-300">{formatValue(v)}</dd>
                                    </div>
                                  ))}
                              </dl>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AuthorityLayout>
  );
};
