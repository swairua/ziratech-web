-- Update email templates with improved admin content and variables
UPDATE email_templates 
SET 
  content = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Gradient -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">New Contact Inquiry</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Someone is interested in Zira Technologies</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
            <div style="background-color: #f1f5f9; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                    📧 New inquiry from {{name}} ({{email}})
                </p>
            </div>

            {{all_fields}}

            <!-- Quick Actions -->
            <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Quick Actions</h3>
                <div style="display: inline-block; margin: 0 10px;">
                    <a href="mailto:{{email}}?subject=Re: Your inquiry to Zira Technologies&body=Hi {{name}},%0D%0A%0D%0AThank you for your interest in Zira Technologies. " 
                       style="background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        📧 Reply to {{name}}
                    </a>
                </div>
                <div style="display: inline-block; margin: 0 10px;">
                    <a href="tel:{{phone}}" 
                       style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        📞 Call {{phone}}
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Sent via Zira Technologies Contact System
                </p>
            </div>
        </div>
    </div>
</body>
</html>',
  variables = ARRAY['name', 'email', 'phone', 'company', 'message', 'service_interest', 'website_type', 'budget_range', 'timeline', 'features_needed', 'business_type', 'monthly_volume', 'device_type', 'volume', 'use_case', 'role', 'number_of_units', 'country', 'all_fields']
WHERE name = 'contact_admin' AND template_type = 'contact';

