-- Update Contact Form Admin Notification template with branded design and complete form details
UPDATE email_templates 
SET 
  subject = 'New inquiry from {{name}} - {{company}}',
  content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Inquiry</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #0A0E27 0%, #1A1B3E 100%); }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; }
    .content { padding: 30px; }
    .inquiry-details { background: #F8FAFC; border-left: 4px solid #6366F1; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .detail-row { margin: 12px 0; }
    .detail-label { font-weight: 600; color: #374151; display: inline-block; width: 80px; }
    .detail-value { color: #111827; }
    .message-section { background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .message-label { font-weight: 600; color: #374151; margin-bottom: 10px; }
    .message-content { color: #111827; line-height: 1.6; white-space: pre-wrap; }
    .actions { background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; margin: 0 8px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; }
    .btn-primary { background: #6366F1; color: #ffffff; }
    .btn-secondary { background: #ffffff; color: #6366F1; border: 1px solid #6366F1; }
    .footer { background: #F3F4F6; padding: 20px; text-align: center; color: #6B7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 New Contact Inquiry</h1>
      <p>A potential client has reached out through your website</p>
    </div>
    
    <div class="content">
      <div class="inquiry-details">
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">{{name}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{email}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">{{phone}}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Company:</span>
          <span class="detail-value">{{company}}</span>
        </div>
      </div>
      
      <div class="message-section">
        <div class="message-label">📝 Message:</div>
        <div class="message-content">{{message}}</div>
      </div>
      
      <div class="actions">
        <a href="mailto:{{email}}?subject=Re: Your inquiry" class="btn btn-primary">📧 Reply to {{name}}</a>
        <a href="tel:{{phone}}" class="btn btn-secondary">📞 Call Now</a>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
        💡 <strong>Quick tip:</strong> Respond within 1 hour for the best conversion rates!
      </p>
    </div>
    
    <div class="footer">
      <p>Zira Technologies | Building Tomorrow''s Solutions Today</p>
      <p>This notification was sent from your contact form system</p>
    </div>
  </div>
</body>
</html>',
  variables = ARRAY['name', 'email', 'phone', 'company', 'message'],
  updated_at = now()
WHERE template_type = 'contact_admin';

-- Update Contact Form Confirmation template with branded design and form recap
UPDATE email_templates 
SET 
  subject = 'Thanks {{name}} — we''ve received your message',
  content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #0A0E27 0%, #1A1B3E 100%); }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px; }
    .content { padding: 40px 30px; }
    .message-recap { background: #F8FAFC; border-left: 4px solid #6366F1; padding: 24px; margin: 24px 0; border-radius: 8px; }
    .recap-title { font-weight: 600; color: #374151; margin-bottom: 16px; font-size: 16px; }
    .recap-item { margin: 8px 0; color: #6B7280; font-size: 14px; }
    .recap-value { color: #111827; font-weight: 500; }
    .message-text { background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .message-content { color: #111827; line-height: 1.6; white-space: pre-wrap; font-style: italic; }
    .next-steps { background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); padding: 24px; border-radius: 8px; margin: 24px 0; }
    .next-steps h3 { color: #0369A1; margin: 0 0 12px 0; font-size: 18px; }
    .next-steps p { color: #0F172A; margin: 8px 0; line-height: 1.6; }
    .cta { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 14px 28px; background: #6366F1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; }
    .footer { background: #F3F4F6; padding: 30px; text-align: center; }
    .footer h4 { color: #374151; margin: 0 0 16px 0; font-size: 18px; }
    .footer p { color: #6B7280; margin: 6px 0; font-size: 14px; }
    .social-links { margin: 20px 0; }
    .social-links a { color: #6366F1; text-decoration: none; margin: 0 12px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Thank you, {{name}}!</h1>
      <p>Your message has been received and we''re excited to connect</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #111827; line-height: 1.6;">
        We appreciate you reaching out to <strong>Zira Technologies</strong>. Our team has received your inquiry and we''ll get back to you within <strong>24 hours</strong> with next steps.
      </p>
      
      <div class="message-recap">
        <div class="recap-title">📋 Here''s what you submitted:</div>
        <div class="recap-item">Email: <span class="recap-value">{{email}}</span></div>
        <div class="recap-item">Company: <span class="recap-value">{{company}}</span></div>
        <div class="recap-item">Phone: <span class="recap-value">{{phone}}</span></div>
      </div>
      
      <div class="message-text">
        <div style="font-weight: 600; color: #374151; margin-bottom: 12px;">Your message:</div>
        <div class="message-content">{{message}}</div>
      </div>
      
      <div class="next-steps">
        <h3>🚀 What happens next?</h3>
        <p><strong>1.</strong> Our team will review your inquiry and match you with the right specialist</p>
        <p><strong>2.</strong> We''ll reach out via email or phone within 24 hours</p>
        <p><strong>3.</strong> We''ll schedule a consultation to discuss your project in detail</p>
      </div>
      
      <div class="cta">
        <a href="https://ziratech.com/portfolio" class="btn">🔍 Explore Our Work</a>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        <strong>Have an urgent request?</strong><br>
        Feel free to call us directly at <strong>+254 723 301 507</strong> or email <strong>support@ziratech.com</strong>
      </p>
    </div>
    
    <div class="footer">
      <h4>🌟 Zira Technologies</h4>
      <p>Building Tomorrow''s Solutions Today</p>
      <p>Web Development • Mobile Apps • Cloud Solutions • IoT Systems</p>
      
      <div class="social-links">
        <a href="https://linkedin.com/company/ziratech">LinkedIn</a>
        <a href="https://github.com/ziratech">GitHub</a>
        <a href="https://ziratech.com">Website</a>
      </div>
      
      <p style="margin-top: 20px; font-size: 12px;">
        📧 support@ziratech.com | 📞 +254 723 301 507<br>
        Nairobi, Kenya | Building innovative solutions across Africa
      </p>
    </div>
  </div>
</body>
</html>',
  variables = ARRAY['name', 'email', 'company', 'phone', 'message'],
  updated_at = now()
WHERE template_type = 'contact_confirmation';