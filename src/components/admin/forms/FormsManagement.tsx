import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormSubmissionsList } from './FormSubmissionsList';
import { FormAnalytics } from './FormAnalytics';
import { FileText, Briefcase, Settings, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const FormsManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [formStats, setFormStats] = useState({
    contact: { total: 0, new: 0, responded: 0 },
    career: { total: 0, new: 0, responded: 0 },
    custom: { total: 0, new: 0, responded: 0 }
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
        console.error('Error fetching form stats:', error);
        return;
      }

      const stats = {
        contact: { total: 0, new: 0, responded: 0 },
        career: { total: 0, new: 0, responded: 0 },
        custom: { total: 0, new: 0, responded: 0 }
      };

      allSubmissions?.forEach(submission => {
        // Map 'career_application' to 'career' for stats
        let type = submission.form_type;
        if (type === 'career_application') type = 'career';
        
        const statType = type as keyof typeof stats;
        if (stats[statType]) {
          stats[statType].total++;
          if (submission.status === 'new') stats[statType].new++;
          if (submission.status === 'responded') stats[statType].responded++;
        }
      });

      setFormStats(stats);
    } catch (error) {
      console.error('Error fetching form stats:', error);
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
      type: 'career',
      name: 'Career Applications',
      count: formStats.career.total,
      newCount: formStats.career.new,
      icon: Briefcase,
      color: 'bg-brand-navy/10 text-brand-navy border-brand-navy/20'
    },
    {
      type: 'custom',
      name: 'Custom Forms',
      count: formStats.custom.total,
      newCount: formStats.custom.new,
      icon: Settings,
      color: 'bg-muted text-muted-foreground border-border'
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
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            All Submissions
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            Contact Forms
          </TabsTrigger>
          <TabsTrigger value="career" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            Career Applications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-orange data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <FormSubmissionsList formType="all" onUpdate={fetchFormStats} />
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