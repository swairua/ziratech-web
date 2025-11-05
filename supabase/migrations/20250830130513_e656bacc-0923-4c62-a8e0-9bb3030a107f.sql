-- Update Career Application Confirmation template with branded design
UPDATE email_templates 
SET content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #0A0E27 0%, #1A1B3E 100%); }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px; }
    .content { padding: 40px 30px; }
    .application-recap { background: #F8FAFC; border-left: 4px solid #6366F1; padding: 24px; margin: 24px 0; border-radius: 8px; }
    .recap-title { font-weight: 600; color: #374151; margin-bottom: 16px; font-size: 16px; }
    .recap-item { margin: 8px 0; color: #6B7280; font-size: 14px; }
    .recap-value { color: #111827; font-weight: 500; }
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
      <h1>🎉 Thank you, {{name}}!</h1>
      <p>Your application for {{position}} has been received</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #111827; line-height: 1.6;">
        We appreciate your interest in joining <strong>Zira Technologies</strong>. Our HR team has received your application and we''ll review it carefully.
      </p>
      
      <div class="application-recap">
        <div class="recap-title">📋 Application Summary:</div>
        <div class="recap-item">Position: <span class="recap-value">{{position}}</span></div>
        <div class="recap-item">Email: <span class="recap-value">{{email}}</span></div>
        <div class="recap-item">Phone: <span class="recap-value">{{phone}}</span></div>
      </div>
      
      <div class="next-steps">
        <h3>🚀 What happens next?</h3>
        <p><strong>1.</strong> Our HR team will review your application and CV</p>
        <p><strong>2.</strong> We''ll contact qualified candidates within 5-7 business days</p>
        <p><strong>3.</strong> If selected, we''ll schedule an interview to discuss the role</p>
      </div>
      
      <div class="cta">
        <a href="https://zira-tech.com/careers" class="btn">🔍 View Open Positions</a>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        <strong>Questions about your application?</strong><br>
        Feel free to reach out at <strong>hr@ziratech.com</strong> or call <strong>+254 757 878 023</strong>
      </p>
    </div>
    
    <div class="footer">
      <h4>Zira Technologies</h4>
      <p>Building Tomorrow''s Solutions Today</p>
      <p>📧 support@ziratech.com | 📞 +254 757 878 023</p>
      <div class="social-links">
        <a href="https://zira-tech.com">Website</a>
        <a href="https://zira-tech.com/portfolio">Portfolio</a>
        <a href="https://zira-tech.com/careers">Careers</a>
      </div>
      <p style="margin-top: 20px; font-size: 11px;">
        This confirmation was sent from our career application system
      </p>
    </div>
  </div>
</body>
</html>',
    updated_at = now()
WHERE name = 'Career Application Confirmation';

-- Update Career Application Admin Notification template with branded design and {{all_fields}}
UPDATE email_templates 
SET content = '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Career Application</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #0A0E27 0%, #1A1B3E 100%); }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; }
    .content { padding: 30px; }
    .application-details { background: #F8FAFC; border-left: 4px solid #6366F1; padding: 20px; margin: 20px 0; border-radius: 8px; }
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
      <h1>👤 New Career Application</h1>
      <p>A candidate has applied for the {{position}} position</p>
    </div>
    
    <div class="content">
      <div class="application-details">
        <div class="detail-row">
          <span class="detail-label">Position:</span>
          <span class="detail-value">{{position}}</span>
        </div>
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
      </div>
      
      <div class="message-section">
        <div class="message-label">📝 Cover Letter/Message:</div>
        <div class="message-content">{{message}}</div>
      </div>
      
      {{all_fields}}
      
      <div class="actions">
        <a href="mailto:{{email}}?subject=Re: Your application for {{position}}" class="btn btn-primary">📧 Email Candidate</a>
        <a href="tel:{{phone}}" class="btn btn-secondary">📞 Call Now</a>
      </div>
      
      <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
        💡 <strong>Quick tip:</strong> Review applications promptly for the best candidate experience!
      </p>
    </div>
    
    <div class="footer">
      <p>Zira Technologies | Building Tomorrow''s Solutions Today</p>
      <p>This notification was sent from your career application system</p>
    </div>
  </div>
</body>
</html>',
    updated_at = now()
WHERE name = 'Career Application Admin Notification';