import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Mail, 
  Clock, 
  Users, 
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'form_submission' | 'user_registration' | 'time_based' | 'manual';
  template_id: string;
  template_name: string;
  conditions: {
    form_name?: string;
    delay_minutes?: number;
    recipient_type: 'submitter' | 'admin' | 'custom';
    custom_email?: string;
  };
  is_active: boolean;
  sent_count: number;
  created_at: string;
  last_sent: string | null;
}

const mockRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Contact Form Confirmation',
    trigger: 'form_submission',
    template_id: '1',
    template_name: 'Form Submission Confirmation',
    conditions: {
      form_name: 'contact',
      recipient_type: 'submitter'
    },
    is_active: true,
    sent_count: 127,
    created_at: '2024-01-15T10:00:00Z',
    last_sent: '2024-02-01T14:30:00Z'
  },
  {
    id: '2',
    name: 'Admin New Form Alert',
    trigger: 'form_submission',
    template_id: '2',
    template_name: 'Admin Form Alert',
    conditions: {
      recipient_type: 'admin',
      delay_minutes: 0
    },
    is_active: true,
    sent_count: 89,
    created_at: '2024-01-15T10:00:00Z',
    last_sent: '2024-02-01T14:30:00Z'
  },
  {
    id: '3',
    name: 'Welcome Email Sequence',
    trigger: 'user_registration',
    template_id: '3',
    template_name: 'Welcome Email',
    conditions: {
      recipient_type: 'submitter',
      delay_minutes: 5
    },
    is_active: false,
    sent_count: 45,
    created_at: '2024-01-20T10:00:00Z',
    last_sent: '2024-01-30T09:15:00Z'
  }
];

export const AutomationRules = () => {
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const handleToggleRule = (id: string, isActive: boolean) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, is_active: isActive } : rule
    ));
    toast({
      title: isActive ? "Rule Activated" : "Rule Deactivated",
      description: `Automation rule has been ${isActive ? 'activated' : 'deactivated'}`,
    });
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Rule Deleted",
      description: "Automation rule has been deleted successfully",
    });
  };

  const handleSaveRule = () => {
    toast({
      title: "Rule Saved",
      description: "Automation rule has been saved successfully",
    });
    setIsCreateOpen(false);
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
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input id="rule-name" placeholder="Enter rule name" />
                </div>
                <div>
                  <Label htmlFor="trigger-type">Trigger</Label>
                  <Select>
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
                <Label htmlFor="email-template">Email Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Form Submission Confirmation</SelectItem>
                    <SelectItem value="2">Admin Form Alert</SelectItem>
                    <SelectItem value="3">Welcome Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="form-filter">Form Name (optional)</Label>
                    <Input id="form-filter" placeholder="e.g., contact, newsletter" />
                  </div>
                  <div>
                    <Label htmlFor="delay">Delay (minutes)</Label>
                    <Input id="delay" type="number" placeholder="0" defaultValue="0" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select>
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

                <div>
                  <Label htmlFor="custom-email">Custom Email (if selected above)</Label>
                  <Input id="custom-email" type="email" placeholder="custom@example.com" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="rule-active" defaultChecked />
                <Label htmlFor="rule-active">Activate rule immediately</Label>
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

      {/* Rules List */}
      <div className="grid gap-4">
        {rules.map((rule) => (
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
                        <Pause className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getTriggerColor(rule.trigger)}>
                      {getTriggerIcon(rule.trigger)}
                      <span className="ml-1">{rule.trigger.replace('_', ' ')}</span>
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Template: {rule.template_name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={rule.is_active}
                    onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
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
                    {rule.last_sent ? new Date(rule.last_sent).toLocaleDateString() : 'Never'}
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
        ))}
      </div>

      {rules.length === 0 && (
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
      )}
    </div>
  );
};