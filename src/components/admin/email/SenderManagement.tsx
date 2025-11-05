import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface EmailSender {
  id: string;
  from_name: string;
  from_email: string;
  reply_to: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SenderFormData {
  from_name: string;
  from_email: string;
  reply_to: string;
  is_active: boolean;
}

export const SenderManagement = () => {
  const [senders, setSenders] = useState<EmailSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSender, setEditingSender] = useState<EmailSender | null>(null);
  const [formData, setFormData] = useState<SenderFormData>({
    from_name: '',
    from_email: '',
    reply_to: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSenders();
  }, []);

  const loadSenders = async () => {
    try {
      const { data, error } = await supabase
        .from('email_senders')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSenders(data || []);
    } catch (error) {
      console.error('Error loading senders:', error);
      toast({
        title: "Error",
        description: "Failed to load email senders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSender = async () => {
    try {
      if (editingSender) {
        // Update existing sender
        const { error } = await supabase
          .from('email_senders')
          .update(formData)
          .eq('id', editingSender.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Email sender updated successfully"
        });
      } else {
        // Create new sender
        const { error } = await supabase
          .from('email_senders')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Email sender created successfully"
        });
      }

      setShowAddForm(false);
      setEditingSender(null);
      setFormData({ from_name: '', from_email: '', reply_to: '', is_active: true });
      loadSenders();
    } catch (error) {
      console.error('Error saving sender:', error);
      toast({
        title: "Error",
        description: "Failed to save email sender",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (senderId: string) => {
    try {
      // First, remove default from all senders
      await supabase
        .from('email_senders')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      // Then set the selected sender as default
      const { error } = await supabase
        .from('email_senders')
        .update({ is_default: true })
        .eq('id', senderId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Default sender updated successfully"
      });
      loadSenders();
    } catch (error) {
      console.error('Error setting default sender:', error);
      toast({
        title: "Error",
        description: "Failed to set default sender",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSender = async (senderId: string) => {
    try {
      const { error } = await supabase
        .from('email_senders')
        .delete()
        .eq('id', senderId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Email sender deleted successfully"
      });
      loadSenders();
    } catch (error) {
      console.error('Error deleting sender:', error);
      toast({
        title: "Error",
        description: "Failed to delete email sender",
        variant: "destructive"
      });
    }
  };

  const handleEditSender = (sender: EmailSender) => {
    setEditingSender(sender);
    setFormData({
      from_name: sender.from_name,
      from_email: sender.from_email,
      reply_to: sender.reply_to || '',
      is_active: sender.is_active
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ from_name: '', from_email: '', reply_to: '', is_active: true });
    setEditingSender(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Senders</CardTitle>
          <CardDescription>Manage your email sender profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading senders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Senders</CardTitle>
        <CardDescription>
          Manage multiple sender profiles for your email campaigns. Make sure to verify domains in Resend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {senders.length} sender{senders.length !== 1 ? 's' : ''} configured
          </div>
          <Dialog open={showAddForm} onOpenChange={(open) => !open && resetForm()}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Sender
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSender ? 'Edit' : 'Add'} Email Sender</DialogTitle>
                <DialogDescription>
                  Configure a new email sender profile. Make sure the domain is verified in Resend.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="from_name">From Name</Label>
                  <Input
                    id="from_name"
                    value={formData.from_name}
                    onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={formData.from_email}
                    onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                    placeholder="noreply@yourcompany.com"
                  />
                </div>
                <div>
                  <Label htmlFor="reply_to">Reply To (optional)</Label>
                  <Input
                    id="reply_to"
                    type="email"
                    value={formData.reply_to}
                    onChange={(e) => setFormData({ ...formData, reply_to: e.target.value })}
                    placeholder="support@yourcompany.com"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveSender} className="flex-1">
                    {editingSender ? 'Update' : 'Create'} Sender
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {senders.map((sender) => (
            <div
              key={sender.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{sender.from_name}</span>
                    {sender.is_default && (
                      <Badge variant="default" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    {!sender.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{sender.from_email}</div>
                    {sender.reply_to && <div>Reply to: {sender.reply_to}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!sender.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(sender.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSender(sender)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSender(sender.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {senders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No email senders configured. Add your first sender to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};