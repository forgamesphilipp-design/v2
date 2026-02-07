import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  children: ReactNode;
};

export default function Button({ variant = "ghost", style, ...props }: Props) {
  const base: React.CSSProperties = {
    borderRadius: 999,
    padding: "10px 12px",
    border: "1px solid var(--border)",
    cursor: props.disabled ? "not-allowed" : "pointer",
    fontWeight: 900,
    opacity: props.disabled ? 0.6 : 1,
    transition: "transform 120ms ease",
    background: variant === "primary" ? "var(--accent)" : "var(--bg)",
    color: variant === "primary" ? "#fff" : "inherit",
  };

  return (
    <button
      {...props}
      style={{ ...base, ...style }}
      onMouseEnter={(e) => {
        if (props.disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        props.onMouseLeave?.(e);
      }}
    />
  );
}
