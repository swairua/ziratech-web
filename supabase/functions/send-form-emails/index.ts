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

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Helper function to check rate limits
function checkRateLimit(ip: string, maxRequests = 10, windowMs = 3600000): boolean {
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

interface FormSubmissionData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  position?: string;
  formType?: string;
  form_type?: string;
  service_interest?: string;
  website_type?: string;
  budget_range?: string;
  timeline?: string;
  features_needed?: string;
  business_type?: string;
  monthly_volume?: string;
  device_type?: string;
  volume?: string;
  use_case?: string;
  role?: string;
  number_of_units?: string;
  country?: string;
  cv_file_url?: string;
  [key: string]: any; // Allow any additional fields
}

// Normalize form types to canonical values and extract product key
function normalizeFormType(formType: string): { canonical: string; productKey?: string } {
  if (!formType || typeof formType !== 'string') {
    return { canonical: 'contact' };
  }
  
  const normalized = formType.toLowerCase().replace(/[^a-z_]/g, '');
  
  // Extract product key if present
  let productKey: string | undefined;
  if (normalized.includes('zira_web') || normalized.includes('ziraweb')) {
    productKey = 'zira_web';
  } else if (normalized.includes('zira_sms') || normalized.includes('zirasms')) {
    productKey = 'zira_sms';
  } else if (normalized.includes('zira_homes') || normalized.includes('zirahomes')) {
    productKey = 'zira_homes';
  } else if (normalized.includes('zira_lock') || normalized.includes('ziralock')) {
    productKey = 'zira_lock';
  }
  
  // Map variations to canonical types
  if (normalized.includes('career') || normalized.includes('job') || normalized.includes('application')) {
    return { canonical: 'career_application', productKey };
  }
  
  // Everything else is contact-related
  return { canonical: 'contact', productKey };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        error: 'Unauthorized: Missing or invalid authentication token.'
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify JWT token with Supabase
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.warn(`Authentication failed: ${userError?.message || 'Invalid token'}`);
      return new Response(JSON.stringify({
        error: 'Unauthorized: Invalid authentication token.'
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limits (more restrictive for authenticated users)
    if (!checkRateLimit(clientIP, 5, 3600000)) { // 5 requests per hour for authenticated users
      console.warn(`Rate limit exceeded for authenticated user ${user.id} from IP: ${clientIP}`);
      return new Response(JSON.stringify({
        error: 'Too many requests. Please try again later.'
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Strict origin validation
    const allowedOrigins = [
      'https://vzznvztokpdtlzcvojar.supabase.co',
      'https://your-production-domain.com', // Replace with actual production domain
    ];
    
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    
    const isValidOrigin = origin && allowedOrigins.some(allowed => origin === allowed) ||
                         referer && allowedOrigins.some(allowed => referer.startsWith(allowed));
    
    if (!isValidOrigin) {
      console.warn(`Invalid origin for authenticated user ${user.id} from IP: ${clientIP}`);
      return new Response(JSON.stringify({
        error: 'Invalid request origin.'
      }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Log the authenticated request
    console.log(`Authenticated email request from user: ${user.id}, IP: ${clientIP}`);

    const formData: FormSubmissionData = await req.json();
    console.log("Processing form submission:", formData);
    console.log("Available keys:", Object.keys(formData));

    // Accept both form_type and formType for backward compatibility
    const rawFormType = formData.formType || formData.form_type || 'contact';
    
    // Normalize the form type and extract product info
    const { canonical: normalizedFormType, productKey } = normalizeFormType(rawFormType);
    console.log(`Normalized form type from "${rawFormType}" to "${normalizedFormType}" with product: ${productKey || 'none'}`);

    // Get active automation rules for this form type
    const { data: rules, error: rulesError } = await supabase
      .from('email_automation_rules')
      .select(`
        *,
        email_templates (*)
      `)
      .eq('is_active', true)
      .eq('trigger_type', 'form_submission')
      .contains('conditions', { form_type: normalizedFormType });

    if (rulesError) {
      console.error('Error fetching automation rules:', rulesError);
      throw new Error('Failed to fetch email automation rules');
    }

    console.log(`Found ${rules?.length || 0} rules before product filtering`);

    // Filter rules by product if we have a product key
    let filteredRules = rules || [];
    if (productKey && rules) {
      filteredRules = rules.filter(rule => {
        const conditions = rule.conditions || {};
        // If rule has form_product condition, it must match our product
        if (conditions.form_product) {
          return conditions.form_product === productKey;
        }
        // If no form_product condition, rule applies to all products
        return true;
      });
    }

    console.log(`Found ${filteredRules.length} rules after product filtering for: ${normalizedFormType}${productKey ? ` (${productKey})` : ''}`);

    // Process each automation rule
    for (const rule of filteredRules) {
      if (rule.email_templates) {
        await processEmailRule(rule, formData);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Emails sent successfully",
      rulesProcessed: filteredRules.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-form-emails function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function processEmailRule(rule: any, data: FormSubmissionData) {
  const template = rule.email_templates;
  if (!template) {
    console.log(`No template found for rule: ${rule.name}`);
    return;
  }

  // Determine recipient email
  let recipientEmail = '';
  if (rule.recipient_type === 'user') {
    recipientEmail = data.email;
  } else if (rule.recipient_type === 'admin') {
    recipientEmail = await getAdminRecipient(rule, data);
  } else if (rule.recipient_type === 'custom' && rule.custom_recipient) {
    recipientEmail = rule.custom_recipient;
  }

  if (!recipientEmail) {
    console.error(`No recipient email found for rule: ${rule.name}`);
    return;
  }

  // Replace template variables and handle {{all_fields}}
  let processedContent = replaceTemplateVariables(template.content, data);
  const processedSubject = replaceTemplateVariables(template.subject, data);
  
  // Handle {{all_fields}} placeholder or auto-inject for admin emails
  if (rule.recipient_type === 'admin') {
    if (processedContent.includes('{{all_fields}}')) {
      const allFieldsHtml = generateAllFieldsTable(data);
      processedContent = processedContent.replace(/\{\{all_fields\}\}/g, allFieldsHtml);
    } else {
      // Auto-inject details table for admin emails that don't have {{all_fields}}
      const allFieldsHtml = generateAllFieldsTable(data);
      const injectionPoint = processedContent.lastIndexOf('</div>'); // Find a good injection point
      if (injectionPoint > -1) {
        const beforeInjection = processedContent.substring(0, injectionPoint);
        const afterInjection = processedContent.substring(injectionPoint);
        processedContent = beforeInjection + 
          `<div style="margin-top: 25px; padding: 20px; background-color: #f1f5f9; border-radius: 8px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Submission Details</h3>
            ${allFieldsHtml}
          </div>` + 
          afterInjection;
      }
    }
  }

  // Get sender info from settings
  const senderInfo = await getSenderInfo();
  const fromName = senderInfo.from_name;
  const fromEmail = senderInfo.from_email;

  try {
    // Generate text version for better deliverability
    const textContent = generateTextVersion(processedContent);
    
    // Prepare email options with deliverability best practices
    const emailOptions: any = {
      from: `${fromName} <${fromEmail}>`,
      to: [recipientEmail],
      subject: processedSubject,
      html: processedContent,
      text: textContent,
      reply_to: senderInfo.reply_to
    };

    // Disable click tracking for client confirmations to improve deliverability
    if (rule.recipient_type === 'user') {
      emailOptions.tracking = {
        click: false,
        open: false
      };
    }

    // Send email
    const result = await resend.emails.send(emailOptions);

    console.log(`Email sent for rule ${rule.name}:`, result);

    // Log email event
    await supabase.from('email_events').insert({
      template_id: template.id,
      rule_id: rule.id,
      recipient_email: recipientEmail,
      subject: processedSubject,
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: { form_data: data, resend_id: result.data?.id }
    });

    // Update rule sent count
    await supabase
      .from('email_automation_rules')
      .update({ sent_count: rule.sent_count + 1 })
      .eq('id', rule.id);

  } catch (error: any) {
    console.error(`Error sending email for rule ${rule.name}:`, error);
    
    // Log failed event
    await supabase.from('email_events').insert({
      template_id: template.id,
      rule_id: rule.id,
      recipient_email: recipientEmail,
      subject: processedSubject,
      status: 'failed',
      error_message: error.message,
      metadata: { form_data: data }
    });
  }
}

async function getAdminRecipient(rule: any, data: FormSubmissionData): Promise<string> {
  // Priority: custom_recipient -> company_settings.admin_recipients -> email_senders (filtered) -> email_settings -> fallback
  
  // 1. Check rule's custom recipient
  if (rule.custom_recipient && !rule.custom_recipient.includes('@resend.dev')) {
    console.log(`Using rule custom recipient: ${rule.custom_recipient}`);
    return rule.custom_recipient;
  }

  // 2. Check company settings for admin recipients (support multiple emails)
  try {
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_recipients')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (companySettings?.setting_value?.emails) {
      const emailsText = companySettings.setting_value.emails;
      if (typeof emailsText === 'string' && emailsText.trim()) {
        const adminEmails = emailsText
          .split(/[,\n]/)
          .map((email: string) => email.trim())
          .filter((email: string) => 
            email.includes('@') && 
            !email.includes('@resend.dev') &&
            email.length > 0
          );
        
        if (adminEmails.length > 0) {
          console.log(`Using company admin recipients: ${adminEmails.join(', ')} (using first: ${adminEmails[0]})`);
          return adminEmails[0];
        }
      }
    }
  } catch (error) {
    console.error('Error fetching company admin recipients:', error);
  }

  // 3. Check active email senders (filter out resend.dev, prioritize is_default)
  try {
    const { data: senders } = await supabase
      .from('email_senders')
      .select('reply_to, from_email, from_name, is_default')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (senders && senders.length > 0) {
      for (const sender of senders) {
        const recipientEmail = sender.reply_to || sender.from_email;
        if (recipientEmail && !recipientEmail.includes('@resend.dev')) {
          console.log(`Using email sender recipient: ${recipientEmail} (default: ${sender.is_default})`);
          return recipientEmail;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching email senders:', error);
  }

  // 4. Check email settings
  try {
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('setting_value')
      .eq('setting_key', 'sender_info')
      .maybeSingle();
    
    if (emailSettings?.setting_value?.reply_to && !emailSettings.setting_value.reply_to.includes('@resend.dev')) {
      console.log(`Using email settings recipient: ${emailSettings.setting_value.reply_to}`);
      return emailSettings.setting_value.reply_to;
    }
  } catch (error) {
    console.error('Error fetching email settings:', error);
  }

  // 5. Final fallback
  console.log('Using fallback admin recipient: support@ziratech.com');
  return 'support@ziratech.com';
}

async function checkDomainVerification(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.resend.com/domains/${domain}`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'verified';
    }
    return false;
  } catch (error) {
    console.error(`Error checking domain verification for ${domain}:`, error);
    return false;
  }
}

function extractDomain(email: string): string {
  return email.split('@')[1];
}

function generateTextVersion(htmlContent: string): string {
  // Convert HTML to plain text version
  return htmlContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

async function getSenderInfo() {
  try {
    // Check if we have verified domain from email_senders first
    const { data: senders } = await supabase
      .from('email_senders')
      .select('from_email, from_name, reply_to, is_default, is_active')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    let senderInfo = {
      from_name: 'Zira Technologies',
      from_email: 'onboarding@resend.dev',
      reply_to: 'support@ziratech.com'
    };

    // Use email_senders if available and check domain verification
    if (senders && senders.length > 0) {
      for (const sender of senders) {
        if (sender.from_email && !sender.from_email.includes('@resend.dev')) {
          const domain = extractDomain(sender.from_email);
          const isVerified = await checkDomainVerification(domain);
          
          if (isVerified) {
            senderInfo = {
              from_name: sender.from_name || senderInfo.from_name,
              from_email: sender.from_email,
              reply_to: sender.reply_to || sender.from_email
            };
            console.log('Using verified domain sender:', {
              from_name: senderInfo.from_name,
              from_email: senderInfo.from_email,
              reply_to: senderInfo.reply_to,
              domain_verified: true
            });
            return senderInfo;
          } else {
            console.log(`Domain ${domain} not verified, skipping sender: ${sender.from_email}`);
          }
        }
      }
    }

    // Fallback to email_settings
    const { data: settings } = await supabase
      .from('email_settings')
      .select('setting_value')
      .in('setting_key', ['sender_information', 'sender_info', 'smtp']);

    if (settings && settings.length > 0) {
      settings.forEach(setting => {
        if (setting.setting_value) {
          senderInfo = {
            ...senderInfo,
            ...setting.setting_value
          };
        }
      });
    }

    // Always use verified domain for reliable delivery
    console.log('Using resend verified domain for reliable delivery:', {
      from_name: senderInfo.from_name,
      from_email: 'onboarding@resend.dev',
      reply_to: senderInfo.reply_to,
      reason: 'no_verified_custom_domain'
    });
    
    return {
      from_name: senderInfo.from_name,
      from_email: 'onboarding@resend.dev',
      reply_to: senderInfo.reply_to
    };

  } catch (error) {
    console.error('Error getting sender info:', error);
    // Return defaults if there's an error
    return {
      from_name: 'Zira Technologies',
      from_email: 'onboarding@resend.dev',
      reply_to: 'support@ziratech.com'
    };
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replaceTemplateVariables(content: string, data: FormSubmissionData): string {
  let processed = content;
  
  // Dynamic replacement: find all {{variable}} patterns and replace from data
  const variablePattern = /\{\{(\w+)\}\}/g;
  processed = processed.replace(variablePattern, (match, variableName) => {
    // Handle aliases
    if (variableName === 'service_interest' && data.service && !data.service_interest) {
      return escapeHtml(data.service || '');
    }
    if (variableName === 'service' && data.service_interest && !data.service) {
      return escapeHtml(data.service_interest || '');
    }
    
    // Get value from data and escape HTML to prevent injection
    const value = data[variableName];
    return value !== undefined && value !== null ? escapeHtml(String(value)) : '';
  });
  
  return processed;
}

function generateAllFieldsTable(data: FormSubmissionData): string {
  // Define which fields to exclude from the details table
  const excludedKeys = ['form_type', 'formType', 'all_fields'];
  
  // Define nice field labels
  const fieldLabels: Record<string, string> = {
    name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    company: 'Company/Organization',
    message: 'Message/Comments',
    position: 'Position Applied',
    service_interest: 'Service Interest',
    website_type: 'Website Type',
    budget_range: 'Budget Range',
    timeline: 'Project Timeline',
    features_needed: 'Features Needed',
    business_type: 'Business Type',
    monthly_volume: 'Monthly SMS Volume',
    device_type: 'Device Type',
    volume: 'Volume',
    use_case: 'Use Case',
    role: 'Role/Position',
    number_of_units: 'Number of Units',
    country: 'Country',
    cv_file_url: 'CV/Resume File'
  };

  const rows: string[] = [];
  
  // Process all data fields
  Object.entries(data).forEach(([key, value]) => {
    if (excludedKeys.includes(key) || !value || value === '') {
      return; // Skip excluded, empty, or null values
    }
    
    const label = fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const displayValue = escapeHtml(String(value));
    
    // Special handling for different field types
    if (key === 'cv_file_url' && value) {
      rows.push(`
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; vertical-align: top; width: 30%;">
            ${label}:
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">
            <a href="${displayValue}" style="color: #f97316; text-decoration: none; font-weight: 600;">📄 View CV/Resume</a>
          </td>
        </tr>
      `);
    } else if (key === 'message' && displayValue.length > 100) {
      // For long messages, show in a text block
      rows.push(`
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; vertical-align: top; width: 30%;">
            ${label}:
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">
            <div style="background-color: #ffffff; padding: 12px; border-radius: 4px; border-left: 3px solid #f97316; font-style: italic;">
              ${displayValue}
            </div>
          </td>
        </tr>
      `);
    } else {
      rows.push(`
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; vertical-align: top; width: 30%;">
            ${label}:
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">
            ${displayValue}
          </td>
        </tr>
      `);
    }
  });

  if (rows.length === 0) {
    return '<p style="color: #64748b; font-style: italic;">No additional details provided.</p>';
  }

  console.log(`Generated details table with ${rows.length} fields for admin email`);

  return `
    <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0;">
      ${rows.join('')}
    </table>
  `;
}

serve(handler);