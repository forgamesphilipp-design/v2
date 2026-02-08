// supabase/functions/delete-account/index.ts
// Hard delete: Auth user + DB rows + Storage objects
// - Uses SERVICE ROLE key (stored as PROJECT_SERVICE_ROLE_KEY)
// - Verifies caller via passed JWT (Authorization: Bearer <access_token>)
// - Keeps admin client clean (DO NOT override global Authorization)

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

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return m?.[1]?.trim() || null;
}

async function listAllObjects(opts: {
  admin: ReturnType<typeof createClient>;
  bucket: string;
  prefix: string;
}) {
  const { admin, bucket, prefix } = opts;

  const limit = 1000;
  let offset = 0;

  const paths: string[] = [];

  for (;;) {
    const { data, error } = await admin.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) throw new Error(`Storage list failed: ${error.message}`);

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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("PROJECT_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        500,
        { error: "Missing SUPABASE_URL or PROJECT_SERVICE_ROLE_KEY in Edge Function env." },
        origin
      );
    }

    // ✅ Admin client MUST keep its own auth (service role)
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ✅ Verify caller identity from JWT WITHOUT overriding admin headers
    const token = extractBearerToken(req.headers.get("Authorization"));
    if (!token) {
      return jsonResponse(401, { error: "Unauthorized: missing Bearer token." }, origin);
    }

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr) {
      return jsonResponse(401, { error: `Unauthorized: ${userErr.message}` }, origin);
    }

    const uid = userRes.user?.id;
    if (!uid) return jsonResponse(401, { error: "Unauthorized: no user." }, origin);

    const report: Json = {
      userId: uid,
      storage: { deleted: 0, attempted: 0 },
      db: { momentsDeleted: 0, profileDeleted: 0 },
      auth: { deleted: false },
    };

    // 1) Storage cleanup
    {
      const bucket = "moments";
      const prefix = `users/${uid}/photos`;

      let paths: string[] = [];
      try {
        paths = await listAllObjects({ admin, bucket, prefix });
      } catch (e: any) {
        report.storage = { ...((report.storage as Json) ?? {}), error: String(e?.message ?? e) };
        paths = [];
      }

      report.storage = {
        ...(report.storage as Json),
        attempted: paths.length,
      };

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
        }

        report.storage = {
          ...(report.storage as Json),
          deleted: Number((report.storage as any).deleted ?? 0) + chunk.length,
        };
      }
    }

    // 2) DB cleanup
    {
      const { count, error } = await admin.from("moments").delete({ count: "exact" }).eq("user_id", uid);
      if (error) (report.db as any).momentsError = error.message;
      else (report.db as any).momentsDeleted = count ?? 0;
    }

    {
      const { count, error } = await admin.from("profiles").delete({ count: "exact" }).eq("id", uid);
      if (error) (report.db as any).profileError = error.message;
      else (report.db as any).profileDeleted = count ?? 0;
    }

    // 3) Auth user delete (final)
    {
      const { error } = await admin.auth.admin.deleteUser(uid);
      if (error) (report.auth as any).error = error.message;
      else (report.auth as any).deleted = true;
    }

    return jsonResponse(200, { ok: true, report }, origin);
  } catch (e: any) {
    return jsonResponse(500, { error: String(e?.message ?? e ?? "Unknown error") }, origin);
  }
});
