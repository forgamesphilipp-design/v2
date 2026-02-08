// src/entities/account/repositoryCloud.ts

import type { AccountRepository } from "./repository";
import { supabase } from "../../app/supabaseClient";

function mustEnv(key: string): string {
  const v = (import.meta as any).env?.[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return String(v);
}

export class AccountRepositoryCloud implements AccountRepository {
  async deleteMyAccount(): Promise<void> {
    // ✅ Get fresh token
    const { data: sessionRes, error: sErr } = await supabase.auth.getSession();
    if (sErr) throw new Error(String(sErr.message ?? sErr));

    const accessToken = sessionRes.session?.access_token;
    if (!accessToken) throw new Error("Not authenticated");

    // ✅ Call Edge Function directly (most reliable)
    const supabaseUrl = mustEnv("VITE_SUPABASE_URL");
    const anonKey = mustEnv("VITE_SUPABASE_ANON_KEY");

    const r = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });

    const text = await r.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // non-json body
    }

    if (!r.ok) {
      // ✅ show real reason from backend (no more blind 401)
      const msg =
        data?.error ||
        data?.message ||
        `Edge Function HTTP ${r.status}: ${text || "no body"}`;
      throw new Error(msg);
    }

    const authDeleted = Boolean(data?.report?.auth?.deleted);
    if (!authDeleted) {
      const msg = String(data?.report?.auth?.error ?? "") || "Account deletion incomplete (auth user not deleted).";
      throw new Error(msg);
    }
  }
}
