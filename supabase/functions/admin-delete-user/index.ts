
import { corsHeaders } from "../_shared/cors.ts";

// Use ESM import compatible with Deno edge functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase env vars");
    return new Response(
      JSON.stringify({ error: "Server not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");

  if (!jwt) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  try {
    const { data: body } = await req.json().then((d) => ({ data: d })).catch(() => ({ data: null }));
    const userId: string | undefined = body?.userId;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Identify caller
    const { data: userFromToken, error: getUserErr } = await adminClient.auth.getUser(jwt);
    if (getUserErr || !userFromToken?.user) {
      console.error("getUser error", getUserErr);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const callerId = userFromToken.user.id;

    if (callerId === userId) {
      return new Response(
        JSON.stringify({ error: "You cannot delete your own account." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check caller role (must be admin)
    // Prefer RPC to centralize logic; falls back to direct table query if needed.
    let isAdmin = false;

    const { data: roleEnum, error: roleRpcErr } = await adminClient.rpc("get_user_role", { user_uuid: callerId });
    if (roleRpcErr) {
      console.warn("RPC get_user_role failed, falling back to direct query:", roleRpcErr?.message);
      const { data: roleRow, error: roleSelErr } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", callerId)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (roleSelErr) {
        console.error("Failed to fetch caller role", roleSelErr);
        return new Response(
          JSON.stringify({ error: "Failed to verify permissions" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      isAdmin = roleRow?.role === "admin";
    } else {
      isAdmin = roleEnum === "admin";
    }

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Perform delete via Admin API
    const { error: delErr } = await adminClient.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error("deleteUser error", delErr);
      return new Response(
        JSON.stringify({ error: delErr.message || "Failed to delete user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Unhandled error in admin-delete-user:", e);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
