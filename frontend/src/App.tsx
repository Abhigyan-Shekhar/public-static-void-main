import { useEffect, type ReactElement } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AnimatedLoginPage } from "./components/ui/animated-characters-login-page";
import { AnnouncementsPage } from "./components/ui/announcements";
import { CaseDetail } from "./components/ui/case-detail";
import { CaseTimelinePage } from "./components/ui/case-timeline";
import { CasesPage } from "./components/ui/cases";
import { ClientRegistration } from "./components/ui/client-registration";
import { AuthorityDashboard } from "./components/ui/dashboard-with-collapsible-sidebar";
import { EvidenceReviewPage } from "./components/ui/evidence-review";
import { LandingPage } from "./components/ui/landing-page";
import { ReferralsPage } from "./components/ui/referrals";
import { RefugeePortal } from "./components/ui/refugee-portal";
import { ScoringPage } from "./components/ui/scoring";
import { getSession, isAllowed, type UserRole } from "./lib/auth";
import { applyTheme, getStoredTheme } from "./lib/theme";

function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: UserRole[];
}) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAllowed(session, roles)) {
    const fallback = session.role === "refugee" ? "/refugee" : session.role === "partner" ? "/referrals" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function ThemeBootstrap() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <ThemeBootstrap />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AnimatedLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["authority"]}>
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases"
          element={
            <ProtectedRoute roles={["authority"]}>
              <CasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/case/:id"
          element={
            <ProtectedRoute roles={["authority"]}>
              <CaseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline"
          element={
            <ProtectedRoute roles={["authority"]}>
              <CaseTimelinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline/:id"
          element={
            <ProtectedRoute roles={["authority"]}>
              <CaseTimelinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evidence"
          element={
            <ProtectedRoute roles={["authority"]}>
              <EvidenceReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scoring"
          element={
            <ProtectedRoute roles={["authority"]}>
              <ScoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scoring/:id"
          element={
            <ProtectedRoute roles={["authority"]}>
              <ScoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute roles={["authority"]}>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute roles={["authority", "partner"]}>
              <ReferralsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registration"
          element={
            <ProtectedRoute roles={["authority"]}>
              <ClientRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refugee"
          element={
            <ProtectedRoute roles={["refugee", "authority"]}>
              <RefugeePortal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
