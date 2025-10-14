import React from "react";

export default function Card({ children, as = "article", ariaLabel }: { children: React.ReactNode; as?: "article" | "section" | "div"; ariaLabel?: string }) {
  const El = as as any;
  return (
    <El
      role={as === "article" ? "article" : undefined}
      aria-label={ariaLabel}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#FFFFFF"
      }}
    >
      {children}
    </El>
  );
}


