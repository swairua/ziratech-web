
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Affiliate {
  id: string;
  name: string;
  code: string;
  contact_email: string | null;
  commission_rate: number | null;
  is_active: boolean;
  created_at: string;
}

export const AffiliateManager: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_email: '',
    commission_rate: '',
    is_active: true,
  });
  const { toast } = useToast();

  const fetchAffiliates = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliates(data || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load affiliates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contact_email: '',
      commission_rate: '',
      is_active: true,
    });
    setEditingAffiliate(null);
  };

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setFormData({
      name: affiliate.name,
      code: affiliate.code,
      contact_email: affiliate.contact_email || '',
      commission_rate: affiliate.commission_rate?.toString() || '',
      is_active: affiliate.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null,
        contact_email: formData.contact_email || null,
      };

      if (editingAffiliate) {
        const { error } = await supabase
          .from('affiliates')
          .update(saveData)
          .eq('id', editingAffiliate.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Affiliate updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('affiliates')
          .insert(saveData);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Affiliate created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchAffiliates();
    } catch (error: any) {
      console.error('Error saving affiliate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save affiliate',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAffiliates(prev => prev.filter(a => a.id !== id));
      toast({
        title: 'Success',
        description: 'Affiliate deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting affiliate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete affiliate',
        variant: 'destructive',
      });
    }
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Affiliate Partners</h3>
          <p className="text-muted-foreground">Manage promotional partners and track their performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Affiliate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Affiliate Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Partner name or company"
                />
              </div>
              
              <div>
                <Label htmlFor="code">Affiliate Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="PARTNER123"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="partner@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
                  placeholder="10.00"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingAffiliate ? 'Update' : 'Create'} Affiliate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading affiliates...</div>
      ) : affiliates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No affiliates added yet</p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Affiliate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {affiliates.map((affiliate) => (
            <Card key={affiliate.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{affiliate.name}</h4>
                      <Badge 
                        variant={affiliate.is_active ? "default" : "secondary"}
                        className={affiliate.is_active ? "bg-green-500" : ""}
                      >
                        {affiliate.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Code:</span>
                        <p className="text-muted-foreground font-mono">{affiliate.code}</p>
                      </div>
                      {affiliate.contact_email && (
                        <div>
                          <span className="font-medium">Contact:</span>
                          <p className="text-muted-foreground">{affiliate.contact_email}</p>
                        </div>
                      )}
                      {affiliate.commission_rate && (
                        <div>
                          <span className="font-medium">Commission:</span>
                          <p className="text-muted-foreground">{affiliate.commission_rate}%</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-muted-foreground">
                          {new Date(affiliate.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(affiliate)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Affiliate</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{affiliate.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(affiliate.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
