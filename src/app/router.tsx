import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ExplorePage from "../pages/ExplorePage";
import LearnPage from "../pages/LearnPage";
import QuizPage from "../pages/QuizPage";
import AuthPage from "../pages/AuthPage";
import { useAuth } from "../features/auth/useAuth";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
        <div style={{ color: "var(--muted)", fontWeight: 900 }}>Lade…</div>
      </div>
    );
  }

  if (!auth.isAuthed) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

export default function AppRouter() {
  const auth = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={auth.isAuthed ? <Navigate to="/" replace /> : <AuthPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
      <Route
        path="/explore"
        element={
          <RequireAuth>
            <ExplorePage />
          </RequireAuth>
        }
      />
      <Route
        path="/learn"
        element={
          <RequireAuth>
            <LearnPage />
          </RequireAuth>
        }
      />
      <Route
        path="/quiz"
        element={
          <RequireAuth>
            <QuizPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
