
import { useState, useEffect, useCallback } from "react";
import { AuthorityLayout } from "./authority-layout";
import { Megaphone, Calendar, Users, Send, Loader2, AlertCircle, X } from "lucide-react";
import { GradientButton } from "./gradient-button";
import { listCases, listAnnouncements, createAnnouncement } from "../../lib/api";

type Announcement = Record<string, unknown>;
type Case = Record<string, unknown>;

function announcementStatus(a: Announcement): string {
  return String(a.status ?? a.state ?? "active");
}

function statusBadge(status: string) {
  if (status === "active") return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800";
  if (status === "scheduled") return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
  if (status === "draft") return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400";
  return "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:border-gray-700";
}

export const AnnouncementsPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [timing, setTiming] = useState("immediate");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; message: string } | null>(null);

  const loadAnnouncements = useCallback(async (caseId: string) => {
    if (!caseId) return;
    try {
      const data = await listAnnouncements(caseId);
      setAnnouncements(data);
    } catch {
      setAnnouncements([]);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const caseList = await listCases();
      setCases(caseList);
      if (caseList.length > 0) {
        const firstId = String(caseList[0].case_id ?? caseList[0].id ?? "");
        setSelectedCaseId(firstId);
        await loadAnnouncements(firstId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load cases.");
    } finally {
      setLoading(false);
    }
  }, [loadAnnouncements]);

  useEffect(() => { init(); }, [init]);

  const handleCaseChange = async (caseId: string) => {
    setSelectedCaseId(caseId);
    await loadAnnouncements(caseId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCaseId) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const created = await createAnnouncement({
        title: title.trim(),
        body: message.trim(),
        announcement_type: timing === "immediate" ? "screening_update" : "scheduled_notice",
        target_type: "case",
        target_ref: selectedCaseId,
        target_case_id: selectedCaseId,
      });
      setAnnouncements((prev) => [created, ...prev]);
      setSubmitResult({ ok: true, message: "Announcement broadcast successfully." });
      setTitle("");
      setMessage("");
    } catch (err: unknown) {
      setSubmitResult({ ok: false, message: err instanceof Error ? err.message : "Failed to broadcast." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthorityLayout
      title="Announcements"
      subtitle="Broadcast official communications, schedules, and updates to designated groups."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Announcements List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm flex flex-col h-[calc(100vh-200px)]">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 dark:bg-gray-800/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Megaphone className="h-5 w-5 mr-2 text-blue-500" /> Communications History
            </h3>

            {/* Case filter */}
            {cases.length > 0 && (
              <select
                value={selectedCaseId}
                onChange={(e) => handleCaseChange(e.target.value)}
                className="text-sm px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {cases.map((c) => {
                  const cId = String(c.case_id ?? c.id ?? "");
                  return (
                    <option key={cId} value={cId}>
                      {String(c.person_id ?? cId)}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="flex-1 overflow-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading…
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
                <AlertCircle className="h-6 w-6" />
                <p>{error}</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <Megaphone className="h-8 w-8" />
                <p className="font-medium text-gray-500">No announcements for this case yet.</p>
                <p className="text-sm">Use the form to broadcast the first one.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Title</th>
                    <th className="px-4 py-3 font-semibold">Audience</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {announcements.map((a, i) => {
                    const status = announcementStatus(a);
                    const dateStr = a.created_at
                      ? new Date(String(a.created_at)).toLocaleDateString()
                      : String(a.scheduled_for ?? "—");
                    return (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {String(a.title ?? "Announcement")}
                          </p>
                          {!!a.body && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                              {String(a.body)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-3 w-3 mr-1.5" /> {String(a.target_type ?? "All")}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{dateStr}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${statusBadge(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 overflow-auto">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Send className="h-5 w-5 mr-2 text-blue-500" /> New Broadcast
          </h3>

          {submitResult && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2 ${submitResult.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {!submitResult.ok && <X className="h-4 w-4 shrink-0 mt-0.5" />}
              {submitResult.message}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Case selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Case <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              >
                <option value="">Select a case…</option>
                {cases.map((c) => {
                  const cId = String(c.case_id ?? c.id ?? "");
                  return (
                    <option key={cId} value={cId}>
                      {String(c.person_id ?? cId)} ({cId})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Announcement subject…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Body</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Detail the context of the announcement…"
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publish Timeline</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="timing" checked={timing === "immediate"} onChange={() => setTiming("immediate")} className="text-blue-600 focus:ring-blue-500" />
                  Publish Immediately
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-500">
                  <input type="radio" name="timing" checked={timing === "scheduled"} onChange={() => setTiming("scheduled")} className="text-blue-600 focus:ring-blue-500" />
                  Schedule <Calendar className="h-4 w-4 ml-1" />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <GradientButton
                type="submit"
                className="w-full rounded-lg py-3 flex justify-center items-center"
                disabled={submitting || !title.trim() || !selectedCaseId}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {submitting ? "Broadcasting…" : "Broadcast Now"}
              </GradientButton>
            </div>
          </form>
        </div>
      </div>
    </AuthorityLayout>
  );
};
