"use client";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { isAdmin } from "../lib/auth/roles";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setAllowed(isAdmin(session));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">Verificando permisos…</main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso restringido</h2>
          <p className="text-gray-600">No tienes permisos de administrador.</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}


