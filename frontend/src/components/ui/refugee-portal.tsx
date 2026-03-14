"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Calendar, Clock3, FileText, Loader2, LogOut, MapPin, Moon, Shield, Sun, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { getCase, getCaseTimeline, listAnnouncements } from "../../lib/api";
import { clearSession, getSession } from "../../lib/auth";
import { applyTheme, getStoredTheme } from "../../lib/theme";
import { GradientButton } from "./gradient-button";
import { ShaderAnimation } from "./shader-animation";

type CaseRecord = Record<string, unknown>;
type AnnouncementRecord = Record<string, unknown>;
type TimelineRecord = Record<string, unknown>;

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    intake: "Intake recorded",
    intake_created: "Intake created",
    evidence_pending: "Pending evidence review",
    under_review: "Under review",
    provisional_identity: "Provisional identity",
    evidence_review: "Evidence review",
    verified: "Verified",
  };
  return labels[status] ?? status.replace(/_/g, " ");
}

export const RefugeePortal = () => {
  const session = getSession();
  const caseId = session?.caseId || "c1000000-0000-0000-0000-000000000001";
  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setIsDark(stored === "dark");
    applyTheme(stored);
  }, []);

  useEffect(() => {
    applyTheme(isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    async function loadPortal() {
      setLoading(true);
      setError(null);
      try {
        const [caseResponse, announcementResponse, timelineResponse] = await Promise.all([
          getCase(caseId),
          listAnnouncements(caseId),
          getCaseTimeline(caseId).catch(() => []),
        ]);
        setCaseData(caseResponse);
        setAnnouncements(announcementResponse);
        setTimeline(timelineResponse);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load refugee portal.");
      } finally {
        setLoading(false);
      }
    }

    void loadPortal();
  }, [caseId]);

  const person = (caseData?.person as Record<string, unknown> | undefined) ?? {};
  const name = String(person.name ?? session?.displayName ?? "Refugee user");
  const nationality = String(person.nationality ?? "Not recorded");
  const birthDate = String(person.date_of_birth ?? "Not recorded");
  const status = String(caseData?.status ?? "under_review");
  const shellClass = isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const heroClass = isDark
    ? "border-slate-800 bg-[#0f1e52] text-white"
    : "border-slate-200 bg-gradient-to-br from-blue-50 via-white to-slate-100 text-slate-900";
  const heroBadgeClass = isDark
    ? "border-white/15 bg-white/10 text-blue-100"
    : "border-blue-200 bg-white/80 text-blue-700";
  const heroTextClass = isDark ? "text-blue-100/80" : "text-slate-600";
  const heroPanelClass = isDark
    ? "border-white/15 bg-white/10 text-white"
    : "border-slate-200 bg-white text-slate-900 shadow-sm";
  const heroPanelLabelClass = isDark ? "text-blue-100/70" : "text-slate-500";
  const heroActionClass = isDark
    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100";
  const surfaceClass = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";
  const softPanelClass = isDark ? "bg-slate-800/70" : "bg-slate-50";
  const borderedCardClass = isDark ? "border-slate-800 bg-transparent" : "border-slate-200 bg-white";
  const titleClass = isDark ? "text-slate-100" : "text-slate-900";
  const mutedClass = isDark ? "text-slate-400" : "text-slate-500";
  const bodyTextClass = isDark ? "text-slate-300" : "text-slate-600";
  const badgeClass = isDark
    ? "bg-blue-900/30 text-blue-300"
    : "bg-blue-50 text-blue-700";
  const iconTileClass = isDark
    ? "bg-blue-900/40 text-blue-300"
    : "bg-blue-100 text-blue-700";
  const timelineItemClass = isDark
    ? "border-slate-800 bg-slate-800/70"
    : "border-slate-200 bg-slate-50";
  const emptyClass = isDark
    ? "border-slate-700 bg-slate-800/60 text-slate-400"
    : "border-slate-200 bg-slate-50 text-slate-500";
  const noteClass = isDark ? "bg-slate-800/70" : "bg-slate-50";

  const timelineCards = useMemo(() => {
    if (timeline.length > 0) {
      return timeline.slice(0, 4).map((item, index) => ({
        id: String(item.id ?? index),
        title: String(item.action ?? item.event_type ?? "Case update"),
        body: String(item.details ?? item.description ?? "Your case was updated by an officer."),
        date: String(item.created_at ?? item.timestamp ?? "Recently"),
      }));
    }

    return [
      {
        id: "fallback-1",
        title: "Officer review active",
        body: "Your intake has been received and is under manual verification.",
        date: "Latest update",
      },
    ];
  }, [timeline]);

  function handleLogout() {
    clearSession();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading refugee portal...
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/40 dark:bg-slate-900">
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Portal unavailable</div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{error ?? "No case data found for this login."}</p>
          <Link to="/login" className="mt-6 inline-flex text-sm font-semibold text-blue-600 hover:underline">
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${shellClass}`}>
      <div className={`relative overflow-hidden border-b ${heroClass}`}>
        <div className={`absolute inset-0 ${isDark ? "opacity-[0.2]" : "opacity-[0.1]"}`}>
          <ShaderAnimation className="h-full w-full" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${heroBadgeClass}`}>
                <Shield className="h-3.5 w-3.5" />
                Refugee self-service portal
              </div>
              <h1 className="mt-4 text-4xl font-black">My case and announcements</h1>
              <p className={`mt-3 max-w-2xl text-sm leading-6 ${heroTextClass}`}>
                This view is generated from the same case record officers review. Announcements and status updates appear here after officer action.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className={`rounded-2xl border px-4 py-3 text-sm ${heroPanelClass}`}>
                <div className={heroPanelLabelClass}>Case code</div>
                <div className="font-semibold">{String(caseData.case_code ?? caseId)}</div>
              </div>
              <button
                onClick={() => setIsDark((value) => !value)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${heroActionClass}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Light mode" : "Dark mode"}
              </button>
              <button
                onClick={handleLogout}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${heroActionClass}`}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <section className="space-y-6">
          <div className={`rounded-[28px] border p-6 shadow-sm ${surfaceClass}`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconTileClass}`}>
                  <UserRound className="h-7 w-7" />
                </div>
                <div>
                  <h2 className={`text-2xl font-black ${titleClass}`}>{name}</h2>
                  <div className={`mt-2 text-sm ${mutedClass}`}>
                    {nationality} • Date of birth: {birthDate}
                  </div>
                  <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${badgeClass}`}>
                    <Clock3 className="h-4 w-4" />
                    {statusLabel(status)}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`rounded-2xl px-4 py-3 ${softPanelClass}`}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Login ID</div>
                  <div className={`mt-1 font-mono text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>{session?.username ?? "officer issued"}</div>
                </div>
                <div className={`rounded-2xl px-4 py-3 ${softPanelClass}`}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Case ID</div>
                  <div className={`mt-1 font-mono text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>{caseId}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className={`rounded-2xl border p-4 ${borderedCardClass}`}>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Manual verification</div>
                <div className={`mt-2 text-lg font-bold ${titleClass}`}>Officer review required</div>
                <p className={`mt-2 text-sm ${mutedClass}`}>This case is updated only after officer checks and recorded evidence review.</p>
              </div>
              <div className={`rounded-2xl border p-4 ${borderedCardClass}`}>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current location</div>
                <div className={`mt-2 inline-flex items-center gap-2 text-lg font-bold ${titleClass}`}>
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Border intake queue
                </div>
                <p className={`mt-2 text-sm ${mutedClass}`}>Appointments and document requests will appear in announcements.</p>
              </div>
              <div className={`rounded-2xl border p-4 ${borderedCardClass}`}>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next action</div>
                <div className={`mt-2 text-lg font-bold ${titleClass}`}>Wait for officer update</div>
                <p className={`mt-2 text-sm ${mutedClass}`}>You can read notices here without visiting the officer workspace.</p>
              </div>
            </div>
          </div>

          <div id="case-progress" className={`rounded-[28px] border p-6 shadow-sm ${surfaceClass}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-black ${titleClass}`}>Case activity</h3>
                <p className={`mt-1 text-sm ${mutedClass}`}>Pulled from the existing case timeline and review history.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {timelineCards.map((item) => (
                <div key={item.id} className={`rounded-2xl border p-4 ${timelineItemClass}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className={`text-base font-semibold ${titleClass}`}>{item.title}</div>
                    <div className="text-xs text-slate-400">
                      {isNaN(Date.parse(item.date)) ? item.date : new Date(item.date).toLocaleString()}
                    </div>
                  </div>
                  <p className={`mt-2 text-sm leading-6 ${bodyTextClass}`}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className={`rounded-[28px] border p-6 shadow-sm ${surfaceClass}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-black ${titleClass}`}>Announcements</h3>
                <p className={`mt-1 text-sm ${mutedClass}`}>Official notices visible to the refugee side page.</p>
              </div>
              <Bell className="h-5 w-5 text-blue-600" />
            </div>

            <div className="mt-6 space-y-4">
              {announcements.length === 0 && (
                <div className={`rounded-2xl border border-dashed p-5 text-sm ${emptyClass}`}>
                  No announcements yet for this case.
                </div>
              )}
              {announcements.map((item, index) => (
                <div key={String(item.id ?? index)} className={`rounded-2xl border p-4 ${borderedCardClass}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className={`text-base font-semibold ${titleClass}`}>{String(item.title ?? "Announcement")}</div>
                      <p className={`mt-2 text-sm leading-6 ${bodyTextClass}`}>{String(item.body ?? "")}</p>
                    </div>
                    <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Official
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(String(item.created_at ?? Date.now())).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[28px] border p-6 shadow-sm ${surfaceClass}`}>
            <h3 className={`text-xl font-black ${titleClass}`}>Officer note</h3>
            <p className={`mt-2 text-sm leading-6 ${mutedClass}`}>
              Access to the main dashboard, cases database, evidence review, and announcements manager stays limited to officers and approved partners.
            </p>

            <div className={`mt-5 rounded-2xl p-4 ${noteClass}`}>
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className={`text-sm ${bodyTextClass}`}>
                  Refugee logins are created by officers. The credential format is first 3 letters of the name + birth year for username, and first 3 letters + border office code + birth date for password.
                </div>
              </div>
            </div>

            <GradientButton
              className="mt-6 w-full rounded-2xl py-3"
              type="button"
              onClick={() => document.getElementById("case-progress")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              View current case progress
            </GradientButton>
          </div>
        </section>
      </div>
    </div>
  );
};
