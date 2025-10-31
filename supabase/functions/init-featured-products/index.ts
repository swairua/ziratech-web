import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get auth header to verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify the user is authenticated and get their session
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !roleData || roleData.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can initialize featured products" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Check if table already exists
    const { data: existingTable } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "products")
      .single();

    if (existingTable) {
      return new Response(
        JSON.stringify({ success: true, message: "Products table already exists" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Create the products table using SQL
    const createTableSQL = `
      CREATE TABLE public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        image_url TEXT,
        category TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        featured_order INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_products_is_featured ON public.products(is_featured);
      CREATE INDEX idx_products_featured_order ON public.products(featured_order);

      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Allow public read access" ON public.products
        FOR SELECT
        USING (true);

      CREATE POLICY "Allow admins to manage products" ON public.products
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE public.user_roles.user_id = auth.uid()
            AND public.user_roles.role = 'admin'
          )
        );
    `;

    const { error: createError } = await supabaseAdmin.rpc("exec_sql", {
      sql: createTableSQL,
    }).catch(async () => {
      // If RPC doesn't exist, try direct SQL execution via Postgres
      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/exec_sql`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          },
          body: JSON.stringify({ sql: createTableSQL }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("RPC Error:", text);
        throw new Error("Failed to execute SQL");
      }

      return { error: null };
    });

    if (createError) {
      console.error("Create error:", createError);
      return new Response(
        JSON.stringify({
          error: "Failed to create products table",
          details: createError,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Products table created successfully",
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
