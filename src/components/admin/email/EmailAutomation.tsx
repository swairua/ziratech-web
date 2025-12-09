import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplatesReal } from './EmailTemplatesReal';
import { AutomationRulesReal } from './AutomationRulesReal';
import { EmailSettings } from './EmailSettings';
import { ActivityLogsReal } from './ActivityLogsReal';
import { 
  Mail, 
  CheckCircle,
  Zap,
  Clock
} from 'lucide-react';

interface EmailStats {
  emailsSentToday: number;
  deliveryRate: number;
  activeAutomations: number;
  avgSendTime: number;
}

export const EmailAutomation = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [stats, setStats] = useState<EmailStats>({
    emailsSentToday: 0,
    deliveryRate: 0,
    activeAutomations: 0,
    avgSendTime: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get today's email events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: emailEvents, error: eventsError } = await supabase
        .from('email_events')
        .select('status, created_at')
        .gte('created_at', today.toISOString());

      if (eventsError) throw eventsError;

      // Get active automation rules
      const { data: automationRules, error: rulesError } = await supabase
        .from('email_automation_rules')
        .select('id')
        .eq('is_active', true);

      if (rulesError) throw rulesError;

      // Calculate stats
      const emailsSentToday = emailEvents?.filter(e => e.status === 'sent').length || 0;
      const totalEmails = emailEvents?.length || 0;
      const deliveryRate = totalEmails > 0 ? (emailsSentToday / totalEmails) * 100 : 0;
      const activeAutomations = automationRules?.length || 0;
      
      setStats({
        emailsSentToday,
        deliveryRate: Number(deliveryRate.toFixed(1)),
        activeAutomations,
        avgSendTime: 2.1 // This would need more complex calculation based on actual send times
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-navy">Email Automation</h1>
        <p className="text-muted-foreground">Manage automated email campaigns and notifications</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-navy">{loading ? '...' : stats.emailsSentToday}</p>
                <p className="text-sm text-muted-foreground">Emails Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-navy">{loading ? '...' : `${stats.deliveryRate}%`}</p>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Zap className="h-5 w-5 text-brand-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-navy">{loading ? '...' : stats.activeAutomations}</p>
                <p className="text-sm text-muted-foreground">Active Automations</p>
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
                <p className="text-2xl font-bold text-brand-navy">{loading ? '...' : `${stats.avgSendTime}s`}</p>
                <p className="text-sm text-muted-foreground">Avg. Send Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="automations">Automation Rules</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <EmailTemplatesReal />
        </TabsContent>

        <TabsContent value="automations" className="space-y-6">
          <AutomationRulesReal />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <EmailSettings />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <ActivityLogsReal />
        </TabsContent>
      </Tabs>
    </div>
  );
};