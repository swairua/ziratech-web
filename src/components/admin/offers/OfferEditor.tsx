import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OfferPreview } from './OfferPreview';

interface Promotion {
  id?: string;
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
  redirect_url?: string | null;
  theme: string;
  popup_size: string;
}

interface OfferEditorProps {
  promotion?: Promotion | null;
  onSave: () => void;
  onCancel: () => void;
}

export const OfferEditor: React.FC<OfferEditorProps> = ({ promotion, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Promotion>({
    title: '',
    description: '',
    offer_text: '',
    discount_percentage: null,
    discount_amount: null,
    code: null,
    background_color: '#1B2B3C',
    text_color: '#FFFFFF',
    button_color: '#FF6B00',
    button_text: 'Claim Offer',
    trigger_type: 'page_load',
    trigger_value: 0,
    target_pages: [],
    max_displays_per_user: 3,
    expires_at: null,
    status: 'draft',
    redirect_url: null,
    theme: 'brand',
    popup_size: 'standard',
  });
  
  const [newPage, setNewPage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (promotion) {
      setFormData({
        ...promotion,
        theme: promotion.theme || 'brand',
        popup_size: promotion.popup_size || 'standard'
      });
    }
  }, [promotion]);

  const brandPresets = [
    {
      name: 'Zira Brand',
      background_color: '#1B2B3C',
      text_color: '#FFFFFF',
      button_color: '#FF6B00',
      description: 'Official Zira navy and orange'
    },
    {
      name: 'Orange Focus',
      background_color: '#FF6B00',
      text_color: '#FFFFFF',
      button_color: '#1B2B3C',
      description: 'Bold orange background'
    },
    {
      name: 'Light Professional',
      background_color: '#F8FAFC',
      text_color: '#334155',
      button_color: '#FF6B00',
      description: 'Clean light theme'
    },
    {
      name: 'Dark Mode',
      background_color: '#0F172A',
      text_color: '#F1F5F9',
      button_color: '#FF6B00',
      description: 'Modern dark theme'
    },
    {
      name: 'High Contrast',
      background_color: '#000000',
      text_color: '#FFFFFF',
      button_color: '#FFD700',
      description: 'Maximum visibility'
    }
  ];

  const handleInputChange = (field: keyof Promotion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const applyBrandPreset = (preset: typeof brandPresets[0]) => {
    setFormData(prev => ({
      ...prev,
      background_color: preset.background_color,
      text_color: preset.text_color,
      button_color: preset.button_color,
      theme: preset.name.toLowerCase().replace(' ', '_')
    }));
  };

  const addTargetPage = () => {
    if (newPage && !formData.target_pages.includes(newPage)) {
      setFormData(prev => ({
        ...prev,
        target_pages: [...prev.target_pages, newPage]
      }));
      setNewPage('');
    }
  };

  const removeTargetPage = (page: string) => {
    setFormData(prev => ({
      ...prev,
      target_pages: prev.target_pages.filter(p => p !== page)
    }));
  };

  const generatePromoCode = () => {
    const prefix = 'ZIRA';
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${prefix}${randomSuffix}`;
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSave = async () => {
    try {
      const saveData = { ...formData };
      
      if (promotion?.id) {
        const { error } = await supabase
          .from('promotions')
          .update(saveData)
          .eq('id', promotion.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Promotion updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert(saveData);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Promotion created successfully',
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: 'Error',
        description: 'Failed to save promotion',
        variant: 'destructive',
      });
    }
  };

  const commonPages = [
    { value: '/', label: 'Home Page' },
    { value: '/zira-homes', label: 'ZiraHomes' },
    { value: '/zira-web', label: 'ZiraWeb' },
    { value: '/zira-sms', label: 'ZiraSMS' },
    { value: '/zira-lock', label: 'ZiraLock' },
    { value: '/portfolio', label: 'Portfolio' },
    { value: '/blog', label: 'Blog' },
  ];

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Preview Offer</h2>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Back to Editor
          </Button>
        </div>
        <OfferPreview promotion={formData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {promotion ? 'Edit Promotion' : 'Create New Promotion'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            Preview
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Welcome Offer"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the offer"
                />
              </div>
              
              <div>
                <Label htmlFor="offer_text">Offer Text</Label>
                <Input
                  id="offer_text"
                  value={formData.offer_text}
                  onChange={(e) => handleInputChange('offer_text', e.target.value)}
                  placeholder="e.g., 10% OFF Your First Project"
                />
              </div>
              
              <div>
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => handleInputChange('button_text', e.target.value)}
                  placeholder="e.g., Claim Offer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_percentage">Discount %</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    value={formData.discount_percentage || ''}
                    onChange={(e) => handleInputChange('discount_percentage', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="discount_amount">Discount Amount</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    value={formData.discount_amount || ''}
                    onChange={(e) => handleInputChange('discount_amount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="50.00"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code || ''}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="e.g., WELCOME10"
                  />
                  <Button type="button" variant="outline" onClick={generatePromoCode}>
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Will be copied to clipboard and auto-fill in forms when claimed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trigger Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Trigger Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trigger_type">Trigger Type</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) => handleInputChange('trigger_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page_load">Page Load</SelectItem>
                    <SelectItem value="exit_intent">Exit Intent</SelectItem>
                    <SelectItem value="scroll_percentage">Scroll Percentage</SelectItem>
                    <SelectItem value="time_delay">Time Delay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(formData.trigger_type === 'scroll_percentage' || formData.trigger_type === 'time_delay') && (
                <div>
                  <Label htmlFor="trigger_value">
                    {formData.trigger_type === 'scroll_percentage' ? 'Scroll Percentage' : 'Delay (seconds)'}
                  </Label>
                  <Input
                    id="trigger_value"
                    type="number"
                    value={formData.trigger_value}
                    onChange={(e) => handleInputChange('trigger_value', parseInt(e.target.value))}
                    placeholder={formData.trigger_type === 'scroll_percentage' ? '50' : '5'}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Appearance & Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Brand Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Brand Presets</Label>
                <div className="grid gap-2">
                  {brandPresets.map((preset, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyBrandPreset(preset)}
                      className="h-16 p-3 justify-start text-left hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: preset.background_color }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: preset.button_color }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{preset.name}</div>
                          <div className="text-xs text-muted-foreground">{preset.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="background_color">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background_color"
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      className="flex-1"
                      placeholder="#1B2B3C"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="text_color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text_color"
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => handleInputChange('text_color', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={formData.text_color}
                      onChange={(e) => handleInputChange('text_color', e.target.value)}
                      className="flex-1"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="button_color">Button Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_color"
                      type="color"
                      value={formData.button_color}
                      onChange={(e) => handleInputChange('button_color', e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={formData.button_color}
                      onChange={(e) => handleInputChange('button_color', e.target.value)}
                      className="flex-1"
                      placeholder="#FF6B00"
                    />
                  </div>
                </div>
              </div>

              {/* Popup Size */}
              <div>
                <Label htmlFor="popup_size">Popup Size</Label>
                <Select
                  value={formData.popup_size}
                  onValueChange={(value) => handleInputChange('popup_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact (Mobile-friendly)</SelectItem>
                    <SelectItem value="standard">Standard (Recommended)</SelectItem>
                    <SelectItem value="large">Large (Desktop focus)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Compact is best for mobile traffic, Standard for general use
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Target Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Target Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={newPage} onValueChange={setNewPage}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a page or enter custom path" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonPages.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addTargetPage} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newPage}
                  onChange={(e) => setNewPage(e.target.value)}
                  placeholder="Or enter custom path (e.g., /custom-page)"
                />
                <Button type="button" onClick={addTargetPage} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.target_pages.map((page) => (
                  <Badge key={page} variant="secondary" className="flex items-center gap-1">
                    {page}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTargetPage(page)}
                    />
                  </Badge>
                ))}
              </div>
              
              {formData.target_pages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No pages selected - offer will show on all pages
                </p>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max_displays">Max Displays per User</Label>
                <Input
                  id="max_displays"
                  type="number"
                  value={formData.max_displays_per_user}
                  onChange={(e) => handleInputChange('max_displays_per_user', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="expires_at">Expiry Date (optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at ? new Date(formData.expires_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="redirect_url">Redirect URL (Optional)</Label>
                <Input
                  id="redirect_url"
                  type="url"
                  value={formData.redirect_url || ''}
                  onChange={(e) => handleInputChange('redirect_url', e.target.value || null)}
                  placeholder="https://example.com/special-offer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Users will be redirected here after claiming the offer
                </p>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {promotion ? 'Update Promotion' : 'Create Promotion'}
        </Button>
      </div>
    </div>
  );
};
