import { supabase } from "../../app/supabaseClient";

export type OAuthProvider = "google" | "apple";

export async function signInWithProvider(provider: OAuthProvider) {
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,

      // ✅ Force provider UI to show account chooser again
      // Google supports prompt=select_account (and consent)
      queryParams:
        provider === "google"
          ? {
              prompt: "select_account",
              // if you ever need refresh tokens, you'd add:
              // access_type: "offline",
              // but not necessary for normal login
            }
          : undefined,
    },
  });

  if (error) throw error;
}
