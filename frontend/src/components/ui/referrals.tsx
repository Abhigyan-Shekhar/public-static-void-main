import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  HeartPulse,
  Home,
  Loader2,
  LogOut,
  Moon,
  MessageCircle,
  Scale,
  Send,
  Sparkles,
  Sun,
} from "lucide-react";

import { AuthorityLayout } from "./authority-layout";
import { GradientButton } from "./gradient-button";
import { createReferral, listCases, updateReferral } from "../../lib/api";
import { clearSession, getSession } from "../../lib/auth";
import { applyTheme, getStoredTheme } from "../../lib/theme";

type Case = Record<string, unknown>;
type Referral = Record<string, unknown>;

const REFERRAL_TYPES = [
  { value: "employment", label: "Employment", icon: Briefcase, color: "text-sky-600", tint: "bg-sky-50 border-sky-100" },
  { value: "housing", label: "Housing", icon: Home, color: "text-indigo-600", tint: "bg-indigo-50 border-indigo-100" },
  { value: "education", label: "Education", icon: BookOpen, color: "text-orange-600", tint: "bg-orange-50 border-orange-100" },
  { value: "legal_aid", label: "Legal Aid", icon: Scale, color: "text-slate-600", tint: "bg-slate-50 border-slate-200" },
  { value: "healthcare", label: "Healthcare", icon: HeartPulse, color: "text-rose-600", tint: "bg-rose-50 border-rose-100" },
  { value: "language", label: "Language", icon: MessageCircle, color: "text-emerald-600", tint: "bg-emerald-50 border-emerald-100" },
];

