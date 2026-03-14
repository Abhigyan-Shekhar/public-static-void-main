
import { useState, useEffect } from "react";
import { AuthorityLayout } from "./authority-layout";
import {
  Monitor, Tag, BarChart3, Users, Clock, AlertCircle, FileText, PlusCircle, ArrowRight, Wifi, WifiOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "./gradient-button";
import { listCases, healthCheck } from "../../lib/api";

type Case = Record<string, unknown>;

export const AuthorityDashboard = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Health check
    healthCheck()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));

    // Load cases for dashboard metrics
    listCases()
      .then((data) => setCases(data))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

  // Derive metrics from real data
  const total = cases.length;
  const evidencePending = cases.filter(
    (c) => String(c.status) === "evidence_review"
  ).length;
  const integrationReady = cases.filter(
    (c) => String(c.status) === "integration_ready"
  ).length;
  const provisional = cases.filter(
    (c) => String(c.status) === "provisional"
  ).length;

  // Pipeline counts
  const arrivalCount = cases.filter((c) => String(c.status) === "arrival_recorded").length;
  const reviewCount = cases.filter((c) =>
    ["evidence_review", "provisional"].includes(String(c.status))
  ).length;
  const verifiedCount = cases.filter((c) => String(c.status) === "verified").length;
  const intCount = integrationReady;

  const recentCases = [...cases].slice(0, 5);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      arrival_recorded: "Intake Completed",
      evidence_review: "Evidence Pending",
      provisional: "Provisional",
      verified: "Verified",
      integration_ready: "Integration Ready",
      closed: "Closed",
    };
    return map[status] ?? status;
  };
  const statusColor = (status: string) => {
    if (status === "integration_ready" || status === "verified") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (status === "evidence_review") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (status === "provisional") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400";
  };

  return (
    <AuthorityLayout
      title="Dashboard"
      subtitle="Overview of protected border actions and case flow"
      headerActions={
        <div className="flex items-center gap-3">
          {/* Backend health indicator */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {backendOk === null ? (
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
            ) : backendOk ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-green-600 dark:text-green-400 hidden sm:inline">API Online</span>
                <Wifi className="h-3.5 w-3.5 text-green-500 sm:hidden" />
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-600 dark:text-red-400 hidden sm:inline">API Offline</span>
                <WifiOff className="h-3.5 w-3.5 text-red-500 sm:hidden" />
              </>
            )}
          </div>
          <GradientButton
            className="h-9 px-3 py-1 min-w-0"
            onClick={() => (window.location.href = "/registration")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Register Case
          </GradientButton>
        </div>
      }
    >
      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Active Cases"
          value={loading ? "—" : String(total)}
          icon={<Monitor className="h-5 w-5" />}
          color="text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
          trend={loading ? "Loading…" : `${total} total`}
        />
        <MetricCard
          label="Evidence Pending"
          value={loading ? "—" : String(evidencePending)}
          icon={<Clock className="h-5 w-5" />}
          color="text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20"
          trend="Needs verification"
        />
        <MetricCard
          label="Provisional Cases"
          value={loading ? "—" : String(provisional)}
          icon={<AlertCircle className="h-5 w-5" />}
          color="text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
          trend="Awaiting scoring"
        />
        <MetricCard
          label="Integration Ready"
          value={loading ? "—" : String(integrationReady)}
          icon={<Users className="h-5 w-5" />}
          color="text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
          trend="Passed verification"
        />
      </div>

      {/* Case Pipeline Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-lg font-semibold mb-6 flex justify-between items-center">
          Case Processing Pipeline
          <Link to="/cases" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
        </h3>
        <div className="w-full relative py-6">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 -translate-y-1/2" />
          <div className="relative flex justify-between">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 border-4 border-white dark:border-gray-900 flex items-center justify-center relative z-10 shadow-sm">
                <PlusCircle className="h-4 w-4 text-white" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Arrival / Intake</p>
                <p className="text-xs text-gray-500 font-medium">{loading ? "…" : `${arrivalCount} Active`}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-yellow-500 border-4 border-white dark:border-gray-900 flex items-center justify-center relative z-10 shadow-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Identity Review</p>
                <p className="text-xs text-gray-500 font-medium">{loading ? "…" : `${reviewCount} Pending`}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-900 flex items-center justify-center relative z-10 shadow-sm">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Manual Verification</p>
                <p className="text-xs text-gray-500 font-medium">{loading ? "…" : `${verifiedCount} Verified`}</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-900 flex items-center justify-center relative z-10 shadow-sm">
                <Tag className="h-4 w-4 text-white" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Integration Ready</p>
                <p className="text-xs text-gray-500 font-medium">{loading ? "…" : `${intCount} Approved`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Cases */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Recent Cases</h3>
          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentCases.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No cases yet.</p>
                <Link to="/registration" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Register first case →</Link>
              </div>
            ) : (
              recentCases.map((c) => {
                const id = String(c.case_id ?? c.id ?? "");
                const person = (c.person as Record<string, unknown> | undefined) ?? {};
                const personId = String(person.name ?? c.person_id ?? id);
                const status = String(c.status ?? "");
                return (
                  <Link
                    to={`/case/${id}`}
                    key={id}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-800"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">{personId}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(status)}`}>
                      {statusLabel(status)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
          <Link to="/cases" className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 dark:text-blue-400 transition-colors">
            View All Pipeline <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {/* Alerts & Context Data */}
        <div className="space-y-8 flex flex-col">
          {/* Evidence Alerts */}
          <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" /> Action Required
            </h3>
            <div className="space-y-3">
              {evidencePending > 0 ? (
                <Link to="/evidence" className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-orange-200 dark:bg-orange-800/50 flex items-center justify-center text-orange-700 dark:text-orange-300 font-bold">{evidencePending}</div>
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Cases in evidence review</span>
                </Link>
              ) : (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-sm text-green-700 dark:text-green-300 font-medium">
                  ✓ No pending evidence reviews
                </div>
              )}
              <Link to="/evidence" className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors">
                <div className="h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-800/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">→</div>
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Review evidence queue</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex-1">
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Quick Actions</h3>
            <ul className="space-y-3">
              {[
                { label: "Manual Verification", href: "/scoring", icon: BarChart3 },
                { label: "Evidence Review", href: "/evidence", icon: FileText },
                { label: "Referrals", href: "/referrals", icon: Users },
                { label: "Announcements", href: "/announcements", icon: Monitor },
              ].map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link to={href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Icon className="h-4 w-4 text-gray-400" />
                    {label}
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AuthorityLayout>
  );
};

const MetricCard = ({ label, value, icon, color, trend }: { label: string; value: string; icon: React.ReactNode; color: string; trend: string }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 rounded-full w-24 h-24 opacity-10 bg-current group-hover:scale-150 transition-transform duration-500`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="relative z-10">
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">{label}</p>
      <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 dark:bg-gray-800 inline-block px-2 py-0.5 rounded">{trend}</p>
    </div>
  </div>
);

export default AuthorityDashboard;
