"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import AuthGuard from "../../components/AuthGuard";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const _router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    
    const { error: err } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (err) {
      setError(err.message);
    } else {
      setMessage("Revisa tu email para confirmar el registro.");
    }
    
    setLoading(false);
  }

  return (
    <AuthGuard requireAuth={false}>
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
                <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4 inline-block">
                  ← Volver al inicio
                </Link>
          <h1 className="text-3xl font-bold text-center text-gray-900">Crear cuenta</h1>
        </div>
        <form onSubmit={onSubmit} aria-label="Registro" className="mt-8 space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Contraseña</span>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              />
            </label>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>
        {message && <p role="status" className="mt-4 text-sm text-green-600 text-center">{message}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-600 text-center">{error}</p>}
      </div>
    </main>
    </AuthGuard>
  );
}