function statusColor(status: string) {
  if (status === "open") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === "accepted") return "bg-green-50 text-green-700 border-green-200";
  if (status === "declined") return "bg-red-50 text-red-700 border-red-200";
  if (status === "completed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "approved") return "bg-green-50 text-green-700 border-green-200";
  if (status === "pending" || status === "processing") return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (status === "rejected") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function ReferralManager({ partnerMode, isDark = false }: { partnerMode: boolean; isDark?: boolean }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const preselectedCaseId = params.get("caseId") ?? "";
  const session = getSession();

  const [cases, setCases] = useState<Case[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId);
  const [referralType, setReferralType] = useState("employment");
  const [fromAgency, setFromAgency] = useState(partnerMode ? "Border authority desk" : "");
  const [toAgency, setToAgency] = useState(partnerMode ? String(session?.displayName ?? "Partner services team") : "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const caseList = await listCases();
      setCases(caseList);
      if (!selectedCaseId && caseList.length > 0) {
        setSelectedCaseId(String(caseList[0].case_id ?? caseList[0].id ?? ""));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load cases.");
    } finally {
      setLoading(false);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;

    setSubmitting(true);
    setSubmitResult(null);
    try {
      const created = await createReferral(selectedCaseId, {
        case_id: selectedCaseId,
        referral_type: referralType,
        from_agency: fromAgency || (partnerMode ? "Border authority desk" : "Authority desk"),
        to_agency: toAgency || (partnerMode ? String(session?.displayName ?? "Partner services team") : "Partner services queue"),
        reason: reason || undefined,
      });
      setReferrals((prev) => [created, ...prev]);
      setSubmitResult({
        ok: true,
        message: partnerMode
          ? `Partner action recorded for case ${selectedCaseId}.`
          : `Referral created for case ${selectedCaseId}.`,
      });
      setReason("");
      if (!partnerMode) {
        setFromAgency("");
        setToAgency("");
      }
    } catch (err: unknown) {
      setSubmitResult({ ok: false, message: err instanceof Error ? err.message : "Failed to create referral." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (referralId: string, status: string) => {
    try {
      const updated = await updateReferral(referralId, status);
      setReferrals((prev) =>
        prev.map((r) => (String(r.id ?? "") === referralId ? { ...r, ...updated } : r))
      );
    } catch (err) {
      console.error("Update referral failed:", err);
    }
  };

  const typeCount = (type: string) => referrals.filter((r) => String(r.referral_type ?? "") === type).length;
  const partnerStatCardClass = isDark
    ? "border-slate-800 bg-slate-900"
    : "";
  const partnerStatTileClass = isDark ? "bg-slate-800" : "bg-white";
  const partnerQueueHeaderClass = isDark
    ? "bg-slate-900"
    : "bg-[linear-gradient(135deg,#f8fffb_0%,#eefcf5_100%)]";
  const partnerFormClass = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4fff8_100%)]";
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" /> Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
        <AlertCircle className="h-8 w-8" />
        <p className="font-medium">{error}</p>
        <button onClick={loadData} className="text-sm text-blue-600 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={`grid gap-4 ${partnerMode ? "md:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"}`}>
        {REFERRAL_TYPES.slice(0, partnerMode ? 3 : REFERRAL_TYPES.length).map(({ value, label, icon: Icon, color, tint }) => (
          <div key={value} className={`rounded-2xl border p-4 shadow-sm ${partnerMode ? `${tint} ${partnerStatCardClass}` : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"}`}>
            <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${partnerMode ? partnerStatTileClass : "bg-slate-50 dark:bg-slate-800"}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{typeCount(value)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-6 ${partnerMode ? "xl:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-3"}`}>
        <div className={`${partnerMode ? "" : "lg:col-span-2"} overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900`}>
          <div className={`flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800 ${partnerMode ? partnerQueueHeaderClass : "bg-slate-50/70 dark:bg-slate-800/70"}`}>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{partnerMode ? "Partner actions queue" : "Referrals pipeline"}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {partnerMode ? "Manage accepted referrals and confirm support steps." : `${referrals.length} created this session`}
              </p>
            </div>
            {partnerMode && (
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>Partner workspace</div>
            )}
          </div>

          {referrals.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-3 text-gray-400">
              <Send className="h-8 w-8" />
              <p className="font-medium">{partnerMode ? "No partner actions yet" : "No referrals yet"}</p>
              <p className="text-sm">{partnerMode ? "Use the panel to confirm service availability for a case." : "Use the form to create a referral for a case."}</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Case</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Agency</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {referrals.map((r, i) => {
                    const rId = String(r.id ?? i);
                    const rType = String(r.referral_type ?? "");
                    const caseId = String(r.case_id ?? "");
                    const toOrg = String(r.to_agency ?? "—");
                    const status = String(r.status ?? "pending");
                    const typeInfo = REFERRAL_TYPES.find((t) => t.value === rType);
                    const Icon = typeInfo?.icon ?? Send;
                    return (
                    <tr key={rId} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{caseId}</td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center text-sm font-medium ${typeInfo?.color ?? "text-slate-500"}`}>
                            <Icon className="mr-2 h-4 w-4" />
                            {rType.replace(/_/g, " ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{toOrg}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select
                            value={status}
                            onChange={(e) => handleUpdateStatus(rId, e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          >
                            <option value="open">Open</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`rounded-[28px] border p-6 shadow-sm ${partnerMode ? partnerFormClass : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
          <h3 className="mb-6 flex items-center text-lg font-semibold">
            {partnerMode ? <Building2 className="mr-2 h-5 w-5 text-emerald-600" /> : <Send className="mr-2 h-5 w-5 text-blue-500" />}
            {partnerMode ? "Partner action panel" : "New referral"}
          </h3>

          {submitResult && (
            <div className={`mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium ${submitResult.ok ? "border border-green-200 bg-green-50 text-green-800" : "border border-red-200 bg-red-50 text-red-800"}`}>
              {!submitResult.ok && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              {submitResult.message}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Case <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Select a case…</option>
                  {cases.map((c) => {
                    const cId = String(c.case_id ?? c.id ?? "");
                    const label = String((c.person as Record<string, unknown> | undefined)?.name ?? c.person_id ?? cId);
                    return (
                      <option key={cId} value={cId}>
                        {label} ({cId})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Service type</label>
              <div className="relative">
                <select
                  value={referralType}
                  onChange={(e) => setReferralType(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {REFERRAL_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{partnerMode ? "Referring desk" : "From agency"}</label>
              <input
                type="text"
                value={fromAgency}
                onChange={(e) => setFromAgency(e.target.value)}
                placeholder={partnerMode ? "Border authority desk" : "e.g. UNHCR"}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{partnerMode ? "Partner organization" : "To agency / organization"}</label>
              <input
                type="text"
                value={toAgency}
                onChange={(e) => setToAgency(e.target.value)}
                placeholder={partnerMode ? "e.g. Community Housing Network" : "e.g. City Housing Authority"}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{partnerMode ? "Support update" : "Reason"}</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={partnerMode ? "Describe the support step, availability, or follow-up..." : "Brief context for this referral…"}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="pt-2">
              <GradientButton type="submit" className="flex w-full items-center justify-center rounded-lg py-3" disabled={submitting || !selectedCaseId}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitting ? "Saving…" : partnerMode ? "Record partner action" : "Create referral"}
              </GradientButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PartnerWorkspace() {
  const session = getSession();
  const [isDark, setIsDark] = useState(false);
  const shellClass = isDark ? "bg-slate-950 text-slate-100" : "bg-[linear-gradient(180deg,#f6fff9_0%,#ffffff_42%,#f8fafc_100%)] text-slate-900";
  const heroClass = isDark
    ? "border-slate-800 bg-[linear-gradient(135deg,#0f5132_0%,#1f7a52_55%,#65c18c_100%)] text-white"
    : "border-emerald-100 bg-[linear-gradient(135deg,#dff8ea_0%,#f8fffb_45%,#eefcf5_100%)] text-slate-900";
  const badgeClass = isDark
    ? "border-white/15 bg-white/10 text-white"
    : "border-emerald-200 bg-white/80 text-emerald-700";
  const copyClass = isDark ? "text-emerald-50/85" : "text-slate-600";
  const infoCardClass = isDark
    ? "border-white/15 bg-white/10 text-white"
    : "border-slate-200 bg-white text-slate-900 shadow-sm";
  const infoLabelClass = isDark ? "text-emerald-100/80" : "text-slate-500";
  const actionClass = isDark
    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100";
  const partnerInfoCardClass = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-emerald-100 bg-white";

  useEffect(() => {
    const stored = getStoredTheme();
    setIsDark(stored === "dark");
    applyTheme(stored);
  }, []);

  useEffect(() => {
    applyTheme(isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} ${shellClass}`}>
      <div className={`border-b ${heroClass}`}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Partner workspace
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">Partner / NGO Access</h1>
              <p className={`mt-3 max-w-2xl text-sm leading-6 ${copyClass}`}>
                A dedicated workspace for verified organizations to receive referrals, update service capacity, and confirm support actions without entering the officer dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className={`rounded-2xl border px-4 py-3 text-sm ${infoCardClass}`}>
                <div className={infoLabelClass}>Signed in as</div>
                <div className="font-semibold">{session?.displayName ?? "Partner services team"}</div>
              </div>
              <button
                onClick={() => setIsDark((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${actionClass}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              <button
                onClick={() => {
                  clearSession();
                  window.location.href = "/";
                }}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${actionClass}`}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Verified referrals", "Only approved or authorized partner actions appear here."],
            ["Service updates", "Record housing, health, education, and language support steps."],
            ["Role separation", "Partner view is separate from officer-only protected endpoints."],
          ].map(([title, copy]) => (
            <div key={title} className={`rounded-[24px] border p-5 shadow-sm ${partnerInfoCardClass}`}>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{copy}</p>
            </div>
          ))}
        </div>

        <ReferralManager partnerMode isDark={isDark} />
      </div>
    </div>
  );
}

export const ReferralsPage = () => {
  const session = getSession();
  const partnerMode = session?.role === "partner";

  if (partnerMode) {
    return <PartnerWorkspace />;
  }

  return (
    <AuthorityLayout title="Referrals & Services" subtitle="Connect verified refugees with integration and support services.">
      <ReferralManager partnerMode={false} />
    </AuthorityLayout>
  );
};
