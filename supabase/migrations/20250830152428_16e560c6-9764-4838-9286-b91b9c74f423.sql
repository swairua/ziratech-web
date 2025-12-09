-- Add missing automation rules for demo_booking and improve email system
INSERT INTO public.email_automation_rules (name, description, trigger_type, recipient_type, template_id, conditions, is_active)
VALUES 
  ('Demo Booking Confirmation', 'Send confirmation to users who book demos', 'form_submission', 'user', 
   (SELECT id FROM email_templates WHERE name = 'Contact Form Auto-Response' LIMIT 1),
   '{"form_type": "demo_booking"}', true),
  ('Demo Booking Admin Alert', 'Notify admins of new demo bookings', 'form_submission', 'admin',
   (SELECT id FROM email_templates WHERE name = 'Contact Form Admin Alert' LIMIT 1), 
   '{"form_type": "demo_booking"}', true);

-- Add email templates for demo bookings
INSERT INTO public.email_templates (name, subject, description, template_type, content, variables, is_active)
VALUES 
  ('Demo Booking Confirmation', 'Demo Scheduled - {{name}}', 'Confirmation email for demo bookings', 'transactional',
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e293b; margin-bottom: 20px;">Demo Scheduled Successfully!</h1>
    <p>Hi {{name}},</p>
    <p>Thank you for scheduling a demo with Zira Technologies. We''re excited to show you how our platform can transform your business operations.</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1e293b; margin: 0 0 10px 0;">Demo Details:</h3>
      <p><strong>Platform:</strong> {{platform}}</p>
      <p><strong>Company:</strong> {{company}}</p>
      <p><strong>Preferred Time:</strong> {{preferred_time}}</p>
      <p><strong>Timezone:</strong> {{timezone}}</p>
    </div>
    <p>Our team will contact you within 6 hours during business hours to confirm the exact demo time and send you the meeting link.</p>
    <p>If you have any questions, feel free to reply to this email or call us at +254 757878023.</p>
    <p>Best regards,<br>The Zira Technologies Team</p>
   </div>', 
   ARRAY['name', 'company', 'platform', 'preferred_time', 'timezone'], true),
   
  ('Demo Booking Admin Notification', 'New Demo Request from {{name}} - {{company}}', 'Admin notification for demo bookings', 'notification',
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e293b; margin-bottom: 20px;">New Demo Request</h1>
    <p>A new demo has been requested. Please follow up within 6 hours.</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1e293b; margin: 0 0 15px 0;">Contact Information:</h3>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Company:</strong> {{company}}</p>
      <p><strong>Role:</strong> {{role}}</p>
    </div>
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1e293b; margin: 0 0 15px 0;">Demo Requirements:</h3>
      <p><strong>Platform:</strong> {{platform}}</p>
      <p><strong>Business Size:</strong> {{business_size}}</p>
      <p><strong>Current Solution:</strong> {{current_solution}}</p>
      <p><strong>Preferred Time:</strong> {{preferred_time}}</p>
      <p><strong>Timezone:</strong> {{timezone}}</p>
      <p><strong>Focus Areas:</strong> {{specific_requirements}}</p>
    </div>
    {{all_fields}}
   </div>',
   ARRAY['name', 'email', 'phone', 'company', 'role', 'platform', 'business_size', 'current_solution', 'preferred_time', 'timezone', 'specific_requirements'], true);

-- Update the demo booking automation rules to use the new templates
UPDATE public.email_automation_rules 
SET template_id = (SELECT id FROM email_templates WHERE name = 'Demo Booking Confirmation' LIMIT 1)
WHERE name = 'Demo Booking Confirmation';

UPDATE public.email_automation_rules 
SET template_id = (SELECT id FROM email_templates WHERE name = 'Demo Booking Admin Notification' LIMIT 1)
WHERE name = 'Demo Booking Admin Alert';

-- Add career application email templates and automation
INSERT INTO public.email_templates (name, subject, description, template_type, content, variables, is_active)
VALUES 
  ('Career Application Confirmation', 'Application Received - {{position}}', 'Confirmation for career applications', 'transactional',
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e293b; margin-bottom: 20px;">Application Received!</h1>
    <p>Hi {{name}},</p>
    <p>Thank you for your interest in joining the Zira Technologies team. We have successfully received your application for the <strong>{{position}}</strong> position.</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1e293b; margin: 0 0 10px 0;">What happens next?</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Our HR team will review your application within 5 business days</li>
        <li>If your profile matches our requirements, we''ll contact you for an initial interview</li>
        <li>The complete process typically takes 2-3 weeks</li>
      </ul>
    </div>
    <p>We''re always excited to meet talented individuals who share our passion for transforming African businesses through technology.</p>
    <p>If you have any questions about your application, feel free to reply to this email.</p>
    <p>Best regards,<br>Zira Technologies HR Team</p>
   </div>', 
   ARRAY['name', 'position'], true),
   
  ('Career Application HR Notification', 'New Application: {{position}} - {{name}}', 'HR notification for career applications', 'notification',
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e293b; margin-bottom: 20px;">New Career Application</h1>
    <p>A new career application has been submitted. Please review and respond within 5 business days.</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1e293b; margin: 0 0 15px 0;">Applicant Information:</h3>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Position Applied:</strong> {{position}}</p>
      <p><strong>Experience:</strong> {{experience}}</p>
    </div>
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #1e293b; margin: 0 0 15px 0;">Additional Details:</h3>
      <p><strong>Portfolio:</strong> {{portfolio}}</p>
      <p><strong>GitHub:</strong> {{github}}</p>
      <p><strong>CV:</strong> {{cv_file_url}}</p>
    </div>
    {{all_fields}}
   </div>',
   ARRAY['name', 'email', 'phone', 'position', 'experience', 'portfolio', 'github', 'cv_file_url'], true);

-- Create marketing settings table for cookie and pixel management
CREATE TABLE IF NOT EXISTS public.marketing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage marketing settings"
  ON public.marketing_settings
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Insert default marketing settings
INSERT INTO public.marketing_settings (setting_key, setting_value, is_active) VALUES
  ('cookie_consent', '{
    "enabled": true,
    "categories": {
      "necessary": {"name": "Necessary", "description": "Essential cookies for website functionality", "required": true},
      "analytics": {"name": "Analytics", "description": "Help us understand how visitors use our website", "required": false},
      "marketing": {"name": "Marketing", "description": "Used to track visitors and display relevant ads", "required": false}
    },
    "banner_text": "We use cookies to enhance your experience and analyze our traffic.",
    "accept_all_text": "Accept All",
    "reject_all_text": "Reject All",
    "manage_text": "Manage Preferences"
  }', true),
  ('social_pixels', '{
    "facebook_pixel": {"id": "", "enabled": false},
    "google_analytics": {"id": "", "enabled": false},
    "linkedin_insight": {"id": "", "enabled": false},
    "twitter_pixel": {"id": "", "enabled": false}
  }', true),
  ('conversion_tracking', '{
    "track_form_submissions": true,
    "track_page_views": true,
    "track_button_clicks": true,
    "track_file_downloads": true
  }', true);

-- Create user consent tracking table
CREATE TABLE IF NOT EXISTS public.user_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  ip_address inet,
  user_agent text,
  consent_categories jsonb NOT NULL DEFAULT '{}',
  consent_timestamp timestamptz NOT NULL DEFAULT now(),
  last_updated timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage their own consent"
  ON public.user_consent
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_consent_session_idx ON public.user_consent (session_id);
CREATE INDEX IF NOT EXISTS user_consent_timestamp_idx ON public.user_consent (consent_timestamp DESC);