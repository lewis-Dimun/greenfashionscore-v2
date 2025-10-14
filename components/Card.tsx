import React from "react";

export default function Card({ children, as = "article", ariaLabel }: { children: React.ReactNode; as?: "article" | "section" | "div"; ariaLabel?: string }) {
  const El = as as any;
  return (
    <El
      role={as === "article" ? "article" : undefined}
      aria-label={ariaLabel}
      className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {children}
    </El>
  );
}


