import "./globals.css";
import Header from "../components/Header";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}


