// FILE: src/shared/ui/ToastProvider.tsx

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "info" | "error";

type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs: number;
};

type ToastApi = {
  show: (t: Omit<ToastItem, "id">) => void;
  success: (message: string, title?: string, durationMs?: number) => void;
  info: (message: string, title?: string, durationMs?: number) => void;
  error: (message: string, title?: string, durationMs?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastApi | undefined>(undefined);

function makeId() {
  const anyCrypto = globalThis.crypto as any;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    const t = timers.current[id];
    if (t) window.clearTimeout(t);
    delete timers.current[id];
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    for (const id of Object.keys(timers.current)) {
      window.clearTimeout(timers.current[id]);
    }
    timers.current = {};
    setItems([]);
  }, []);

  const show = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = makeId();
      const next: ToastItem = { id, ...t };

      setItems((prev) => {
        // cap to 3 toasts to keep UI tidy
        const capped = prev.slice(0, 2);
        return [next, ...capped];
      });

      timers.current[id] = window.setTimeout(() => dismiss(id), next.durationMs);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, title = "Erfolg", durationMs = 2200) => show({ type: "success", title, message, durationMs }),
      info: (message, title = "Info", durationMs = 2400) => show({ type: "info", title, message, durationMs }),
      error: (message, title = "Fehler", durationMs = 3200) => show({ type: "error", title, message, durationMs }),
      dismiss,
      dismissAll,
    }),
    [dismiss, dismissAll, show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        style={{
          position: "fixed",
          right: 14,
          bottom: 14,
          zIndex: 10000,
          display: "grid",
          gap: 10,
          width: "min(360px, calc(100vw - 28px))",
        }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            onClick={() => dismiss(t.id)}
            style={{
              cursor: "pointer",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--card)",
              boxShadow: "0 18px 40px rgba(15,23,42,.14)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 12, display: "grid", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: "var(--text)" }}>{t.title ?? ""}</div>

                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background:
                      t.type === "success"
                        ? "rgba(16,185,129,.14)"
                        : t.type === "error"
                        ? "rgba(239,68,68,.12)"
                        : "rgba(59,130,246,.12)",
                    color:
                      t.type === "success"
                        ? "rgba(16,185,129,1)"
                        : t.type === "error"
                        ? "rgba(239,68,68,1)"
                        : "rgba(59,130,246,1)",
                  }}
                >
                  {t.type === "success" ? "OK" : t.type === "error" ? "!" : "i"}
                </div>
              </div>

              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.35 }}>{t.message}</div>
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />
            <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}>Tippen zum Schliessen</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}