-- Update contact confirmation template
UPDATE email_templates 
SET 
  content = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank you for contacting Zira Technologies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Gradient -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Thank You, {{name}}!</h1>
            <p style="color: #f97316; margin: 15px 0 0 0; font-size: 18px; font-weight: 600;">Your inquiry has been received</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">We''ll be in touch within 6 hours</h2>
                <p style="margin: 0; font-size: 16px; opacity: 0.9;">Our team is excited to help you transform your business</p>
            </div>

            <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">Your Inquiry Summary</h3>
                <div style="color: #475569; line-height: 1.6;">
                    <p style="margin: 5px 0;"><strong>Name:</strong> {{name}}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
                    {{#if phone}}<p style="margin: 5px 0;"><strong>Phone:</strong> {{phone}}</p>{{/if}}
                    {{#if service_interest}}<p style="margin: 5px 0;"><strong>Service Interest:</strong> {{service_interest}}</p>{{/if}}
                    {{#if message}}<p style="margin: 15px 0 5px 0;"><strong>Your Message:</strong></p>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316;">
                        {{message}}
                    </div>{{/if}}
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #1e293b; margin: 0 0 20px 0;">What Happens Next?</h3>
                <div style="display: inline-block; text-align: left; max-width: 400px;">
                    <div style="margin: 10px 0; color: #475569;">✅ Our expert team reviews your requirements</div>
                    <div style="margin: 10px 0; color: #475569;">✅ We prepare a customized solution proposal</div>
                    <div style="margin: 10px 0; color: #475569;">✅ You receive a detailed response within 6 hours</div>
                    <div style="margin: 10px 0; color: #475569;">✅ We schedule a consultation to discuss next steps</div>
                </div>
            </div>

            <!-- Contact Info -->
            <div style="background-color: #1e293b; color: #ffffff; padding: 25px; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #f97316;">Need Immediate Assistance?</h3>
                <p style="margin: 5px 0; color: #e2e8f0;">📧 Email: info@ziratech.com</p>
                <p style="margin: 5px 0; color: #e2e8f0;">📱 WhatsApp: +254 757878023</p>
                <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 14px;">We''re here to help you succeed</p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Zira Technologies - Building the Future of African Tech<br>
                    <a href="https://ziratech.com" style="color: #f97316; text-decoration: none;">ziratech.com</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>',
  variables = ARRAY['name', 'email', 'phone', 'company', 'message', 'service_interest']
WHERE name = 'contact_confirmation' AND template_type = 'contact';

-- Update career application admin template
UPDATE email_templates 
SET 
  content = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Career Application</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Gradient -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">New Career Application</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Someone wants to join the Zira Technologies team</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
            <div style="background-color: #f1f5f9; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                    💼 New application from {{name}} ({{email}})
                </p>
                {{#if position}}<p style="margin: 5px 0 0 0; color: #475569;">Position: {{position}}</p>{{/if}}
            </div>

            {{all_fields}}

            <!-- Quick Actions -->
            <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Quick Actions</h3>
                <div style="display: inline-block; margin: 0 10px;">
                    <a href="mailto:{{email}}?subject=Re: Your application to Zira Technologies&body=Hi {{name}},%0D%0A%0D%0AThank you for your interest in joining Zira Technologies. " 
                       style="background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        📧 Reply to {{name}}
                    </a>
                </div>
                <div style="display: inline-block; margin: 0 10px;">
                    <a href="tel:{{phone}}" 
                       style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        📞 Call {{phone}}
                    </a>
                </div>
                {{#if cv_file_url}}
                <div style="display: inline-block; margin: 0 10px;">
                    <a href="{{cv_file_url}}" 
                       style="background-color: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        📄 View CV/Resume
                    </a>
                </div>
                {{/if}}
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Sent via Zira Technologies Career Portal
                </p>
            </div>
        </div>
    </div>
</body>
</html>',
  variables = ARRAY['name', 'email', 'phone', 'company', 'message', 'position', 'cv_file_url', 'all_fields']
WHERE name = 'career_admin' AND template_type = 'career_application';

-- Update career confirmation template
UPDATE email_templates 
SET 
  content = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received - Zira Technologies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header with Gradient -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Thank You, {{name}}!</h1>
            <p style="color: #f97316; margin: 15px 0 0 0; font-size: 18px; font-weight: 600;">Your application has been received</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">We''re reviewing your application</h2>
                <p style="margin: 0; font-size: 16px; opacity: 0.9;">Our HR team will be in touch within 3-5 business days</p>
            </div>

            <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">Application Summary</h3>
                <div style="color: #475569; line-height: 1.6;">
                    <p style="margin: 5px 0;"><strong>Name:</strong> {{name}}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> {{email}}</p>
                    {{#if phone}}<p style="margin: 5px 0;"><strong>Phone:</strong> {{phone}}</p>{{/if}}
                    {{#if position}}<p style="margin: 5px 0;"><strong>Position Applied:</strong> {{position}}</p>{{/if}}
                    {{#if message}}<p style="margin: 15px 0 5px 0;"><strong>Your Message:</strong></p>
                    <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316;">
                        {{message}}
                    </div>{{/if}}
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #1e293b; margin: 0 0 20px 0;">What Happens Next?</h3>
                <div style="display: inline-block; text-align: left; max-width: 400px;">
                    <div style="margin: 10px 0; color: #475569;">✅ Our HR team reviews your application</div>
                    <div style="margin: 10px 0; color: #475569;">✅ We assess your fit for the role</div>
                    <div style="margin: 10px 0; color: #475569;">✅ Qualified candidates are contacted for interviews</div>
                    <div style="margin: 10px 0; color: #475569;">✅ We''ll update you on the status within 5 days</div>
                </div>
            </div>

            <!-- Contact Info -->
            <div style="background-color: #1e293b; color: #ffffff; padding: 25px; border-radius: 8px; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #f97316;">Questions About Your Application?</h3>
                <p style="margin: 5px 0; color: #e2e8f0;">📧 Email: careers@ziratech.com</p>
                <p style="margin: 5px 0; color: #e2e8f0;">📱 WhatsApp: +254 757878023</p>
                <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 14px;">We''re excited to learn more about you</p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Zira Technologies - Building the Future of African Tech<br>
                    <a href="https://ziratech.com/careers" style="color: #f97316; text-decoration: none;">View Open Positions</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>',
  variables = ARRAY['name', 'email', 'phone', 'company', 'message', 'position']
WHERE name = 'career_confirmation' AND template_type = 'career_application';