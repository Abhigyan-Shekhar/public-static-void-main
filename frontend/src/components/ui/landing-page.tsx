import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Shield, Users, ArrowRight, ChevronDown, CheckCircle2,
  FileText, Fingerprint, Lock, BarChart2,
  ClipboardList, Clock, Bell, Building2, BookOpen,
  HeartHandshake, UserCheck, Layers, Menu, X
} from "lucide-react"
import { ContainerScroll } from "./container-scroll-animation"
import { BrandLogo } from "./brand-logo"

// ─── Types ────────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Arrival", desc: "Person is registered at a border or reception point by an intake officer." },
  { label: "Identity Intake", desc: "Officer creates a base case and logs initial biometric and personal details." },
  { label: "Evidence Submission", desc: "Official, partner, and self-declared evidence is attached to the case." },
  { label: "Scoring", desc: "The system computes an identity confidence score from 0–100 based on verified signals." },
  { label: "Verification", desc: "A reviewer validates evidence and updates the case to a higher status tier." },
  { label: "Integration", desc: "Verified individuals are referred to housing, education, or employment services." },
]

const SCORE_BANDS = [
  { range: "0–39", label: "Under Review", color: "bg-red-100 text-red-700 border-red-200" },
  { range: "40–59", label: "Provisional", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { range: "60–79", label: "Verified", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { range: "80+", label: "High Confidence", color: "bg-green-100 text-green-700 border-green-200" },
]

const EVIDENCE_TYPES = [
  { color: "#3b82f6", label: "Biometric match", sub: "UNHCR / government database", tag: "Official" },
  { color: "#22c55e", label: "Education & Employment", sub: "Verified third-party records", tag: "Corroborated" },
  { color: "#f97316", label: "NGO Validation", sub: "Field officer sign-off", tag: "Human" },
  { color: "#8b5cf6", label: "Family Links", sub: "Spouse, parent, sibling confirmations", tag: "Social" },
]

const BEFORE_AFTER = [
  ["Repeated registration across agencies", "Single shared case, once"],
  ["Scattered, siloed evidence records", "Unified, auditable evidence ledger"],
  ["Opaque, inconsistent decisions", "Explainable identity confidence score"],
  ["Delayed referrals to services", "Faster routing to verified services"],
  ["Refugee has no visibility", "Refugee can track their own progress"],
]

const ANNOUNCEMENTS = [
  { tag: "Medical", color: "bg-red-100 text-red-700", title: "Health screening — Zone B", time: "2h ago", group: "Camp 3 residents" },
  { tag: "Housing", color: "bg-blue-100 text-blue-700", title: "Temporary accommodation list updated", time: "4h ago", group: "All arrivals" },
  { tag: "Education", color: "bg-purple-100 text-purple-700", title: "Language classes start Monday", time: "1d ago", group: "Adults 18–40" },
]

const MODULES = [
  { icon: Layers, name: "Authority Dashboard", desc: "Live metrics, active cases, and alerts at a glance", to: "/dashboard" },
  { icon: ClipboardList, name: "Cases Database", desc: "Searchable case table with identity score and status", to: "/cases" },
  { icon: FileText, name: "Evidence Review", desc: "Document queue for reviewers to approve or reject", to: "/evidence" },
  { icon: BarChart2, name: "Manual Verification", desc: "Protected verification workspace with explainable random forest support", to: "/scoring" },
  { icon: Bell, name: "Announcements Board", desc: "Targeted broadcasts to camps and groups", to: "/announcements" },
  { icon: HeartHandshake, name: "Partner Referrals", desc: "Match verified cases with NGO integration services", to: "/referrals" },
  { icon: Clock, name: "Visual Case Timeline", desc: "Milestone tracker from Arrival to Integration", to: "/timeline" },
  { icon: UserCheck, name: "Refugee Self-Service Portal", desc: "Case tracking, declarations, and updates for individuals", to: "/refugee" },
]

// ─── Logo ──────────────────────────────────────────────────────────────────────

function Logo({ variant = "dark" }: { size?: "sm" | "md" | "lg", variant?: "dark" | "light" }) {
  return <BrandLogo variant={variant} compact size="xs" />
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Authorities", href: "#roles" },
    { label: "For Refugees", href: "#roles" },
    { label: "For Partners", href: "#roles" },
    { label: "Announcements", href: "#announcements" },
  ]

  const isLight = scrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLight ? "bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20 gap-6">
        <Logo variant={isLight ? "dark" : "light"} />

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href}
              className={`text-sm font-medium transition-colors ${
                isLight ? "text-slate-600 hover:text-slate-900" : "text-white/70 hover:text-white"
              }`}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/login?redirect=%2Frefugee"
            className={`text-sm font-semibold border px-4 py-1.5 rounded-full transition-colors ${
              isLight
                ? "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                : "text-white border-white/20 bg-white/10 hover:bg-white/20"
            }`}>
            Track My Case
          </Link>
          <Link to="/login"
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
              isLight ? "text-slate-700 hover:text-slate-900" : "text-white/80 hover:text-white"
            }`}>
            Login
          </Link>
          <Link to="/login?redirect=%2Fdashboard"
            className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${
              isLight ? "bg-slate-900 text-white hover:bg-slate-700" : "bg-[#0084ff] text-white hover:bg-blue-500"
            }`}>
            Get Started →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`lg:hidden p-2 ${isLight ? "text-slate-700" : "text-white"}`}
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-white/10 px-6 py-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="block text-sm font-medium text-white/80 py-1"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="pt-3 space-y-2 border-t border-white/10">
            <Link to="/login?redirect=%2Frefugee" className="block text-center text-sm font-semibold text-white border border-white/20 px-4 py-2 rounded-lg">Track My Case</Link>
            <Link to="/login" className="block text-center text-sm font-semibold text-white/70 border border-white/10 px-4 py-2 rounded-lg">Login</Link>
            <Link to="/login?redirect=%2Fdashboard" className="block text-center text-sm font-bold bg-[#0084ff] text-white px-4 py-2 rounded-lg">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Blue gradient overlays — Turing style */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,132,255,0.18)] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[rgba(0,132,255,0.10)] via-transparent to-transparent" />
      </div>

      {/* Video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
        autoPlay
        muted
        loop
        playsInline
      >
        <source
          src="https://mybycketvercelprojecttest.s3.sa-east-1.amazonaws.com/animation-bg.mp4"
          type="video/mp4"
        />
      </video>

      {/* Content */}
      <div className="relative z-[2] min-h-screen flex flex-col justify-end pb-20 pt-28">
        {/* Main content row — text left, stats right, pinned to bottom */}
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-[60px] flex flex-col lg:flex-row justify-between items-end gap-12">

          {/* Left — headline + CTAs */}
          <div className="max-w-[700px]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur">
              <div className="w-2 h-2 bg-[#0084ff] rounded-full animate-pulse" />
              <span className="text-white/70 text-sm font-medium tracking-wide">Humanitarian Identity Platform</span>
            </div>

            <div className="mb-8">
              <div className="text-[clamp(56px,9vw,132px)] font-black leading-none tracking-[-4px] text-white">
                BEYOND
              </div>
              <div className="text-[clamp(56px,9vw,132px)] font-black leading-none tracking-[-4px] text-white/12 [WebkitTextStroke:2px_rgba(255,255,255,0.96)] drop-shadow-[0_0_18px_rgba(255,255,255,0.22)]">
                BORDERS
              </div>
            </div>

            <p className="text-lg leading-relaxed mb-12" style={{ color: "#b8b8b8" }}>
              A secure humanitarian coordination platform for officers, refugees, and NGOs. Protected workspaces, officer-issued refugee login, and low-cost random forest verification keep the flow auditable and privacy-aware.
            </p>

            <div className="flex flex-wrap gap-4 items-center mb-16">
              <Link
                to="/login?redirect=%2Fdashboard"
                className="flex items-center gap-2.5 text-white py-3.5 px-7 rounded-md text-base font-medium transition-all duration-200 hover:translate-x-0.5"
                style={{ background: "#0084ff" }}
              >
                Login to Portal <ArrowRight size={18} />
              </Link>
              <Link
                to="/login?redirect=%2Frefugee"
                className="py-3.5 px-7 text-base font-medium transition-colors duration-200 hover:text-white"
                style={{ color: "#b8b8b8", background: "transparent" }}
              >
                Track My Case
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-1.5 py-3.5 px-2 text-base font-medium transition-colors duration-200 hover:text-white"
                style={{ color: "#b8b8b8" }}
              >
                How it works <ChevronDown size={16} />
              </a>
            </div>
          </div>

          {/* Right — stats */}
          <div className="flex gap-16 lg:gap-20 items-end pb-2 shrink-0">
            {[
              ["RF", "Random forest model"],
              ["3", "User roles"],
              ["Locked", "Protected endpoints"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div
                  className="font-light leading-none mb-3"
                  style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
                >
                  {num}
                </div>
                <div className="text-sm font-normal" style={{ color: "#b8b8b8" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RolePortals() {
  const roles = [
    {
      icon: Shield,
      title: "Authority Access",
      subtitle: "For intake officers, reviewers & case managers",
      color: "from-blue-600 to-blue-700",
      bg: "bg-blue-50 border-blue-100",
      iconBg: "bg-blue-100 text-blue-700",
      features: ["Register new arrivals", "Review and verify evidence", "Issue refugee login credentials", "Assign partner referrals"],
      primary: { label: "Authority Login", to: "/login" },
      secondary: { label: "Open Dashboard", to: "/dashboard" },
    },
    {
      icon: Users,
      title: "Refugee Access",
      subtitle: "Track case status, upload declarations, view appointments",
      color: "from-teal-500 to-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
      iconBg: "bg-emerald-100 text-emerald-700",
      features: ["Track case progress", "View identity status", "Upload supporting documents", "Read official updates"],
      primary: { label: "Refugee Login", to: "/login?redirect=%2Frefugee" },
      secondary: { label: "Open Refugee Portal", to: "/refugee" },
    },
    {
      icon: Building2,
      title: "Partner / NGO Access",
      subtitle: "View referrals, manage services, publish support updates",
      color: "from-violet-600 to-purple-700",
      bg: "bg-violet-50 border-violet-100",
      iconBg: "bg-violet-100 text-violet-700",
      features: ["Receive verified referrals", "Update service availability", "Confirm support actions", "Publish announcements"],
      primary: { label: "Partner Login", to: "/login" },
      secondary: null,
    },
    {
      icon: BookOpen,
      title: "Demo / Read-Only",
      subtitle: "For judges, supervisors, faculty, or new teams",
      color: "from-slate-600 to-slate-700",
      bg: "bg-slate-50 border-slate-200",
      iconBg: "bg-slate-100 text-slate-700",
      features: ["Protected endpoint preview", "Sample case walkthrough", "Evidence graph demo", "Manual verification preview"],
      primary: { label: "View Platform Overview", to: "/login?redirect=%2Fdashboard" },
      secondary: null,
    },
  ]

  return (
    <section id="roles" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 mb-4">
            <span className="text-slate-600 text-sm font-semibold">Choose your access path</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Built for every actor in the case journey</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">Different users have different contexts. Select your role to enter the right workspace.</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {roles.map((r) => (
            <div key={r.title} className={`flex flex-col border rounded-2xl p-6 ${r.bg} hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.iconBg}`}>
                <r.icon size={22} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{r.title}</h3>
              <p className="text-slate-500 text-sm mt-1 mb-4 leading-relaxed">{r.subtitle}</p>
              <ul className="space-y-2 flex-1">
                {r.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2">
                <Link to={r.primary.to}
                  className={`block text-center text-sm font-bold text-white py-2.5 rounded-xl bg-gradient-to-r ${r.color} hover:opacity-90 transition-opacity`}>
                  {r.primary.label}
                </Link>
                {r.secondary && (
                  <Link to={r.secondary.to}
                    className="block text-center text-sm font-medium text-slate-600 border border-slate-200 py-2.5 rounded-xl hover:bg-white transition-colors">
                    {r.secondary.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProblemSolution() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white">Why Beyond Borders exists</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">Fragmented records delay identity reconstruction and support delivery. We unify the whole flow.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900">
                <th className="px-6 py-4 text-left text-sm font-bold text-red-400">Before Beyond Borders</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-green-400">With Beyond Borders</th>
              </tr>
            </thead>
            <tbody>
              {BEFORE_AFTER.map(([before, after], i) => (
                <tr key={i} className={`border-t border-slate-800 ${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-950"}`}>
                  <td className="px-6 py-4 text-sm text-slate-400 flex items-start gap-2">
                    <X size={14} className="text-red-500 mt-0.5 shrink-0" />
                    {before}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
                      {after}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const [active, setActive] = useState(0)
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How It Works</h2>
          <p className="mt-3 text-slate-500">Click each step to learn what happens at that stage.</p>
        </div>

        {/* Stepper */}
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1" onClick={() => setActive(i)}>
              <button
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all cursor-pointer ${
                  i === active ? "bg-blue-600 border-blue-600 text-white scale-110" : i < active ? "bg-green-500 border-green-500 text-white" : "border-slate-200 text-slate-400"
                }`}>
                {i < active ? <CheckCircle2 size={16} /> : i + 1}
              </button>
              <span className={`text-xs font-semibold transition-colors ${i === active ? "text-blue-600" : "text-slate-500"}`}>{step.label}</span>
              {i < STEPS.length - 1 && <div className="hidden sm:block flex-1 h-px bg-slate-200 w-full mt-4 mx-2" />}
            </div>
          ))}
        </div>

        {/* Detail card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-3 py-1 text-xs font-bold text-blue-700 mb-3">
            Step {active + 1} of {STEPS.length}
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">{STEPS[active].label}</h3>
          <p className="text-slate-600 max-w-lg mx-auto">{STEPS[active].desc}</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            {active > 0 && (
              <button onClick={() => setActive(active - 1)} className="text-sm font-semibold text-slate-500 hover:text-slate-700">← Previous</button>
            )}
            {active < STEPS.length - 1 && (
              <button onClick={() => setActive(active + 1)} className="text-sm font-bold bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors">
                Next: {STEPS[active + 1].label} →
              </button>
            )}
            {active === STEPS.length - 1 && (
              <Link to="/dashboard" className="text-sm font-bold bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition-colors">
                View Platform →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function IdentityConfidence() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_65%)]" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute left-0 bottom-20 h-96 w-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ContainerScroll
          titleComponent={
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
                Explainable verification support
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-500">
                Every decision is backed by visible evidence, with a random forest pipeline instead of an LLM for lower cost, higher privacy, and clearer governance.
              </p>
            </div>
          }
        >
          <div className="h-full overflow-auto bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_45%,#eff6ff_100%)] p-6 md:p-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Identity Subject</div>
                    <div className="text-xl font-black text-slate-900">Ahmad Karimi</div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-green-600">80</div>
                    <div className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">High Confidence</div>
                  </div>
                </div>

                <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="relative h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 via-blue-400 to-green-500">
                    <div className="absolute right-[20%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-slate-900 bg-white shadow" />
                  </div>
                </div>

                <div className="space-y-3">
                  {EVIDENCE_TYPES.map((e) => (
                    <div key={e.label} className="flex items-center justify-between border-b border-slate-50 py-2">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ background: e.color }} />
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{e.label}</div>
                          <div className="text-xs text-slate-400">{e.sub}</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{e.tag}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 text-xs italic text-slate-400">
                  Self-declared submissions require reviewer approval before affecting the confidence score.
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Manual review bands</h3>
                <div className="space-y-3">
                  {SCORE_BANDS.map((b) => (
                    <div key={b.range} className={`flex items-center justify-between rounded-xl border px-5 py-4 ${b.color}`}>
                      <span className="text-lg font-black">{b.range}</span>
                      <span className="font-semibold">{b.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-2">
                  {[
                    { icon: Fingerprint, title: "Official evidence", desc: "Biometric matches, government records, verified NGO sign-offs" },
                    { icon: FileText, title: "Corroborated evidence", desc: "Family, employer, and school confirmations from third parties" },
                    { icon: UserCheck, title: "Self-declared information", desc: "Refugee-submitted profile, family declarations, education claims — verified before scoring" },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                        <item.icon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="text-sm text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/login?redirect=%2Fscoring"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-800"
                >
                  See evidence graph live <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </div>
    </section>
  )
}

function AnnouncementsPreview() {
  return (
    <section id="announcements" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Verified updates, not noise</h2>
            <p className="mt-2 text-slate-500 max-w-md">Structured one-way communications from verified authority sources to target groups.</p>
          </div>
          <Link to="/announcements" className="text-sm font-bold text-blue-600 hover:underline whitespace-nowrap">
            See all announcements →
          </Link>
        </div>

        <div className="space-y-4">
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} className="flex items-start gap-4 bg-slate-50 border border-slate-100 rounded-xl p-5 hover:border-blue-100 transition-colors">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.color} shrink-0 mt-0.5`}>{a.tag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">{a.title}</div>
                <div className="text-xs text-slate-400 mt-1">For: {a.group}</div>
              </div>
              <div className="text-xs text-slate-400 shrink-0">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  const pillars = [
    { icon: Lock, title: "Role-based access", desc: "Each user sees only what they are permitted to see. Officers, refugees, and partners have entirely separate workspaces." },
    { icon: ClipboardList, title: "Audit trail", desc: "Every case action, evidence decision, and score change is logged. Nothing is hidden." },
            { icon: BarChart2, title: "Random forest, not LLM", desc: "Verification support uses structured features and officer review, keeping costs lower and privacy tighter than an LLM-first flow." },
    { icon: UserCheck, title: "Refugee visibility", desc: "Individuals can view their case status, pending steps, and official communications at any time." },
  ]
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white">Built with dignity, auditability, and controlled access</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">This platform handles sensitive human data. We treat that with appropriate care.</p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div key={p.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur hover:bg-white/10 transition-colors">
              <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <p.icon size={20} className="text-blue-300" />
              </div>
              <h3 className="font-bold text-white mb-2">{p.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModuleShowcase() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Platform modules</h2>
          <p className="mt-3 text-slate-500">Every module is live today, but the endpoints are protected and open only after login.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULES.map((m) => (
            <Link to={m.to} key={m.name}
              className="flex flex-col gap-3 bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <m.icon size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{m.name}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{m.desc}</div>
              </div>
              <div className="mt-auto text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function AccessSection() {
  const [tab, setTab] = useState<"authority" | "refugee" | "partner">("authority")
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900">Access your workspace</h2>
          <p className="mt-2 text-slate-500">Different access methods for each role to ensure security and clarity.</p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8">
          {(["authority", "refugee", "partner"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
          {tab === "authority" && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 text-lg">Authority Login</h3>
              <p className="text-sm text-slate-500">For intake officers, reviewers, and case managers with a registered system account.</p>
              <Link to="/login" className="block text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                Login to Authority Portal →
              </Link>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {["Forgot password", "Request access"].map((a) => (
                  <a key={a} href="#" className="text-center py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">{a}</a>
                ))}
              </div>
            </div>
          )}
          {tab === "refugee" && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 text-lg">Refugee Case Access</h3>
              <p className="text-sm text-slate-500">Officer-issued login. Username is first 3 letters plus birth year, and the password includes the border office number and birth date.</p>
              <Link to="/login?redirect=%2Frefugee" className="block text-center bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                Refugee Login →
              </Link>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {["View appointments", "Need translation help?"].map((a) => (
                  <a key={a} href="#" className="text-center py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">{a}</a>
                ))}
              </div>
            </div>
          )}
          {tab === "partner" && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 text-lg">Partner / NGO Login</h3>
              <p className="text-sm text-slate-500">For verified aid organizations managing referrals and service delivery.</p>
              <Link to="/login" className="block text-center bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-colors">
                Partner Login →
              </Link>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {["Request partner access", "View referrals"].map((a) => (
                  <a key={a} href="#" className="text-center py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">{a}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function QuickStrip() {
  const links = [
    { label: "Track My Case", to: "/login?redirect=%2Frefugee", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { label: "Submit Evidence", to: "/login?redirect=%2Frefugee", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { label: "View Appointments", to: "/login?redirect=%2Frefugee", color: "text-violet-700 bg-violet-50 border-violet-200" },
    { label: "Read Announcements", to: "/announcements", color: "text-amber-700 bg-amber-50 border-amber-200" },
    { label: "Authority Login", to: "/login", color: "text-slate-700 bg-slate-50 border-slate-200" },
    { label: "Partner Referrals", to: "/referrals", color: "text-purple-700 bg-purple-50 border-purple-200" },
  ]
  return (
    <div className="bg-slate-100 border-y border-slate-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2 justify-center">
        {links.map((l) => (
          <Link key={l.label} to={l.to}
            className={`text-xs font-bold px-4 py-2 rounded-full border transition-all hover:scale-105 ${l.color}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Rebuilding identity for displaced people through transparent, evidence-based case management.
            </p>
          </div>

          {[
            { heading: "Platform", links: ["Dashboard", "Cases", "Evidence Review", "Manual Verification", "Announcements", "Referrals"] },
            { heading: "Access", links: ["Authority Login", "Track My Case", "Partner Login", "Demo Overview", "Request Access"] },
            { heading: "Information", links: ["About Beyond Borders", "How It Works", "Privacy & Data Use", "Accessibility", "Help Desk", "System Status"] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-bold mb-4 text-sm">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Demo credentials bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 mb-8 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <div className="text-white font-bold text-sm mb-1">Sample Credentials</div>
            <div className="text-xs text-slate-400">Authority: officer.portal / secureOfficer117. Refugee example: ahm1985 / ahm11719850315.</div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-mono">
            <div><span className="text-slate-500">Partner:</span> <span className="text-blue-400">partner.desk</span></div>
            <div><span className="text-slate-500">Password:</span> <span className="text-blue-400">partnerAccess117</span></div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 Beyond Borders. Humanitarian identity platform demo.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Emergency Info</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function LandingPage() {
  // Ensure dark class is off (landing has its own light/dark sections)
  useEffect(() => {
    document.documentElement.classList.remove("dark")
    document.body.classList.remove("dark")
    document.body.style.backgroundColor = ""
    return () => {}
  }, [])

  return (
    <div className="min-h-screen font-sans antialiased">
      <Navbar />
      <Hero />
      <RolePortals />
      <ProblemSolution />
      <HowItWorks />
      <IdentityConfidence />
      <AnnouncementsPreview />
      <TrustSection />
      <ModuleShowcase />
      <AccessSection />
      <QuickStrip />
      <Footer />
    </div>
  )
}
