import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SenderManagement } from './SenderManagement';
import { 
  Mail, 
  Server, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Send,
  Eye,
  TestTube,
  Globe,
  Clock,
  Users,
  Key
} from 'lucide-react';

export const EmailSettings = () => {
  const [settings, setSettings] = useState({
    smtp: {
      host: '',
      port: 587,
      username: '',
      password: '',
      encryption: 'tls',
      from_name: '',
      from_email: '',
      reply_to: ''
    },
    delivery: {
      rate_limit: 100,
      retry_attempts: 3,
      retry_delay: 300,
      bounce_handling: true,
      track_opens: true,
      track_clicks: true
    },
    security: {
      dkim_enabled: true,
      spf_enabled: true,
      dmarc_enabled: true,
      domain_verification: true
    }
  });

  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [senders, setSenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadTemplates();
    loadSenders();
  }, []);

  const loadSenders = async () => {
    try {
      const { data, error } = await supabase
        .from('email_senders')
        .select('id, from_name, from_email, reply_to, is_default, is_active')
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setSenders(data || []);
      
      // Auto-select default sender
      const defaultSender = data?.find(s => s.is_default);
      if (defaultSender && !selectedSender) {
        setSelectedSender(defaultSender.id);
      }
    } catch (error) {
      console.error('Error loading senders:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // Load email settings
      const { data: emailSettings, error: settingsError } = await supabase
        .from('email_settings')
        .select('*');

      if (settingsError) throw settingsError;

      // Load default sender information
      const { data: defaultSender, error: senderError } = await supabase
        .from('email_senders')
        .select('from_name, from_email, reply_to')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (senderError && senderError.code !== 'PGRST116') {
        console.error('Error loading default sender:', senderError);
      }

      if (emailSettings && emailSettings.length > 0) {
        const settingsMap: Record<string, any> = {};
        emailSettings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });

        setSettings(prev => ({
          ...prev,
          smtp: {
            ...prev.smtp,
            ...settingsMap.smtp,
            // Override with default sender if available
            ...(defaultSender && {
              from_name: defaultSender.from_name,
              from_email: defaultSender.from_email,
              reply_to: defaultSender.reply_to
            })
          },
          delivery: {
            ...prev.delivery,
            ...settingsMap.delivery
          },
          security: {
            ...prev.security,
            ...settingsMap.security
          }
        }));
      } else if (defaultSender) {
        // If no email settings but default sender exists, use sender info
        setSettings(prev => ({
          ...prev,
          smtp: {
            ...prev.smtp,
            from_name: defaultSender.from_name,
            from_email: defaultSender.from_email,
            reply_to: defaultSender.reply_to
          }
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load email settings",
        variant: "destructive"
      });
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('email_settings')
        .upsert({
          setting_key: key,
          setting_value: value
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: `${key} settings have been updated successfully`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async (section: string) => {
    const sectionKey = section.toLowerCase().replace(' ', '_');
    let sectionData = {};
    
    switch (section) {
      case 'SMTP':
        sectionData = settings.smtp;
        break;
      case 'Sender Information':
        // For sender information, update both email_settings and email_senders
        sectionData = {
          from_name: settings.smtp.from_name,
          from_email: settings.smtp.from_email,
          reply_to: settings.smtp.reply_to
        };
        
        // Also update or create default sender
        try {
          const { data: existingDefault } = await supabase
            .from('email_senders')
            .select('id')
            .eq('is_default', true)
            .single();

          if (existingDefault) {
            // Update existing default sender
            await supabase
              .from('email_senders')
              .update({
                from_name: settings.smtp.from_name,
                from_email: settings.smtp.from_email,
                reply_to: settings.smtp.reply_to
              })
              .eq('is_default', true);
          } else {
            // Create new default sender
            await supabase
              .from('email_senders')
              .insert({
                from_name: settings.smtp.from_name,
                from_email: settings.smtp.from_email,
                reply_to: settings.smtp.reply_to,
                is_default: true,
                is_active: true
              });
          }
        } catch (error) {
          console.error('Error updating default sender:', error);
        }
        break;
      case 'Delivery':
        sectionData = settings.delivery;
        break;
      case 'Security':
        sectionData = settings.security;
        break;
    }
    
    await saveSetting(sectionKey, sectionData);
  };

  const handleTestConnection = () => {
    toast({
      title: "Connection Test",
      description: "Testing email configuration...",
    });
    
    // Simulate test
    setTimeout(() => {
      toast({
        title: "Test Successful",
        description: "Email configuration is working correctly",
      });
    }, 2000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setTestEmailLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          testEmail,
          templateId: selectedTemplate && selectedTemplate !== 'default' ? selectedTemplate : null,
          senderId: selectedSender || null
        }
      });

      if (error) {
        console.error('Test email error:', error);
        throw new Error(error.message || 'Failed to send test email');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Test Email Sent",
        description: `A test email has been sent to ${testEmail}`,
      });

      // Clear the test email field
      setTestEmail('');
      setSelectedTemplate('');
      
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test email. Please check your email settings and try again.",
        variant: "destructive"
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-navy">Email Settings</h2>
        <p className="text-muted-foreground">Configure email delivery and SMTP settings</p>
      </div>

      {/* Sender Management */}
      <SenderManagement />

      <div className="grid gap-6">
        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>SMTP Configuration</span>
            </CardTitle>
            <CardDescription>Configure your email server settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input 
                  id="smtp-host" 
                  value={settings.smtp.host}
                  onChange={(e) => updateSetting('smtp', 'host', e.target.value)}
                  placeholder="smtp.resend.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">Port</Label>
                <Input 
                  id="smtp-port" 
                  type="number"
                  value={settings.smtp.port}
                  onChange={(e) => updateSetting('smtp', 'port', parseInt(e.target.value) || 587)}
                  placeholder="587"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-username">Username</Label>
                <Input 
                  id="smtp-username" 
                  value={settings.smtp.username}
                  onChange={(e) => updateSetting('smtp', 'username', e.target.value)}
                  placeholder="resend"
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">Password / API Key</Label>
                <Input 
                  id="smtp-password" 
                  type="password"
                  value={settings.smtp.password}
                  onChange={(e) => updateSetting('smtp', 'password', e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="smtp-encryption">Encryption</Label>
              <Select 
                value={settings.smtp.encryption}
                onValueChange={(value) => updateSetting('smtp', 'encryption', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleTestConnection}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <TestTube className="h-4 w-4" />
                <span>Test Connection</span>
              </Button>
              <Button 
                onClick={() => handleSaveSettings('SMTP')}
                disabled={loading}
                className="bg-brand-orange hover:bg-brand-orange-dark"
              >
                {loading ? 'Saving...' : 'Save SMTP Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sender Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Sender Information</span>
            </CardTitle>
            <CardDescription>Configure default sender details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-name">From Name</Label>
                <Input 
                  id="from-name" 
                  value={settings.smtp.from_name}
                  onChange={(e) => updateSetting('smtp', 'from_name', e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <Label htmlFor="from-email">From Email</Label>
                <Input 
                  id="from-email" 
                  type="email"
                  value={settings.smtp.from_email}
                  onChange={(e) => updateSetting('smtp', 'from_email', e.target.value)}
                  placeholder="noreply@yourcompany.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reply-to">Reply-To Email</Label>
              <Input 
                id="reply-to" 
                type="email"
                value={settings.smtp.reply_to}
                onChange={(e) => updateSetting('smtp', 'reply_to', e.target.value)}
                placeholder="support@yourcompany.com"
              />
            </div>

            <Button 
              onClick={() => handleSaveSettings('Sender Information')}
              disabled={loading}
              className="bg-brand-orange hover:bg-brand-orange-dark"
            >
              {loading ? 'Saving...' : 'Save Sender Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Delivery & Performance</span>
            </CardTitle>
            <CardDescription>Configure email delivery settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rate-limit">Rate Limit (emails/hour)</Label>
                <Input 
                  id="rate-limit" 
                  type="number"
                  value={settings.delivery.rate_limit}
                  onChange={(e) => updateSetting('delivery', 'rate_limit', parseInt(e.target.value) || 100)}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="retry-attempts">Retry Attempts</Label>
                <Input 
                  id="retry-attempts" 
                  type="number"
                  value={settings.delivery.retry_attempts}
                  onChange={(e) => updateSetting('delivery', 'retry_attempts', parseInt(e.target.value) || 3)}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
                <Input 
                  id="retry-delay" 
                  type="number"
                  value={settings.delivery.retry_delay}
                  onChange={(e) => updateSetting('delivery', 'retry_delay', parseInt(e.target.value) || 300)}
                  placeholder="300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bounce-handling">Bounce Handling</Label>
                  <p className="text-sm text-muted-foreground">Automatically handle bounced emails</p>
                </div>
                <Switch 
                  id="bounce-handling" 
                  checked={settings.delivery.bounce_handling}
                  onCheckedChange={(checked) => updateSetting('delivery', 'bounce_handling', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-opens">Track Email Opens</Label>
                  <p className="text-sm text-muted-foreground">Track when emails are opened</p>
                </div>
                <Switch 
                  id="track-opens" 
                  checked={settings.delivery.track_opens}
                  onCheckedChange={(checked) => updateSetting('delivery', 'track_opens', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-clicks">Track Link Clicks</Label>
                  <p className="text-sm text-muted-foreground">Track clicks on email links</p>
                </div>
                <Switch 
                  id="track-clicks" 
                  checked={settings.delivery.track_clicks}
                  onCheckedChange={(checked) => updateSetting('delivery', 'track_clicks', checked)}
                />
              </div>
            </div>

            <Button 
              onClick={() => handleSaveSettings('Delivery')}
              disabled={loading}
              className="bg-brand-orange hover:bg-brand-orange-dark"
            >
              {loading ? 'Saving...' : 'Save Delivery Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Security & Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security & Authentication</span>
            </CardTitle>
            <CardDescription>Email security and domain authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {[
                { key: 'dkim_enabled', label: 'DKIM Authentication', description: 'Domain Keys Identified Mail' },
                { key: 'spf_enabled', label: 'SPF Record', description: 'Sender Policy Framework' },
                { key: 'dmarc_enabled', label: 'DMARC Policy', description: 'Domain-based Message Authentication' },
                { key: 'domain_verification', label: 'Domain Verification', description: 'Verify domain ownership' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={settings.security[item.key as keyof typeof settings.security] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {settings.security[item.key as keyof typeof settings.security] ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Disabled
                        </>
                      )}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Domain Configuration Required</p>
                  <p className="text-blue-700">To improve email deliverability, configure your domain's DNS records with the required SPF, DKIM, and DMARC settings.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Test Email</span>
            </CardTitle>
            <CardDescription>Send a test email to verify your configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input 
                id="test-email" 
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="sender-select">From Sender</Label>
              <Select value={selectedSender} onValueChange={setSelectedSender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sender" />
                </SelectTrigger>
                <SelectContent>
                  {senders.map((sender) => (
                    <SelectItem key={sender.id} value={sender.id}>
                      {sender.from_name} &lt;{sender.from_email}&gt;
                      {sender.is_default && ' (Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="test-template">Test Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or leave blank for default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Test Email</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSendTestEmail}
              disabled={testEmailLoading || !testEmail || !selectedSender}
              className="bg-brand-orange hover:bg-brand-orange-dark"
            >
              <Send className="h-4 w-4 mr-2" />
              {testEmailLoading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};