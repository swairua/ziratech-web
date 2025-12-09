-- Add career application automation rules
INSERT INTO public.email_automation_rules (name, description, trigger_type, recipient_type, template_id, conditions, is_active)
VALUES 
  ('Career Application Confirmation', 'Send confirmation to career applicants', 'form_submission', 'user', 
   (SELECT id FROM email_templates WHERE name = 'Career Application Confirmation' LIMIT 1),
   '{"form_type": "career_application"}', true),
  ('Career Application HR Alert', 'Notify HR of new career applications', 'form_submission', 'admin',
   (SELECT id FROM email_templates WHERE name = 'Career Application HR Notification' LIMIT 1), 
   '{"form_type": "career_application"}', true);