// FILE: src/features/auth/oauth.ts
// Small, centralized OAuth helper (scalable, providers configurable)

import { supabase } from "../../app/supabaseClient";

export type OAuthProvider = "google" | "apple";

export async function signInWithProvider(provider: OAuthProvider) {
  // Use a dedicated callback route; keeps auth flows consistent across providers
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      // You can request additional scopes later if needed:
      // scopes: provider === "google" ? "email profile" : undefined,
      // queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
    },
  });

  if (error) throw error;
}
