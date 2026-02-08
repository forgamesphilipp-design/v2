// FILE: src/app/routes/publicRoutes.tsx

import type { RouteObject } from "react-router-dom";
import AuthPage from "../../pages/AuthPage";
import AuthCallbackPage from "../../pages/AuthCallbackPage";
import { RequireNoAuth } from "../../features/auth/guards";

export const publicRoutes: RouteObject[] = [
  {
    path: "/auth",
    element: (
      <RequireNoAuth>
        <AuthPage />
      </RequireNoAuth>
    ),
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
];
