import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormSubmissionsList } from './FormSubmissionsList';
import { FormAnalytics } from './FormAnalytics';
import { FileText, Briefcase, Settings, BarChart3, Video, Rocket, Globe, Lock, MessageSquare, Handshake, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const FormsManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [formStats, setFormStats] = useState({
    contact: { total: 0, new: 0, responded: 0 },
    career: { total: 0, new: 0, responded: 0 },
    demo_booking: { total: 0, new: 0, responded: 0 },
    start_journey: { total: 0, new: 0, responded: 0 },
    zira_web: { total: 0, new: 0, responded: 0 },
    zira_lock: { total: 0, new: 0, responded: 0 },
    zira_sms: { total: 0, new: 0, responded: 0 },
    partnership: { total: 0, new: 0, responded: 0 },
    support: { total: 0, new: 0, responded: 0 }
  });

  useEffect(() => {
    fetchFormStats();
  }, []);

  const fetchFormStats = async () => {
    try {
      // Get total counts for each form type
      const { data: allSubmissions, error } = await supabase
        .from('form_submissions')
        .select('form_type, status');

      if (error) {
        console.error('Error fetching form stats:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      const stats = {
        contact: { total: 0, new: 0, responded: 0 },
        career: { total: 0, new: 0, responded: 0 },
        demo_booking: { total: 0, new: 0, responded: 0 },
        start_journey: { total: 0, new: 0, responded: 0 },
        zira_web: { total: 0, new: 0, responded: 0 },
        zira_lock: { total: 0, new: 0, responded: 0 },
        zira_sms: { total: 0, new: 0, responded: 0 },
        partnership: { total: 0, new: 0, responded: 0 },
        support: { total: 0, new: 0, responded: 0 }
      };

      allSubmissions?.forEach(submission => {
        const type = submission.form_type as keyof typeof stats;
        if (stats[type]) {
          stats[type].total++;
          if (submission.status === 'new') stats[type].new++;
          if (submission.status === 'responded') stats[type].responded++;
        }
      });

      setFormStats(stats);
    } catch (error) {
      console.error('Error fetching form stats:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
    }
  };

  const formTypeStats = [
    {
      type: 'contact',
      name: 'Contact Forms',
      count: formStats.contact.total,
      newCount: formStats.contact.new,
      icon: FileText,
      color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
    },
    {
      type: 'demo_booking',
      name: 'Demo Bookings',
      count: formStats.demo_booking.total,
      newCount: formStats.demo_booking.new,
      icon: Video,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      type: 'start_journey',
      name: 'Business Consultations',
      count: formStats.start_journey.total,
      newCount: formStats.start_journey.new,
      icon: Rocket,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
      type: 'zira_web',
      name: 'Zira Web Inquiries',
      count: formStats.zira_web.total,
      newCount: formStats.zira_web.new,
      icon: Globe,
      color: 'bg-green-500/10 text-green-500 border-green-500/20'
    },
    {
      type: 'zira_lock',
      name: 'Zira Lock Inquiries',
      count: formStats.zira_lock.total,
      newCount: formStats.zira_lock.new,
      icon: Lock,
      color: 'bg-red-500/10 text-red-500 border-red-500/20'
    },
    {
      type: 'zira_sms',
      name: 'Zira SMS Inquiries',
      count: formStats.zira_sms.total,
      newCount: formStats.zira_sms.new,
      icon: MessageSquare,
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    },
    {
      type: 'career',
      name: 'Career Applications',
      count: formStats.career.total,
      newCount: formStats.career.new,
      icon: Briefcase,
      color: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20'
    },
    {
      type: 'partnership',
      name: 'Partnership Inquiries',
      count: formStats.partnership.total,
      newCount: formStats.partnership.new,
      icon: Handshake,
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
    },
    {
      type: 'support',
      name: 'Support Requests',
      count: formStats.support.total,
      newCount: formStats.support.new,
      icon: HelpCircle,
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-brand-navy">Forms Management</h1>
        <p className="text-muted-foreground mt-2">Manage form submissions and track responses across all channels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formTypeStats.map((stat) => (
          <Card key={stat.type} className="relative overflow-hidden border-l-4 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-brand-orange" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-brand-navy">{stat.count}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={stat.color}>
                      {stat.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                  {stat.newCount > 0 && (
                    <Badge className="bg-brand-orange text-white">
                      {stat.newCount} new
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-muted p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            All
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            Business
          </TabsTrigger>
          <TabsTrigger value="platforms" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            Platforms
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            Contact
          </TabsTrigger>
          <TabsTrigger value="career" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            Career
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <FormSubmissionsList formType="all" onUpdate={fetchFormStats} />
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Demo Bookings</Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Business Consultations</Badge>
              <Badge variant="outline" className="bg-teal-500/10 text-teal-500">Partnerships</Badge>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Support</Badge>
            </div>
            <FormSubmissionsList formType="business" onUpdate={fetchFormStats} />
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="bg-green-500/10 text-green-500">Zira Web</Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-500">Zira Lock</Badge>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Zira SMS</Badge>
            </div>
            <FormSubmissionsList formType="platforms" onUpdate={fetchFormStats} />
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <FormSubmissionsList formType="contact" onUpdate={fetchFormStats} />
        </TabsContent>

        <TabsContent value="career" className="space-y-6">
          <FormSubmissionsList formType="career" onUpdate={fetchFormStats} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FormAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
