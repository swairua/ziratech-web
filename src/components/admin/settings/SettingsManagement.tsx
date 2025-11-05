import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Key,
  Users,
  Mail,
  Smartphone,
  Bell,
  Lock,
  Eye,
  Download,
  Upload,
  Save,
  AlertTriangle
} from 'lucide-react';

export const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: ''
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    publicRegistration: true
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: true,
    sessionTimeout: true,
    sessionDuration: 60,
    minPasswordLength: 8,
    requireSpecialChars: true
  });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#FF6B00',
    secondaryColor: '#1B2B3C',
    darkModeDefault: false
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    newFormSubmissions: true,
    newUserRegistrations: true,
    systemAlerts: true
  });

  // Admin Recipients State
  const [adminRecipients, setAdminRecipients] = useState('');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: adminCheck } = await supabase.rpc('is_admin', { user_uuid: user.id });
      setIsAdmin(adminCheck || false);

      if (!adminCheck) {
        setLoading(false);
        return;
      }

      // Load all settings from company_settings table (get most recent for each key)
      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('setting_key, setting_value')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive"
        });
        return;
      }

      // Parse and set settings (handle duplicates by using most recent)
      const processedKeys = new Set<string>();
      settings?.forEach(setting => {
        // Skip if we've already processed this key (keep most recent due to ordering)
        if (processedKeys.has(setting.setting_key)) {
          return;
        }
        processedKeys.add(setting.setting_key);
        
        const value = setting.setting_value;
        switch (setting.setting_key) {
          case 'company_info':
            if (value && typeof value === 'object') {
              setCompanyInfo(value as typeof companyInfo);
            }
            break;
          case 'system_settings':
            if (value && typeof value === 'object') {
              setSystemSettings(value as typeof systemSettings);
            }
            break;
          case 'security_settings':
            if (value && typeof value === 'object') {
              setSecuritySettings(value as typeof securitySettings);
            }
            break;
          case 'appearance_settings':
            if (value && typeof value === 'object') {
              setAppearanceSettings(value as typeof appearanceSettings);
            }
            break;
          case 'notification_settings':
            if (value && typeof value === 'object') {
              setNotificationSettings(value as typeof notificationSettings);
            }
            break;
          case 'admin_recipients':
            if (value && typeof value === 'object' && 'emails' in value) {
              setAdminRecipients((value as { emails: string }).emails || '');
            }
            break;
        }
      });

    } catch (error) {
      console.error('Error in loadSettings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingKey: string, settingValue: any, sectionName: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to modify settings",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(settingKey);
      
      const { error } = await supabase
        .from('company_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: settingValue
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings Saved",
        description: `${sectionName} settings have been updated successfully`,
      });

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: `Failed to save ${sectionName} settings`,
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">You don't have permission to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-navy">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic information about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="company-name" 
                      value={companyInfo.name} 
                      onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                      placeholder="Zira Technologies"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Contact Email</Label>
                    <Input 
                      id="company-email" 
                      type="email"
                      value={companyInfo.email} 
                      onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                      placeholder="info@ziratechnologies.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-phone">Phone Number</Label>
                    <Input 
                      id="company-phone" 
                      value={companyInfo.phone} 
                      onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-website">Website</Label>
                    <Input 
                      id="company-website" 
                      type="url"
                      value={companyInfo.website} 
                      onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                      placeholder="https://ziratechnologies.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-address">Address</Label>
                  <Textarea 
                    id="company-address" 
                    value={companyInfo.address} 
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    placeholder="123 Innovation Drive, Tech City, TC 12345"
                  />
                </div>
                <Button 
                  onClick={() => saveSettings('company_info', companyInfo, 'Company Information')} 
                  disabled={saving === 'company_info'}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'company_info' ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Core application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                  </div>
                  <Switch 
                    id="maintenance-mode" 
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
                  </div>
                  <Switch 
                    id="debug-mode" 
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, debugMode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-registration">Public Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow public user registration</p>
                  </div>
                  <Switch 
                    id="public-registration" 
                    checked={systemSettings.publicRegistration}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, publicRegistration: checked})}
                  />
                </div>
                <Button 
                  onClick={() => saveSettings('system_settings', systemSettings, 'System Settings')} 
                  disabled={saving === 'system_settings'}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'system_settings' ? 'Saving...' : 'Save System Settings'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Configure user authentication and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={securitySettings.twoFactor}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactor: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout">Auto Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <Switch 
                    id="session-timeout" 
                    checked={securitySettings.sessionTimeout}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, sessionTimeout: checked})}
                  />
                </div>
                <div>
                  <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                  <Input 
                    id="session-duration" 
                    type="number" 
                    value={securitySettings.sessionDuration} 
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionDuration: parseInt(e.target.value) || 60})}
                    className="w-32" 
                  />
                </div>
                <div>
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="min-length">Minimum Length</Label>
                      <Input 
                        id="min-length" 
                        type="number" 
                        value={securitySettings.minPasswordLength} 
                        onChange={(e) => setSecuritySettings({...securitySettings, minPasswordLength: parseInt(e.target.value) || 8})}
                        className="w-24" 
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="require-special" 
                        checked={securitySettings.requireSpecialChars}
                        onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireSpecialChars: checked})}
                      />
                      <Label htmlFor="require-special">Require Special Characters</Label>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => saveSettings('security_settings', securitySettings, 'Security')} 
                  disabled={saving === 'security_settings'}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'security_settings' ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Keys & Tokens</CardTitle>
                <CardDescription>Manage external service integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Resend API Key</div>
                      <div className="text-sm text-muted-foreground">For email delivery</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Configured</Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">OpenAI API Key</div>
                      <div className="text-sm text-muted-foreground">For AI features</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gray-100 text-gray-800">Not Set</Badge>
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the look and feel of your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: appearanceSettings.primaryColor }}></div>
                    <Input 
                      id="primary-color" 
                      value={appearanceSettings.primaryColor} 
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, primaryColor: e.target.value})}
                      className="w-32" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: appearanceSettings.secondaryColor }}></div>
                    <Input 
                      id="secondary-color" 
                      value={appearanceSettings.secondaryColor} 
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, secondaryColor: e.target.value})}
                      className="w-32" 
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode Default</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode by default</p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={appearanceSettings.darkModeDefault}
                    onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, darkModeDefault: checked})}
                  />
                </div>
                <Button 
                  onClick={() => saveSettings('appearance_settings', appearanceSettings, 'Appearance')} 
                  disabled={saving === 'appearance_settings'}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'appearance_settings' ? 'Saving...' : 'Save Theme Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo & Branding</CardTitle>
                <CardDescription>Upload and manage your brand assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <img 
                      src="/lovable-uploads/9489ec23-8de1-485a-8132-7c13ceed629b.png" 
                      alt="Current Logo" 
                      className="h-12 w-12 rounded border"
                    />
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Logo
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="mt-2">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Favicon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
                <CardDescription>Connect with external services and APIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { name: 'Google Analytics', status: 'Connected', icon: Globe },
                    { name: 'Stripe Payments', status: 'Not Connected', icon: Key },
                    { name: 'Slack Notifications', status: 'Connected', icon: Bell },
                    { name: 'Zapier Webhooks', status: 'Not Connected', icon: Database }
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <integration.icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Status: <Badge className={integration.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {integration.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure when to send email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-form-submissions">New Form Submissions</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new forms are submitted</p>
                  </div>
                  <Switch 
                    id="new-form-submissions" 
                    checked={notificationSettings.newFormSubmissions}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newFormSubmissions: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-user-registration">New User Registrations</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                  </div>
                  <Switch 
                    id="new-user-registration" 
                    checked={notificationSettings.newUserRegistrations}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newUserRegistrations: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-alerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about system issues</p>
                  </div>
                  <Switch 
                    id="system-alerts" 
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                  />
                </div>
                <Button 
                  onClick={() => saveSettings('notification_settings', notificationSettings, 'Notifications')} 
                  disabled={saving === 'notification_settings'}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'notification_settings' ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Alert Recipients</CardTitle>
                <CardDescription>Manage who receives admin notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="admin-emails">Admin Email Addresses</Label>
                  <Textarea 
                    id="admin-emails" 
                    value={adminRecipients}
                    onChange={(e) => setAdminRecipients(e.target.value)}
                    placeholder="admin@ziratechnologies.com&#10;support@ziratechnologies.com"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">One email address per line</p>
                </div>
                <Button 
                  onClick={() => saveSettings('admin_recipients', { emails: adminRecipients }, 'Admin Recipients')} 
                  disabled={saving === 'admin_recipients'}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === 'admin_recipients' ? 'Saving...' : 'Save Admin Recipients'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Backup</CardTitle>
                <CardDescription>Manage your database backups and exports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Enable daily automated backups</p>
                  </div>
                  <Switch id="auto-backup" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                  <Input id="backup-retention" type="number" defaultValue="30" className="w-32 mt-2" />
                </div>
                <div className="flex space-x-3">
                  <Button className="bg-brand-orange hover:bg-brand-orange-dark">
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>Export your application data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Export Users
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Mail className="h-6 w-6 mb-2" />
                    Export Forms
                  </Button>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Data Export Notice</p>
                      <p className="text-yellow-700">Exported data may contain sensitive information. Handle with care and follow your organization's data protection policies.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};