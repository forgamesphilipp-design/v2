// FILE: src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./features/auth/AuthProvider.tsx";
import { ToastProvider } from "./shared/ui";
import AuthToasts from "./features/auth/AuthToasts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <AuthToasts />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
