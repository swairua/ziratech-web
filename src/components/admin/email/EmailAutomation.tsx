import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplates } from './EmailTemplates';
import { AutomationRules } from './AutomationRules';
import { EmailSettings } from './EmailSettings';
import { automationRulesApi, emailTemplatesApi } from '@/lib/apiClient';
import { 
  Mail, 
  Send, 
  Clock, 
  Users, 
  Settings as SettingsIcon,
  Zap,
  Loader
} from 'lucide-react';

export const EmailAutomation = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [stats, setStats] = useState({
    totalTemplates: 0,
    activeRules: 0,
    totalRules: 0,
    averageSendTime: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const templatesResponse = await emailTemplatesApi.list();
      const rulesResponse = await automationRulesApi.list();

      const templates = Array.isArray(templatesResponse.data) ? templatesResponse.data : [];
      const rules = Array.isArray(rulesResponse.data) ? rulesResponse.data : [];
      const activeRules = rules.filter((r: any) => r.is_active).length;

      setStats({
        totalTemplates: templates.length,
        activeRules: activeRules,
        totalRules: rules.length,
        averageSendTime: 2.4,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
    setIsLoadingStats(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-navy">Email Automation</h1>
        <p className="text-muted-foreground">Manage automated email campaigns and notifications</p>
      </div>

      {/* Quick Stats */}
      {isLoadingStats ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-navy">{stats.totalTemplates}</p>
                  <p className="text-sm text-muted-foreground">Email Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-navy">{stats.activeRules}</p>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Send className="h-5 w-5 text-brand-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-navy">{stats.totalRules}</p>
                  <p className="text-sm text-muted-foreground">Total Rules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-navy">{stats.averageSendTime}s</p>
                  <p className="text-sm text-muted-foreground">Avg. Send Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="automations">Automation Rules</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="automations" className="space-y-6">
          <AutomationRules />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
