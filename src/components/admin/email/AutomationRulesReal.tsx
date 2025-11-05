import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Mail, Trash2, FileText, UserPlus, Send } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  template_id: string;
  conditions: any;
  delay_minutes: number;
  recipient_type: string;
  custom_recipient?: string;
  is_active: boolean;
  sent_count: number;
  created_at: string;
  email_templates?: {
    id: string;
    name: string;
    subject: string;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
}

export const AutomationRulesReal = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<AutomationRule>>({});
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchRules(), fetchTemplates()]);
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automation_rules')
        .select(`
          *,
          email_templates (
            id,
            name,
            subject
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_automation_rules')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: isActive ? "Rule deactivated" : "Rule activated",
        description: isActive ? "Email automation rule has been deactivated" : "Email automation rule is now active",
      });
      
      fetchRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Automation rule deleted successfully" });
      fetchRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        name: editingRule.name || '',
        description: editingRule.description,
        trigger_type: editingRule.trigger_type || 'form_submission',
        template_id: editingRule.template_id,
        conditions: editingRule.conditions || {},
        delay_minutes: editingRule.delay_minutes || 0,
        recipient_type: editingRule.recipient_type || 'user',
        custom_recipient: editingRule.custom_recipient,
        is_active: editingRule.is_active ?? true
      };

      if (editingRule.id) {
        const { error } = await supabase
          .from('email_automation_rules')
          .update(ruleData)
          .eq('id', editingRule.id);
        if (error) throw error;
        toast({ title: "Rule updated successfully" });
      } else {
        const { error } = await supabase
          .from('email_automation_rules')
          .insert([ruleData]);
        if (error) throw error;
        toast({ title: "Rule created successfully" });
      }

      setIsCreateDialogOpen(false);
      setEditingRule({});
      fetchRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'form_submission': return <FileText className="h-4 w-4" />;
      case 'user_signup': return <UserPlus className="h-4 w-4" />;
      case 'project_inquiry': return <Mail className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'form_submission': return "bg-blue-100 text-blue-800";
      case 'user_signup': return "bg-green-100 text-green-800";
      case 'project_inquiry': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading automation rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automation Rules</h2>
          <p className="text-muted-foreground">
            Set up automated email workflows triggered by user actions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRule({})}>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule.id ? 'Edit Automation Rule' : 'Create New Automation Rule'}
              </DialogTitle>
              <DialogDescription>
                Configure when and how emails are automatically sent
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={editingRule.name || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    placeholder="e.g., Contact Form Response"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger</Label>
                  <Select
                    value={editingRule.trigger_type || ''}
                    onValueChange={(value) => setEditingRule({ ...editingRule, trigger_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form_submission">Form Submission</SelectItem>
                      <SelectItem value="user_signup">User Signup</SelectItem>
                      <SelectItem value="project_inquiry">Project Inquiry</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingRule.description || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="Brief description of what this rule does"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select
                    value={editingRule.template_id || ''}
                    onValueChange={(value) => setEditingRule({ ...editingRule, template_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Type</Label>
                  <Select
                    value={editingRule.recipient_type || ''}
                    onValueChange={(value) => setEditingRule({ ...editingRule, recipient_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Form Submitter</SelectItem>
                      <SelectItem value="admin">Admin/Team</SelectItem>
                      <SelectItem value="custom">Custom Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingRule.recipient_type === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-email">Custom Email Address</Label>
                  <Input
                    id="custom-email"
                    type="email"
                    value={editingRule.custom_recipient || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, custom_recipient: e.target.value })}
                    placeholder="custom@example.com"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (minutes)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="0"
                    value={editingRule.delay_minutes || 0}
                    onChange={(e) => setEditingRule({ ...editingRule, delay_minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="active"
                    checked={editingRule.is_active !== false}
                    onCheckedChange={(checked) => setEditingRule({ ...editingRule, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule}>
                {editingRule.id ? 'Update' : 'Create'} Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No automation rules configured</h3>
            <p className="text-muted-foreground text-center mb-6">
              Get started by creating your first email automation rule
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getTriggerIcon(rule.trigger_type)}
                      <Badge className={getTriggerColor(rule.trigger_type)}>
                        {rule.trigger_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => handleToggleRule(rule.id, rule.is_active)}
                    />
                  </div>
                </div>
                <CardDescription>{rule.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Template</p>
                    <p className="text-sm">{rule.email_templates?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                    <p className="text-sm capitalize">{rule.recipient_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                    <p className="text-sm font-semibold">{rule.sent_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delay</p>
                    <p className="text-sm">{rule.delay_minutes}min</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(rule.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRule(rule);
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};