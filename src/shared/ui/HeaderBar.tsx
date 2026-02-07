import { useNavigate } from "react-router-dom";
import Button from "./Button";

type Props = {
  title: string;
  subtitle?: string;
  backTo?: string; // wenn gesetzt -> Back Button
  right?: React.ReactNode; // optional rechts
};

export default function HeaderBar({ title, subtitle, backTo, right }: Props) {
  const nav = useNavigate();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(10px)",
        background: "var(--accent)",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          color: "#fff",
        }}
      >
        <div style={{ display: "grid", gap: 2 }}>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, opacity: 0.9 }}>{subtitle}</div>}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {right}
          {backTo && (
            <Button
              onClick={() => nav(backTo)}
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "#fff",
              }}
            >
              ← Home
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
