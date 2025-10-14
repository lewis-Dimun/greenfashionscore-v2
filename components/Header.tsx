"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Button from "./Button";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-emerald-600">
              Green Fashion Score
            </a>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              // Authenticated user menu
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <a 
                  href="/survey" 
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Encuesta
                </a>
                <a 
                  href="/dashboard" 
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Dashboard
                </a>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              // Guest menu
              <div className="flex items-center space-x-4">
                <a 
                  href="/login" 
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Iniciar sesión
                </a>
                <Button asLink={{ href: "/register" }}>
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
