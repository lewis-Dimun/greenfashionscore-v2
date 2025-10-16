"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useSurveyStore } from "../lib/state/surveyStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = "/login" 
}: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      if (requireAuth && !session?.user) {
        router.push(redirectTo as any);
      } else if (!requireAuth && session?.user) {
        router.push("/dashboard" as any);
      }

      // update survey namespace to current user (or anon)
      try {
        const userId = session?.user?.id || 'anon';
        useSurveyStore.getState().setNamespace(userId);
      } catch {}
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (requireAuth && !session?.user) {
          router.push(redirectTo as any);
        } else if (!requireAuth && session?.user) {
          router.push("/dashboard" as any);
        }

        // update namespace on auth changes
        try {
          const userId = session?.user?.id || 'anon';
          useSurveyStore.getState().setNamespace(userId);
        } catch {}
      }
    );

    return () => subscription.unsubscribe();
  }, [requireAuth, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect
  }

  if (!requireAuth && user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
