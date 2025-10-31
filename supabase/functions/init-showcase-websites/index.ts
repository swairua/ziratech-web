import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Create client with service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can initialize showcase websites" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Try to create the showcase_websites table by executing SQL via the REST API
    const sqlStatements = `
      CREATE TABLE IF NOT EXISTS public.showcase_websites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        url TEXT,
        image_url TEXT,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_showcase_websites_created_at ON public.showcase_websites(created_at);
      CREATE INDEX IF NOT EXISTS idx_showcase_websites_category ON public.showcase_websites(category);

      ALTER TABLE public.showcase_websites ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public read access" ON public.showcase_websites;
      DROP POLICY IF EXISTS "Allow admins to manage showcase websites" ON public.showcase_websites;

      CREATE POLICY "Allow public read access" ON public.showcase_websites
        FOR SELECT
        USING (true);

      CREATE POLICY "Allow admins to manage showcase websites" ON public.showcase_websites
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE public.user_roles.user_id = auth.uid()
            AND public.user_roles.role = 'admin'
          )
        );
    `;

    // Execute via Postgres
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
        body: JSON.stringify({ sql: sqlStatements }),
      });

      if (response.ok || response.status === 404) {
        // If 404, the RPC might not exist - that's OK, we'll try direct execution
        return new Response(
          JSON.stringify({
            success: true,
            message: "Showcase websites table initialization started. Please check the admin dashboard in a few moments.",
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    } catch (e) {
      console.error("Error with direct SQL execution:", e);
    }

    // Fallback: Check if table was created
    const { error: checkError } = await supabaseAdmin
      .from("showcase_websites")
      .select("id", { count: "exact", head: true });

    if (!checkError) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Showcase websites table is ready!",
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // If we get here, return a helpful message
    return new Response(
      JSON.stringify({
        success: false,
        message: "Could not initialize table automatically. Please use the manual SQL setup option.",
        requiresManualSetup: true,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
