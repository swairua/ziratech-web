import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { automationRulesApi, emailTemplatesApi } from '@/lib/apiClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Clock, 
  Users, 
  Settings,
  Zap,
  CheckCircle,
  Loader
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'form_submission' | 'user_registration' | 'time_based' | 'manual';
  template_id: string;
  conditions: {
    form_name?: string;
    delay_minutes?: number;
    recipient_type: 'submitter' | 'admin' | 'custom';
    custom_email?: string;
  };
  is_active: boolean;
  sent_count: number;
  created_at: string;
  last_sent_at: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
}

export const AutomationRules = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'form_submission' as const,
    template_id: '',
    conditions: {
      form_name: '',
      delay_minutes: 0,
      recipient_type: 'submitter' as const,
      custom_email: '',
    },
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    const rulesResponse = await automationRulesApi.list();
    if (rulesResponse.data && Array.isArray(rulesResponse.data)) {
      setRules(rulesResponse.data as AutomationRule[]);
    } else if (rulesResponse.error) {
      toast({
        title: "Error",
        description: "Failed to load automation rules",
        variant: "destructive",
      });
    }

    const templatesResponse = await emailTemplatesApi.list();
    if (templatesResponse.data && Array.isArray(templatesResponse.data)) {
      setTemplates(templatesResponse.data as EmailTemplate[]);
    }

    setIsLoading(false);
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await automationRulesApi.toggle(id, !isActive);
      setRules(rules.map(rule =>
        rule.id === id ? { ...rule, is_active: !isActive } : rule
      ));
      toast({
        title: !isActive ? "Rule Activated" : "Rule Deactivated",
        description: `Automation rule has been ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle automation rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await automationRulesApi.delete(id);
      setRules(rules.filter(rule => rule.id !== id));
      toast({
        title: "Rule Deleted",
        description: "Automation rule has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete automation rule",
        variant: "destructive",
      });
    }
  };

  const handleSaveRule = async () => {
    if (!formData.name || !formData.template_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await automationRulesApi.create({
        ...formData,
        conditions: {
          ...formData.conditions,
          delay_minutes: parseInt(String(formData.conditions.delay_minutes)) || 0,
        },
      });

      toast({
        title: "Rule Created",
        description: "Automation rule has been created successfully",
      });

      setFormData({
        name: '',
        description: '',
        trigger: 'form_submission',
        template_id: '',
        conditions: {
          form_name: '',
          delay_minutes: 0,
          recipient_type: 'submitter',
          custom_email: '',
        },
      });
      setIsCreateOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create automation rule",
        variant: "destructive",
      });
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'form_submission': return <Mail className="h-4 w-4" />;
      case 'user_registration': return <Users className="h-4 w-4" />;
      case 'time_based': return <Clock className="h-4 w-4" />;
      case 'manual': return <Settings className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'form_submission': return 'bg-blue-100 text-blue-800';
      case 'user_registration': return 'bg-green-100 text-green-800';
      case 'time_based': return 'bg-purple-100 text-purple-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">Automation Rules</h2>
          <p className="text-muted-foreground">Configure automated email triggers and workflows</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-orange hover:bg-brand-orange-dark">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input 
                    id="rule-name"
                    placeholder="Enter rule name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="trigger-type">Trigger *</Label>
                  <Select value={formData.trigger} onValueChange={(value: any) => setFormData({...formData, trigger: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="form_submission">Form Submission</SelectItem>
                      <SelectItem value="user_registration">User Registration</SelectItem>
                      <SelectItem value="time_based">Time-based</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description"
                  placeholder="Describe this automation rule"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="email-template">Email Template *</Label>
                <Select value={formData.template_id} onValueChange={(value) => setFormData({...formData, template_id: value})}>
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

              <div className="space-y-4">
                <h4 className="font-medium">Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="form-filter">Form Name (optional)</Label>
                    <Input 
                      id="form-filter"
                      placeholder="e.g., contact, newsletter"
                      value={formData.conditions.form_name}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: {...formData.conditions, form_name: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delay">Delay (minutes)</Label>
                    <Input 
                      id="delay"
                      type="number"
                      placeholder="0"
                      value={formData.conditions.delay_minutes}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: {...formData.conditions, delay_minutes: parseInt(e.target.value) || 0}
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipient">Recipient *</Label>
                  <Select 
                    value={formData.conditions.recipient_type} 
                    onValueChange={(value: any) => setFormData({
                      ...formData,
                      conditions: {...formData.conditions, recipient_type: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitter">Form Submitter</SelectItem>
                      <SelectItem value="admin">Admin Team</SelectItem>
                      <SelectItem value="custom">Custom Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.conditions.recipient_type === 'custom' && (
                  <div>
                    <Label htmlFor="custom-email">Custom Email</Label>
                    <Input 
                      id="custom-email"
                      type="email"
                      placeholder="custom@example.com"
                      value={formData.conditions.custom_email}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: {...formData.conditions, custom_email: e.target.value}
                      })}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRule} className="bg-brand-orange hover:bg-brand-orange-dark">
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading automation rules...</p>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      {!isLoading && (
        <div className="grid gap-4">
          {rules.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No automation rules configured</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first automation rule to start sending automated emails
                </p>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-orange hover:bg-brand-orange-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id} className={rule.is_active ? 'border-green-200' : 'border-gray-200'}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        {rule.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      )}
                      <div className="flex items-center space-x-4">
                        <Badge className={getTriggerColor(rule.trigger)}>
                          {getTriggerIcon(rule.trigger)}
                          <span className="ml-1">{rule.trigger.replace(/_/g, ' ')}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleRule(rule.id, rule.is_active)}
                      />
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium">Emails Sent</div>
                      <div className="text-2xl font-bold text-brand-orange">{rule.sent_count}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Last Sent</div>
                      <div className="text-sm text-muted-foreground">
                        {rule.last_sent_at ? new Date(rule.last_sent_at).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Recipient Type</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {rule.conditions.recipient_type}
                      </div>
                    </div>
                  </div>

                  {rule.conditions.delay_minutes && rule.conditions.delay_minutes > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center text-yellow-800">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">Delayed by {rule.conditions.delay_minutes} minutes</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
