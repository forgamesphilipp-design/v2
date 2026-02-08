// supabase/functions/delete-account/index.ts
// Hard delete: Auth user + DB rows + Storage objects
// - Requires Supabase Edge Functions with SERVICE_ROLE key
// - Idempotent-ish: repeated calls should not explode if some parts already gone

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  } as Record<string, string>;
}

type Json = Record<string, unknown>;

function jsonResponse(status: number, body: Json, origin?: string) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function listAllObjects(opts: {
  admin: ReturnType<typeof createClient>;
  bucket: string;
  prefix: string;
}) {
  const { admin, bucket, prefix } = opts;

  // Supabase Storage list() is paginated by offset/limit, but does not return a cursor.
  // We loop until fewer than limit are returned.
  const limit = 1000;
  let offset = 0;

  const paths: string[] = [];

  for (;;) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Storage list failed: ${error.message}`);
    }

    const batch = (data ?? [])
      .filter((x) => x?.name && x.name !== ".emptyFolderPlaceholder")
      .map((x) => `${prefix}/${x.name}`);

    paths.push(...batch);

    if ((data?.length ?? 0) < limit) break;
    offset += limit;
  }

  return paths;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*";

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" }, origin);
  }

  // ✅ Require Authorization header (Bearer token)
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return jsonResponse(401, { error: "Unauthorized: missing Bearer token." }, origin);
  }

  try {
    // ✅ Use your secret names (SUPABASE_* is blocked as custom secrets)
    const supabaseUrl = Deno.env.get("PROJECT_SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("PROJECT_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        500,
        { error: "Missing PROJECT_SUPABASE_URL or PROJECT_SERVICE_ROLE_KEY in Edge Function env." },
        origin
      );
    }

    // Client uses Service Role for privileged operations
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          // forward auth header for getUser() via JWT
          Authorization: authHeader,
        },
      },
    });

    // Verify caller identity from JWT
    const { data: userRes, error: userErr } = await admin.auth.getUser();
    if (userErr) return jsonResponse(401, { error: `Unauthorized: ${userErr.message}` }, origin);

    const uid = userRes.user?.id;
    if (!uid) return jsonResponse(401, { error: "Unauthorized: no user." }, origin);

    // ---- Deletion plan (scalable):
    // 1) Storage cleanup (moments photos)
    // 2) App DB cleanup (moments, profiles, etc.)
    // 3) Auth user delete (final)
    //
    // Notes:
    // - If Auth delete happens first, JWT becomes invalid and follow-up calls might fail.
    // - Storage can be large; we delete by prefix.

    const report: Json = {
      userId: uid,
      storage: { deleted: 0, attempted: 0 },
      db: { momentsDeleted: 0, profileDeleted: 0 },
      auth: { deleted: false },
    };

    // 1) Storage: delete `users/<uid>/photos/*` in bucket "moments"
    {
      const bucket = "moments";
      const prefix = `users/${uid}/photos`;

      // list objects under prefix and delete in chunks
      let paths: string[] = [];
      try {
        paths = await listAllObjects({ admin, bucket, prefix });
      } catch (e: any) {
        // Keep going: storage cleanup failure should still be reported
        report.storage = { ...((report.storage as Json) ?? {}), error: String(e?.message ?? e) };
        paths = [];
      }

      report.storage = {
        ...(report.storage as Json),
        attempted: paths.length,
      };

      // Supabase remove() accepts an array of paths; chunk to be safe
      const chunkSize = 200;
      for (let i = 0; i < paths.length; i += chunkSize) {
        const chunk = paths.slice(i, i + chunkSize);
        const { error } = await admin.storage.from(bucket).remove(chunk);
        if (error) {
          report.storage = {
            ...(report.storage as Json),
            error: `Storage remove failed: ${error.message}`,
          };
          break;
        } else {
          report.storage = {
            ...(report.storage as Json),
            deleted: Number((report.storage as any).deleted ?? 0) + chunk.length,
          };
        }
      }
    }

    // 2) DB cleanup
    // Moments
    {
      const { count, error } = await admin.from("moments").delete({ count: "exact" }).eq("user_id", uid);

      if (error) {
        (report.db as any).momentsError = error.message;
      } else {
        (report.db as any).momentsDeleted = count ?? 0;
      }
    }

    // Profile
    {
      const { count, error } = await admin.from("profiles").delete({ count: "exact" }).eq("id", uid);

      if (error) {
        (report.db as any).profileError = error.message;
      } else {
        (report.db as any).profileDeleted = count ?? 0;
      }
    }

    // 3) Auth user delete (final)
    {
      // admin.auth.admin.deleteUser is the clean “really delete” operation
      const { error } = await admin.auth.admin.deleteUser(uid);
      if (error) {
        (report.auth as any).error = error.message;
      } else {
        (report.auth as any).deleted = true;
      }
    }

    // If auth delete failed, we still return 200 with report (frontend can show error)
    // but you may choose to return 500. For now: transparent report is better.
    return jsonResponse(200, { ok: true, report }, origin);
  } catch (e: any) {
    return jsonResponse(500, { error: String(e?.message ?? e ?? "Unknown error") }, origin);
  }
});
