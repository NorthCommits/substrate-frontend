"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { useAuthStore } from "@/store/auth";
import { useApiKeys } from "@/hooks/useApiKeys";
import { supabase } from "@/lib/supabase";
import { syncUserWithBackend } from "@/lib/auth";

function AuthAndKeyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hydrated, hydrate, setActiveApiKey } = useAuthStore();
  const { data: apiKeys } = useApiKeys();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      localStorage.setItem("substrate_token", session.access_token);
      try {
        const user = await syncUserWithBackend(session.access_token);
        localStorage.setItem("substrate_user", JSON.stringify(user));
      } catch { /* backend sync failure is non-fatal */ }
      hydrate();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      localStorage.setItem("substrate_token", session.access_token);
      if (event === "TOKEN_REFRESHED") {
        try {
          const user = await syncUserWithBackend(session.access_token);
          localStorage.setItem("substrate_user", JSON.stringify(user));
        } catch { /* non-fatal */ }
        hydrate();
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    const stored = localStorage.getItem("substrate_api_key");
    if (stored) setActiveApiKey(stored);
  }, [apiKeys, setActiveApiKey]);

  if (!hydrated || !token) return null;

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthAndKeyProvider>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-14 max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </AuthAndKeyProvider>
  );
}
