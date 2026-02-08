// FILE: src/shared/ui/Card.tsx

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  style?: React.CSSProperties;
  padding?: number;
};

export default function Card({ children, style, padding = 16 }: Props) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
