import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function syncUserWithBackend(accessToken: string) {
  const res = await fetch(`${API_URL}/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to sync user with backend");
  return res.json();
}

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || "" } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (data.session?.access_token) {
    const user = await syncUserWithBackend(data.session.access_token);
    localStorage.setItem("substrate_token", data.session.access_token);
    localStorage.setItem("substrate_user", JSON.stringify(user));
  }

  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  localStorage.removeItem("substrate_token");
  localStorage.removeItem("substrate_user");
  localStorage.removeItem("substrate_active_api_key");
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
  });
  if (error) throw error;
}

export async function resetPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
