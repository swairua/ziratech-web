import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Play, Pause, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OfferEditor } from './OfferEditor';
import { OfferPreview } from './OfferPreview';
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

interface Promotion {
  id: string;
  title: string;
  description: string;
  offer_text: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  code: string | null;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text: string;
  trigger_type: 'page_load' | 'exit_intent' | 'scroll_percentage' | 'time_delay';
  trigger_value: number;
  target_pages: string[];
  max_displays_per_user: number;
  expires_at: string | null;
  status: 'draft' | 'active' | 'paused' | 'expired';
  theme: string;
  popup_size: string;
  created_at: string;
}

export const OffersManager: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [previewPromotion, setPreviewPromotion] = useState<Promotion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load promotions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePromotionStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setPromotions(prev => 
        prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p)
      );

      toast({
        title: 'Success',
        description: `Promotion ${newStatus === 'active' ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      console.error('Error updating promotion status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update promotion status',
        variant: 'destructive',
      });
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPromotions(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Promotion deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promotion',
        variant: 'destructive',
      });
    }
  };

  const duplicatePromotion = async (promotion: Promotion) => {
    try {
      const { id, created_at, ...promotionData } = promotion;
      const { error } = await supabase
        .from('promotions')
        .insert({
          ...promotionData,
          title: `${promotion.title} (Copy)`,
          status: 'draft' as const,
        });

      if (error) throw error;

      await fetchPromotions();
      toast({
        title: 'Success',
        description: 'Promotion duplicated successfully',
      });
    } catch (error) {
      console.error('Error duplicating promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate promotion',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTriggerText = (promotion: Promotion) => {
    switch (promotion.trigger_type) {
      case 'page_load': return 'On page load';
      case 'exit_intent': return 'Exit intent';
      case 'scroll_percentage': return `${promotion.trigger_value}% scroll`;
      case 'time_delay': return `${promotion.trigger_value}s delay`;
      default: return promotion.trigger_type;
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  if (editingPromotion || isCreating) {
    return (
      <OfferEditor
        promotion={editingPromotion}
        onSave={async () => {
          await fetchPromotions();
          setEditingPromotion(null);
          setIsCreating(false);
        }}
        onCancel={() => {
          setEditingPromotion(null);
          setIsCreating(false);
        }}
      />
    );
  }

  if (previewPromotion) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setPreviewPromotion(null)}
        >
          ← Back to List
        </Button>
        <OfferPreview promotion={previewPromotion} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Promotions</h2>
          <p className="text-muted-foreground">Manage your promotional offers and popups</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading promotions...</div>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No promotions created yet</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Offer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {promotion.title}
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(promotion.status)} text-white`}
                      >
                        {promotion.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {promotion.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewPromotion(promotion)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPromotion(promotion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicatePromotion(promotion)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePromotionStatus(promotion.id, promotion.status)}
                    >
                      {promotion.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{promotion.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePromotion(promotion.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Offer:</span>
                    <p className="text-muted-foreground">{promotion.offer_text}</p>
                  </div>
                  <div>
                    <span className="font-medium">Trigger:</span>
                    <p className="text-muted-foreground">{getTriggerText(promotion)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Target Pages:</span>
                    <p className="text-muted-foreground">
                      {promotion.target_pages.length === 0 ? 'All pages' : `${promotion.target_pages.length} pages`}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Max Displays:</span>
                    <p className="text-muted-foreground">{promotion.max_displays_per_user} per user</p>
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