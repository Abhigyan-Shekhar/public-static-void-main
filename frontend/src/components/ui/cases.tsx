
import { useState, useEffect, useCallback } from "react";
import { AuthorityLayout } from "./authority-layout";
import { Link } from "react-router-dom";
import { Filter, Search, PlusCircle, Loader2, AlertCircle } from "lucide-react";
import { listCases } from "../../lib/api";

type Case = Record<string, unknown>;

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    arrival_recorded: "Arrival Recorded",
    evidence_review: "Evidence Review",
    provisional: "Provisional",
    verified: "Verified",
    integration_ready: "Integration Ready",
    closed: "Closed",
  };
  return map[status] ?? status;
}

function StatusBadge({ status }: { status: string }) {
  const label = getStatusLabel(status);
  const color =
    status === "integration_ready" || status === "verified"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800"
      : status === "evidence_review"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800"
      : status === "provisional"
      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
      : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
}

function ScoreBar({ score }: { score: number | null }) {
  if (score === null || score === undefined)
    return <span className="text-xs text-gray-400">N/A</span>;
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : "bg-yellow-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-bold">{pct}</span>
    </div>
  );
}

export const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const STATUS_OPTIONS = [
    "arrival_recorded",
    "evidence_review",
    "provisional",
    "verified",
    "integration_ready",
    "closed",
  ];

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: string; search?: string } = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const data = await listCases(params);
      setCases(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load cases.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchCases, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCases, search]);

  return (
    <AuthorityLayout title="Cases" subtitle="View and manage individual refugee cases.">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, or Origin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" /> Filter Status
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[180px] py-1">
                <button
                  onClick={() => { setStatusFilter(""); setShowFilter(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-gray-700 dark:text-gray-200"
                >
                  All Statuses
                </button>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilter(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${statusFilter === s ? "font-semibold text-blue-600" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {getStatusLabel(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/registration"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4" /> New Case
          </Link>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" /> Loading cases…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
              <AlertCircle className="h-8 w-8" />
              <p className="font-medium">{error}</p>
              <button onClick={fetchCases} className="text-sm text-blue-600 hover:underline">Retry</button>
            </div>
          ) : cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No cases found.</p>
              <Link to="/registration" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="h-4 w-4" /> Register First Case
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-semibold text-xs tracking-wider uppercase border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">Case ID / Person</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Confidence Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {cases.map((c) => {
                  const id = String(c.case_id ?? c.id ?? c.case_code ?? "");
                  const caseCode = String(c.case_code ?? c.case_id ?? c.id ?? "");
                  const person = (c.person as Record<string, unknown> | undefined) ?? {};
                  const personId = String(person.name ?? c.person_id ?? id);
                  const intakeLoc = String(c.intake_location ?? c.owner_agency ?? "—");
                  const status = String(c.status ?? "");
                  const latestScore = c.latest_score as Record<string, unknown> | number | null | undefined;
                  const rawScore =
                    typeof latestScore === "number"
                      ? latestScore
                      : latestScore && typeof latestScore === "object"
                        ? Number(latestScore.predicted_score ?? NaN)
                        : NaN;
                  const score = !isNaN(rawScore) ? rawScore : null;
                  return (
                    <tr key={id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{personId}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{caseCode}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{intakeLoc}</td>
                      <td className="px-6 py-4"><StatusBadge status={status} /></td>
                      <td className="px-6 py-4"><ScoreBar score={score} /></td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/case/${id}`}
                          className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 rounded-md transition-colors"
                        >
                          View Case
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        {!loading && !error && cases.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 flex justify-between items-center">
            <span>Showing {cases.length} case{cases.length !== 1 ? "s" : ""}</span>
            <button onClick={fetchCases} className="text-xs text-blue-600 hover:underline">Refresh</button>
          </div>
        )}
      </div>
    </AuthorityLayout>
  );
};
