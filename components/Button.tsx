import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { asLink?: { href: string } };

export default function Button({ asLink, children, ...rest }: Props) {
  const baseClasses = "inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors";
  
  if (asLink) {
    return (
      <a
        href={asLink.href}
        role="link"
        className={baseClasses}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      {...rest}
      className={baseClasses}
    >
      {children}
    </button>
  );
}


