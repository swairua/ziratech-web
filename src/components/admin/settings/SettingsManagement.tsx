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
import { appSettingsApi, notificationSettingsApi } from '@/lib/apiClient';
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
  AlertTriangle,
  Loader
} from 'lucide-react';

interface AppSettings {
  [key: string]: string | boolean | number;
}

export const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [generalSettings, setGeneralSettings] = useState({
    company_name: 'Zira Technologies',
    company_email: 'info@ziratechnologies.com',
    company_phone: '+1 (555) 123-4567',
    company_website: 'https://ziratechnologies.com',
    company_address: '123 Innovation Drive, Tech City, TC 12345',
    maintenance_mode: false,
    debug_mode: false,
    public_registration: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: true,
    session_timeout: true,
    session_duration: 60,
    password_min_length: 8,
    password_require_special: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme_primary_color: '#FF6B00',
    theme_secondary_color: '#1B2B3C',
    dark_mode_default: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_form_submissions: true,
    email_user_registration: true,
    email_system_alerts: true,
    admin_email_recipients: 'admin@ziratechnologies.com\nsupport@ziratechnologies.com',
  });

  const [integrationSettings] = useState({
    google_analytics: { status: 'Connected', connected: true },
    stripe: { status: 'Not Connected', connected: false },
    slack: { status: 'Connected', connected: true },
    zapier: { status: 'Not Connected', connected: false },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await appSettingsApi.list();
      if (response.data && Array.isArray(response.data)) {
        const settings = (response.data as any[]).reduce((acc, item) => {
          const value = item.setting_type === 'boolean' 
            ? item.setting_value === 'true' 
            : item.setting_type === 'number'
            ? parseInt(item.setting_value)
            : item.setting_value;
          acc[item.setting_key] = value;
          return acc;
        }, {} as AppSettings);

        setGeneralSettings(prev => ({
          ...prev,
          company_name: settings.company_name as string || prev.company_name,
          company_email: settings.company_email as string || prev.company_email,
          company_phone: settings.company_phone as string || prev.company_phone,
          company_website: settings.company_website as string || prev.company_website,
          company_address: settings.company_address as string || prev.company_address,
          maintenance_mode: settings.maintenance_mode as boolean || prev.maintenance_mode,
          debug_mode: settings.debug_mode as boolean || prev.debug_mode,
          public_registration: settings.public_registration as boolean ?? prev.public_registration,
        }));

        setSecuritySettings(prev => ({
          ...prev,
          two_factor_auth: settings.two_factor_auth as boolean ?? prev.two_factor_auth,
          session_timeout: settings.session_timeout as boolean ?? prev.session_timeout,
          session_duration: (settings.session_duration as number) || prev.session_duration,
          password_min_length: (settings.password_min_length as number) || prev.password_min_length,
          password_require_special: settings.password_require_special as boolean ?? prev.password_require_special,
        }));

        setAppearanceSettings(prev => ({
          ...prev,
          theme_primary_color: settings.theme_primary_color as string || prev.theme_primary_color,
          theme_secondary_color: settings.theme_secondary_color as string || prev.theme_secondary_color,
          dark_mode_default: settings.dark_mode_default as boolean || prev.dark_mode_default,
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: "Warning",
        description: "Could not load settings from database. Using default values.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const saveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      const promises = [
        appSettingsApi.set('company_name', generalSettings.company_name),
        appSettingsApi.set('company_email', generalSettings.company_email),
        appSettingsApi.set('company_phone', generalSettings.company_phone),
        appSettingsApi.set('company_website', generalSettings.company_website),
        appSettingsApi.set('company_address', generalSettings.company_address),
        appSettingsApi.set('maintenance_mode', String(generalSettings.maintenance_mode)),
        appSettingsApi.set('debug_mode', String(generalSettings.debug_mode)),
        appSettingsApi.set('public_registration', String(generalSettings.public_registration)),
      ];
      await Promise.all(promises);
      toast({
        title: "Settings Saved",
        description: "General settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save general settings",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const saveSecuritySettings = async () => {
    setIsSaving(true);
    try {
      const promises = [
        appSettingsApi.set('two_factor_auth', String(securitySettings.two_factor_auth)),
        appSettingsApi.set('session_timeout', String(securitySettings.session_timeout)),
        appSettingsApi.set('session_duration', String(securitySettings.session_duration)),
        appSettingsApi.set('password_min_length', String(securitySettings.password_min_length)),
        appSettingsApi.set('password_require_special', String(securitySettings.password_require_special)),
      ];
      await Promise.all(promises);
      toast({
        title: "Settings Saved",
        description: "Security settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const saveAppearanceSettings = async () => {
    setIsSaving(true);
    try {
      const promises = [
        appSettingsApi.set('theme_primary_color', appearanceSettings.theme_primary_color),
        appSettingsApi.set('theme_secondary_color', appearanceSettings.theme_secondary_color),
        appSettingsApi.set('dark_mode_default', String(appearanceSettings.dark_mode_default)),
      ];
      await Promise.all(promises);
      toast({
        title: "Settings Saved",
        description: "Appearance settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save appearance settings",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const saveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      const promises = [
        appSettingsApi.set('email_form_submissions', String(notificationSettings.email_form_submissions)),
        appSettingsApi.set('email_user_registration', String(notificationSettings.email_user_registration)),
        appSettingsApi.set('email_system_alerts', String(notificationSettings.email_system_alerts)),
        appSettingsApi.set('admin_email_recipients', notificationSettings.admin_email_recipients),
      ];
      await Promise.all(promises);
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings and preferences</p>
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
        <h1 className="text-3xl font-bold text-brand-navy">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Tab */}
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
                      value={generalSettings.company_name}
                      onChange={(e) => setGeneralSettings({...generalSettings, company_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Contact Email</Label>
                    <Input 
                      id="company-email" 
                      type="email"
                      value={generalSettings.company_email}
                      onChange={(e) => setGeneralSettings({...generalSettings, company_email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-phone">Phone Number</Label>
                    <Input 
                      id="company-phone" 
                      value={generalSettings.company_phone}
                      onChange={(e) => setGeneralSettings({...generalSettings, company_phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-website">Website</Label>
                    <Input 
                      id="company-website" 
                      value={generalSettings.company_website}
                      onChange={(e) => setGeneralSettings({...generalSettings, company_website: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-address">Address</Label>
                  <Textarea 
                    id="company-address" 
                    value={generalSettings.company_address}
                    onChange={(e) => setGeneralSettings({...generalSettings, company_address: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={saveGeneralSettings} 
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                    checked={generalSettings.maintenance_mode}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenance_mode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable detailed error logging</p>
                  </div>
                  <Switch 
                    id="debug-mode" 
                    checked={generalSettings.debug_mode}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, debug_mode: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-registration">Public Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow public user registration</p>
                  </div>
                  <Switch 
                    id="public-registration" 
                    checked={generalSettings.public_registration}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, public_registration: checked})}
                  />
                </div>
                <Button 
                  onClick={saveGeneralSettings} 
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save System Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
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
                    checked={securitySettings.two_factor_auth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, two_factor_auth: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout">Auto Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <Switch 
                    id="session-timeout" 
                    checked={securitySettings.session_timeout}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, session_timeout: checked})}
                  />
                </div>
                <div>
                  <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                  <Input 
                    id="session-duration" 
                    type="number" 
                    value={securitySettings.session_duration}
                    onChange={(e) => setSecuritySettings({...securitySettings, session_duration: parseInt(e.target.value) || 60})}
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
                        value={securitySettings.password_min_length}
                        onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value) || 8})}
                        className="w-24" 
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="require-special" 
                        checked={securitySettings.password_require_special}
                        onCheckedChange={(checked) => setSecuritySettings({...securitySettings, password_require_special: checked})}
                      />
                      <Label htmlFor="require-special">Require Special Characters</Label>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={saveSecuritySettings} 
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </>
                  )}
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

        {/* Appearance Tab */}
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
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: appearanceSettings.theme_primary_color }}></div>
                    <Input 
                      id="primary-color" 
                      value={appearanceSettings.theme_primary_color}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, theme_primary_color: e.target.value})}
                      className="w-32" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="w-8 h-8 rounded border" style={{ backgroundColor: appearanceSettings.theme_secondary_color }}></div>
                    <Input 
                      id="secondary-color" 
                      value={appearanceSettings.theme_secondary_color}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, theme_secondary_color: e.target.value})}
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
                    checked={appearanceSettings.dark_mode_default}
                    onCheckedChange={(checked) => setAppearanceSettings({...appearanceSettings, dark_mode_default: checked})}
                  />
                </div>
                <Button 
                  onClick={saveAppearanceSettings} 
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Theme Settings
                    </>
                  )}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Connect with external services and APIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(integrationSettings).map(([key, integration]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">
                          Status: <Badge className={(integration as any).connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {(integration as any).status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {(integration as any).connected ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
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
                    checked={notificationSettings.email_form_submissions}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_form_submissions: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-user-registration">New User Registrations</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                  </div>
                  <Switch 
                    id="new-user-registration" 
                    checked={notificationSettings.email_user_registration}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_user_registration: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-alerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about system issues</p>
                  </div>
                  <Switch 
                    id="system-alerts" 
                    checked={notificationSettings.email_system_alerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_system_alerts: checked})}
                  />
                </div>
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
                    value={notificationSettings.admin_email_recipients}
                    onChange={(e) => setNotificationSettings({...notificationSettings, admin_email_recipients: e.target.value})}
                    placeholder="admin@ziratechnologies.com&#10;support@ziratechnologies.com"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">One email address per line</p>
                </div>
                <Button 
                  onClick={saveNotificationSettings} 
                  disabled={isSaving}
                  className="bg-brand-orange hover:bg-brand-orange-dark"
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
