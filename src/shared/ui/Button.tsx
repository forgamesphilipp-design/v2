// FILE: src/shared/ui/Button.tsx

import { useMemo, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";
type Size = "sm" | "md";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

export default function Button({
  variant = "ghost",
  size = "md",
  loading = false,
  disabled,
  style,
  type,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: Props) {
  const [hovered, setHovered] = useState(false);

  const isDisabled = Boolean(disabled) || loading;

  const padding = size === "sm" ? "8px 10px" : "10px 12px";
  const fontSize = size === "sm" ? 13 : 14;

  const base = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: 999,
      padding,
      border: "1px solid var(--border)",
      cursor: isDisabled ? "not-allowed" : "pointer",
      fontWeight: 900,
      opacity: isDisabled ? 0.6 : 1,
      transition: "transform 120ms ease, opacity 120ms ease",
      transform: !isDisabled && hovered ? "translateY(-1px)" : "translateY(0)",
      background: variant === "primary" ? "var(--accent)" : "var(--bg)",
      color: variant === "primary" ? "#fff" : "inherit",
      fontSize,
      lineHeight: 1.1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      userSelect: "none",
      whiteSpace: "nowrap",
    }),
    [fontSize, hovered, isDisabled, padding, variant]
  );

  return (
    <button
      {...props}
      type={type ?? "button"}
      disabled={isDisabled}
      style={{ ...base, ...style }}
      onMouseEnter={(e) => {
        if (!isDisabled) setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
    >
      {loading ? "…" : children}
    </button>
  );
}
