"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/Header";
import { useAuthStore } from "@/store/auth";
import { useApiKeys } from "@/hooks/useApiKeys";

function AuthAndKeyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hydrated, hydrate, setActiveApiKey } = useAuthStore();
  const { data: apiKeys } = useApiKeys(token);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    const active = apiKeys?.find((k) => k.is_active);
    if (active?.prefix) {
      // prefix is not the full key — only a created key response has `.key`
      // Store prefix as a signal that keys exist; full key set via create flow
    }
    // If we have a key stored from a previous session in localStorage, use it
    const stored = localStorage.getItem("substrate_active_api_key");
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
