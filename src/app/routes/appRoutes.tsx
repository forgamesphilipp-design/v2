// FILE: src/app/routes/appRoutes.tsx

import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import HomePage from "../../pages/HomePage";
import ExplorePage from "../../pages/ExplorePage";
import LearnPage from "../../pages/LearnPage";
import QuizPage from "../../pages/QuizPage";
import OnboardingPage from "../../pages/OnboardingPage";
import SettingsPage from "../../pages/SettingsPage";

import { RequireAuthedOnboardedLayout, RequireNotOnboarded } from "../../features/auth/guards";

export const appRoutes: RouteObject[] = [
  // Onboarding: only if NOT onboarded
  {
    path: "/onboarding",
    element: (
      <RequireNotOnboarded>
        <OnboardingPage />
      </RequireNotOnboarded>
    ),
  },

  // App (authed + onboarded) as a clean layout guard
  {
    element: <RequireAuthedOnboardedLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/explore", element: <ExplorePage /> },
      { path: "/learn", element: <LearnPage /> },
      { path: "/quiz", element: <QuizPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },

  // Real redirect fallback (clean)
  { path: "*", element: <Navigate to="/" replace /> },
];
