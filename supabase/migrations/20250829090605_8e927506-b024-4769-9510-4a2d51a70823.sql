-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('contact_confirmation', 'career_confirmation', 'contact_admin', 'career_admin', 'custom')),
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email automation rules table
CREATE TABLE public.email_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('form_submission', 'user_signup', 'project_inquiry', 'manual')),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  conditions JSONB DEFAULT '{}',
  delay_minutes INTEGER DEFAULT 0,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('user', 'admin', 'custom')),
  custom_recipient TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sent_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email settings table
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email events table for tracking
CREATE TABLE public.email_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.email_templates(id),
  rule_id UUID REFERENCES public.email_automation_rules(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_templates
CREATE POLICY "Admins can manage email templates" 
  ON public.email_templates 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for email_automation_rules
CREATE POLICY "Admins can manage automation rules" 
  ON public.email_automation_rules 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for email_settings
CREATE POLICY "Admins can manage email settings" 
  ON public.email_settings 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Create RLS policies for email_events
CREATE POLICY "Admins can view email events" 
  ON public.email_events 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can insert email events" 
  ON public.email_events 
  FOR INSERT 
  WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_automation_rules_updated_at
  BEFORE UPDATE ON public.email_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_settings_updated_at
  BEFORE UPDATE ON public.email_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, description, template_type, content, variables) VALUES
('Contact Form Confirmation', 'Thank you for contacting us!', 'Confirmation email sent to users who submit the contact form', 'contact_confirmation', 
'<h1>Thank you for contacting us, {{name}}!</h1>
<p>We have received your message and will get back to you as soon as possible.</p>
<p><strong>Your message:</strong></p>
<p>{{message}}</p>
<p>Best regards,<br>The Team</p>', 
ARRAY['name', 'email', 'message', 'company', 'phone']),

('Career Application Confirmation', 'Application received - {{position}}', 'Confirmation email sent to career applicants', 'career_confirmation',
'<h1>Thank you for your application, {{name}}!</h1>
<p>We have received your application for the <strong>{{position}}</strong> position.</p>
<p>We will review your application and get back to you within 5-7 business days.</p>
<p>Best of luck!</p>
<p>Best regards,<br>HR Team</p>',
ARRAY['name', 'email', 'position']),

('Contact Form Admin Notification', 'New contact form submission from {{name}}', 'Notification sent to admins for new contact forms', 'contact_admin',
'<h1>New Contact Form Submission</h1>
<p><strong>Name:</strong> {{name}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Company:</strong> {{company}}</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>
<p>Please respond promptly.</p>',
ARRAY['name', 'email', 'company', 'phone', 'message']),

('Career Application Admin Notification', 'New career application for {{position}}', 'Notification sent to HR for new career applications', 'career_admin',
'<h1>New Career Application</h1>
<p><strong>Position:</strong> {{position}}</p>
<p><strong>Applicant:</strong> {{name}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>
<p>CV is attached to this application.</p>',
ARRAY['name', 'email', 'phone', 'position', 'message']);

-- Insert default email settings
INSERT INTO public.email_settings (setting_key, setting_value) VALUES
('smtp_settings', '{"host": "", "port": 587, "username": "", "password": "", "encryption": "tls"}'),
('sender_info', '{"from_name": "Your Company", "from_email": "noreply@yourcompany.com", "reply_to": "support@yourcompany.com"}'),
('delivery_settings', '{"rate_limit": 100, "retry_attempts": 3, "retry_delay": 300, "bounce_handling": true, "track_opens": true, "track_clicks": true}'),
('security_settings', '{"dkim_enabled": false, "spf_verified": false, "dmarc_enabled": false, "domain_verified": false}');

-- Create default automation rules
INSERT INTO public.email_automation_rules (name, description, trigger_type, template_id, conditions, recipient_type) VALUES
('Contact Form Auto-Response', 'Automatically send confirmation to users who submit contact forms', 'form_submission', 
  (SELECT id FROM public.email_templates WHERE template_type = 'contact_confirmation' LIMIT 1),
  '{"form_type": "contact"}', 'user'),
('Contact Form Admin Alert', 'Notify admins of new contact form submissions', 'form_submission',
  (SELECT id FROM public.email_templates WHERE template_type = 'contact_admin' LIMIT 1),
  '{"form_type": "contact"}', 'admin'),
('Career Application Auto-Response', 'Send confirmation to career applicants', 'form_submission',
  (SELECT id FROM public.email_templates WHERE template_type = 'career_confirmation' LIMIT 1),
  '{"form_type": "career_application"}', 'user'),
('Career Application HR Alert', 'Notify HR of new career applications', 'form_submission',
  (SELECT id FROM public.email_templates WHERE template_type = 'career_admin' LIMIT 1),
  '{"form_type": "career_application"}', 'admin');