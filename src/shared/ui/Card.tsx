import type { ReactNode } from "react";

export default function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
