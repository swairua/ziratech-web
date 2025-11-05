import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

interface TestEmailRequest {
  testEmail: string;
  templateId?: string;
  senderId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testEmail, templateId, senderId }: TestEmailRequest = await req.json();
    console.log("Processing test email request:", { testEmail, templateId });

    if (!testEmail) {
      return new Response(JSON.stringify({ error: "Test email address is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get sender info - either from specified sender or default
    let senderInfo = {
      from_name: 'Resend Demo',
      from_email: 'onboarding@resend.dev',
      reply_to: 'noreply@resend.dev'
    };

    if (senderId) {
      const { data: sender } = await supabase
        .from('email_senders')
        .select('from_name, from_email, reply_to')
        .eq('id', senderId)
        .eq('is_active', true)
        .single();
      
      if (sender) {
        senderInfo = sender;
      }
    } else {
      // Get default sender
      const { data: defaultSender } = await supabase
        .from('email_senders')
        .select('from_name, from_email, reply_to')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();
      
      if (defaultSender) {
        senderInfo = defaultSender;
      }
    }

    console.log('Using sender info:', senderInfo);

    // Load template if templateId provided
    let emailContent = {
      subject: 'Test Email from Zira Technologies',
      content: `
        <h1>Test Email</h1>
        <p>This is a test email sent from your Zira Technologies email automation system.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>Test sent at: ${new Date().toISOString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This email was sent from the email automation system.</p>
      `
    };

    if (templateId) {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        console.error('Error loading template:', templateError);
        // Continue with default template
      } else if (template) {
        emailContent = {
          subject: `[TEST] ${template.subject}`,
          content: template.content
        };
      }
    }

    // Replace template variables with test data
    const processedContent = replaceTemplateVariables(emailContent.content, {
      name: 'Test User',
      email: testEmail,
      company: 'Test Company',
      message: 'This is a test message',
      phone: '+1234567890'
    });

    const processedSubject = replaceTemplateVariables(emailContent.subject, {
      name: 'Test User',
      email: testEmail,
      company: 'Test Company'
    });

    console.log('Sending test email with processed content');

    // Send email using Resend
    const result = await resend.emails.send({
      from: `${senderInfo.from_name} <${senderInfo.from_email}>`,
      to: [testEmail],
      subject: processedSubject,
      html: processedContent,
      reply_to: senderInfo.reply_to || senderInfo.from_email
    });

    // Check for Resend API errors
    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Email sending failed: ${result.error.message || 'Unknown error'}`);
    }

    console.log("Test email sent successfully:", result);

    // Log email event
    await supabase.from('email_events').insert({
      template_id: templateId || null,
      rule_id: null,
      recipient_email: testEmail,
      subject: processedSubject,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: { 
        test_email: true, 
        resend_id: result.data?.id,
        sender_info: senderInfo
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Test email sent successfully",
      emailId: result.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-test-email function:", error);
    
    // Log failed event if we have email info
    try {
      const { testEmail } = await req.json();
      if (testEmail) {
        await supabase.from('email_events').insert({
          template_id: null,
          rule_id: null,
          recipient_email: testEmail,
          subject: 'Test Email (Failed)',
          status: 'failed',
          error_message: error.message,
          metadata: { test_email: true }
        });
      }
    } catch (logError) {
      console.error("Failed to log error event:", logError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Check the function logs for more information"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function replaceTemplateVariables(content: string, data: Record<string, string>): string {
  let processed = content;
  
  // Replace common variables
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processed = processed.replace(regex, value || '');
  });
  
  return processed;
}

serve(handler);