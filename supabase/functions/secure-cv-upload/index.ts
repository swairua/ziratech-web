import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Helper function to check rate limits
function checkRateLimit(ip: string, maxRequests = 5, windowMs = 3600000): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Helper function to validate origin
function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow requests from our domain or localhost for development
  const allowedOrigins = [
    'https://vzznvztokpdtlzcvojar.supabase.co',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];
  
  return origin ? allowedOrigins.some(allowed => origin.includes(allowed)) : 
         referer ? allowedOrigins.some(allowed => referer.includes(allowed)) : false;
}

interface CVUploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limits
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(JSON.stringify({
        error: 'Too many requests. Please try again later.'
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate origin for additional security
    if (!validateOrigin(req)) {
      console.warn(`Invalid origin for IP: ${clientIP}`);
      return new Response(JSON.stringify({
        error: 'Invalid request origin.'
      }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify JWT token for authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Authentication required'
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.warn(`Authentication failed for IP: ${clientIP}`, authError);
      return new Response(JSON.stringify({
        error: 'Invalid authentication'
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { fileName, fileType, fileSize, userId }: CVUploadRequest = await req.json();
    
    // Ensure userId matches the authenticated user
    if (userId && userId !== user.id) {
      console.warn(`User ID mismatch: ${userId} vs ${user.id} for IP: ${clientIP}`);
      return new Response(JSON.stringify({
        error: 'User ID mismatch'
      }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(fileType)) {
      return new Response(JSON.stringify({
        error: 'Invalid file type. Only PDF and Word documents are allowed.'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    if (fileSize > 5 * 1024 * 1024) { // 5MB limit
      return new Response(JSON.stringify({
        error: 'File size exceeds 5MB limit.'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate secure filename
    const fileExt = fileName.split('.').pop();
    const secureFileName = `cv_${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
    
    // Create signed upload URL (expires in 1 hour)
    const { data, error } = await supabase.storage
      .from('cv-uploads')
      .createSignedUploadUrl(secureFileName, {
        upsert: false
      });

    if (error) {
      console.error('Error creating signed upload URL:', error);
      return new Response(JSON.stringify({
        error: 'Failed to create upload URL'
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Log the upload request for audit purposes
    if (userId) {
      await supabase.from('activity_logs').insert({
        user_id: userId,
        action: 'cv_upload_requested',
        resource_type: 'cv_file',
        details: {
          fileName: secureFileName,
          originalName: fileName,
          fileSize,
          fileType
        }
      });
    }

    return new Response(JSON.stringify({
      uploadUrl: data.signedUrl,
      filePath: secureFileName,
      message: 'Upload URL created successfully'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in secure-cv-upload function:", error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);