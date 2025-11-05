-- Add missing automation rules for demo_booking and improve email system
INSERT INTO public.email_automation_rules (name, description, trigger_type, recipient_type, template_id, conditions, is_active)
VALUES 
  ('Demo Booking Confirmation', 'Send confirmation to users who book demos', 'form_submission', 'user', 
   (SELECT id FROM email_templates WHERE name = 'Contact Form Auto-Response' LIMIT 1),
   '{"form_type": "demo_booking"}', true),
  ('Demo Booking Admin Alert', 'Notify admins of new demo bookings', 'form_submission', 'admin',
   (SELECT id FROM email_templates WHERE name = 'Contact Form Admin Alert' LIMIT 1), 
   '{"form_type": "demo_booking"}', true);

-- Add email templates for demo bookings using valid template_type values
INSERT INTO public.email_templates (name, subject, description, template_type, content, variables, is_active)
VALUES 
  ('Demo Booking Confirmation', 'Demo Scheduled - {{name}}', 'Confirmation email for demo bookings', 'contact_confirmation',
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
   
  ('Demo Booking Admin Notification', 'New Demo Request from {{name}} - {{company}}', 'Admin notification for demo bookings', 'contact_admin',
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