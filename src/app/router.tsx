import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ExplorePage from "../pages/ExplorePage";
import LearnPage from "../pages/LearnPage";
import QuizPage from "../pages/QuizPage";
import AuthPage from "../pages/AuthPage";
import OnboardingPage from "../pages/OnboardingPage";
import SettingsPage from "../pages/SettingsPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import { RequireAuth, RequireNoAuth, RequireOnboardingComplete, FullscreenLoading } from "../features/auth/guards";
import { useAuth } from "../features/auth/useAuth";

function AuthedLayout() {
  return (
    <RequireAuth>
      <RequireOnboardingComplete>
        <Outlet />
      </RequireOnboardingComplete>
    </RequireAuth>
  );
}

// ✅ Prevent re-onboarding
function RequireNotOnboarded({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.sessionLoading) return <FullscreenLoading />;

  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  // If profile not loaded yet, allow page to render (it can redirect later if needed)
  if (!auth.profile) return <>{children}</>;

  // If already onboarded -> go home
  if (auth.profile.onboardedAt) return <Navigate to="/" replace />;

  return <>{children}</>;
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

      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Authed, onboarding ONLY if not onboarded */}
      <Route
        path="/onboarding"
        element={
          <RequireNotOnboarded>
            <OnboardingPage />
          </RequireNotOnboarded>
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
