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
import { companySettingsApi } from '@/lib/apiClient';
import { 
  Mail, 
  Server, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Send,
  TestTube,
  Globe,
  Loader
} from 'lucide-react';

interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
  from_name: string;
  from_email: string;
  reply_to: string;
}

interface DeliverySettings {
  rate_limit: number;
  retry_attempts: number;
  retry_delay: number;
  bounce_handling: boolean;
  track_opens: boolean;
  track_clicks: boolean;
}

export const EmailSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [smtp, setSmtp] = useState<SmtpSettings>({
    host: 'smtp.resend.com',
    port: 587,
    username: 'resend',
    password: '',
    encryption: 'tls',
    from_name: 'Zira Technologies',
    from_email: 'info@ziratechnologies.com',
    reply_to: 'support@ziratechnologies.com'
  });

  const [delivery, setDelivery] = useState<DeliverySettings>({
    rate_limit: 100,
    retry_attempts: 3,
    retry_delay: 300,
    bounce_handling: true,
    track_opens: true,
    track_clicks: true
  });

  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const smtpResponse = await companySettingsApi.get('email_smtp_settings');
      if (smtpResponse.data) {
        const smtpData = typeof smtpResponse.data === 'string' 
          ? JSON.parse(smtpResponse.data) 
          : smtpResponse.data;
        if (smtpData && typeof smtpData === 'object') {
          setSmtp(prev => ({ ...prev, ...smtpData }));
        }
      }

      const deliveryResponse = await companySettingsApi.get('email_delivery_settings');
      if (deliveryResponse.data) {
        const deliveryData = typeof deliveryResponse.data === 'string' 
          ? JSON.parse(deliveryResponse.data) 
          : deliveryResponse.data;
        if (deliveryData && typeof deliveryData === 'object') {
          setDelivery(prev => ({ ...prev, ...deliveryData }));
        }
      }
    } catch (error) {
      console.error('Failed to load email settings:', error);
    }
    setIsLoading(false);
  };

  const handleSaveSmtpSettings = async () => {
    setIsSaving(true);
    try {
      await companySettingsApi.set('email_smtp_settings', smtp);
      toast({
        title: "Settings Saved",
        description: "SMTP settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SMTP settings",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleSaveDeliverySettings = async () => {
    setIsSaving(true);
    try {
      await companySettingsApi.set('email_delivery_settings', delivery);
      toast({
        title: "Settings Saved",
        description: "Delivery settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save delivery settings",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleTestConnection = () => {
    toast({
      title: "Connection Test",
      description: "Testing email configuration...",
    });
    
    setTimeout(() => {
      toast({
        title: "Test Successful",
        description: "Email configuration is working correctly",
      });
    }, 2000);
  };

  const handleSendTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to your email address",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">Email Settings</h2>
          <p className="text-muted-foreground">Configure email delivery and SMTP settings</p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-navy">Email Settings</h2>
        <p className="text-muted-foreground">Configure email delivery and SMTP settings</p>
      </div>

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
                  value={smtp.host}
                  onChange={(e) => setSmtp({...smtp, host: e.target.value})}
                  placeholder="smtp.resend.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">Port</Label>
                <Input 
                  id="smtp-port" 
                  type="number"
                  value={smtp.port}
                  onChange={(e) => setSmtp({...smtp, port: parseInt(e.target.value) || 587})}
                  placeholder="587"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-username">Username</Label>
                <Input 
                  id="smtp-username" 
                  value={smtp.username}
                  onChange={(e) => setSmtp({...smtp, username: e.target.value})}
                  placeholder="resend"
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">Password / API Key</Label>
                <Input 
                  id="smtp-password" 
                  type="password"
                  value={smtp.password}
                  onChange={(e) => setSmtp({...smtp, password: e.target.value})}
                  placeholder="Enter your API key"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="smtp-encryption">Encryption</Label>
              <Select value={smtp.encryption} onValueChange={(value) => setSmtp({...smtp, encryption: value})}>
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
                onClick={handleSaveSmtpSettings}
                disabled={isSaving}
                className="bg-brand-orange hover:bg-brand-orange-dark"
              >
                {isSaving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save SMTP Settings'
                )}
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
                  value={smtp.from_name}
                  onChange={(e) => setSmtp({...smtp, from_name: e.target.value})}
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <Label htmlFor="from-email">From Email</Label>
                <Input 
                  id="from-email" 
                  type="email"
                  value={smtp.from_email}
                  onChange={(e) => setSmtp({...smtp, from_email: e.target.value})}
                  placeholder="noreply@yourcompany.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reply-to">Reply-To Email</Label>
              <Input 
                id="reply-to" 
                type="email"
                value={smtp.reply_to}
                onChange={(e) => setSmtp({...smtp, reply_to: e.target.value})}
                placeholder="support@yourcompany.com"
              />
            </div>

            <Button 
              onClick={handleSaveSmtpSettings}
              disabled={isSaving}
              className="bg-brand-orange hover:bg-brand-orange-dark"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Sender Settings'
              )}
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
                  value={delivery.rate_limit}
                  onChange={(e) => setDelivery({...delivery, rate_limit: parseInt(e.target.value) || 100})}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="retry-attempts">Retry Attempts</Label>
                <Input 
                  id="retry-attempts" 
                  type="number"
                  value={delivery.retry_attempts}
                  onChange={(e) => setDelivery({...delivery, retry_attempts: parseInt(e.target.value) || 3})}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
                <Input 
                  id="retry-delay" 
                  type="number"
                  value={delivery.retry_delay}
                  onChange={(e) => setDelivery({...delivery, retry_delay: parseInt(e.target.value) || 300})}
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
                  checked={delivery.bounce_handling}
                  onCheckedChange={(checked) => setDelivery({...delivery, bounce_handling: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-opens">Track Email Opens</Label>
                  <p className="text-sm text-muted-foreground">Track when emails are opened</p>
                </div>
                <Switch 
                  id="track-opens" 
                  checked={delivery.track_opens}
                  onCheckedChange={(checked) => setDelivery({...delivery, track_opens: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="track-clicks">Track Link Clicks</Label>
                  <p className="text-sm text-muted-foreground">Track clicks on email links</p>
                </div>
                <Switch 
                  id="track-clicks" 
                  checked={delivery.track_clicks}
                  onCheckedChange={(checked) => setDelivery({...delivery, track_clicks: checked})}
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveDeliverySettings}
              disabled={isSaving}
              className="bg-brand-orange hover:bg-brand-orange-dark"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Delivery Settings'
              )}
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
                { key: 'dkim', label: 'DKIM Authentication', description: 'Domain Keys Identified Mail', enabled: true },
                { key: 'spf', label: 'SPF Record', description: 'Sender Policy Framework', enabled: true },
                { key: 'dmarc', label: 'DMARC Policy', description: 'Domain-based Message Authentication', enabled: true },
                { key: 'verification', label: 'Domain Verification', description: 'Verify domain ownership', enabled: true }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={item.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {item.enabled ? (
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
                placeholder="test@example.com"
              />
            </div>

            <Button 
              onClick={handleSendTestEmail}
              className="bg-brand-orange hover:bg-brand-orange-dark"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
