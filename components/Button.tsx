import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { asLink?: { href: string } };

export default function Button({ asLink, children, ...rest }: Props) {
  if (asLink) {
    return (
      <a
        href={asLink.href}
        role="link"
        style={{
          display: "inline-block",
          padding: "8px 14px",
          backgroundColor: "#00A676",
          color: "#FFFFFF",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      {...rest}
      style={{
        padding: "8px 14px",
        backgroundColor: "#00A676",
        color: "#FFFFFF",
        borderRadius: 8,
        fontWeight: 600
      }}
    >
      {children}
    </button>
  );
}


