// FILE: src/app/router.tsx
// Add /settings route inside the AuthedLayout block.
// Replace entire file with this version (includes your simplified layout from earlier + settings).

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ExplorePage from "../pages/ExplorePage";
import LearnPage from "../pages/LearnPage";
import QuizPage from "../pages/QuizPage";
import AuthPage from "../pages/AuthPage";
import OnboardingPage from "../pages/OnboardingPage";
import SettingsPage from "../pages/SettingsPage";
import { RequireAuth, RequireNoAuth, RequireOnboardingComplete } from "../features/auth/guards";

function AuthedLayout() {
  return (
    <RequireAuth>
      <RequireOnboardingComplete>
        <Outlet />
      </RequireOnboardingComplete>
    </RequireAuth>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/auth"
        element={
          <RequireNoAuth>
            <AuthPage />
          </RequireNoAuth>
        }
      />

      {/* Authed, onboarding allowed */}
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />

      {/* App (authed + onboarded) */}
      <Route element={<AuthedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
