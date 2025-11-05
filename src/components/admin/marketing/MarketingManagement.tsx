import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Cookie, 
  BarChart, 
  Target, 
  Settings, 
  Save, 
  Eye,
  Facebook,
  Linkedin,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CookieSettings {
  enabled: boolean;
  categories: {
    necessary: { name: string; description: string; required: boolean };
    analytics: { name: string; description: string; required: boolean };
    marketing: { name: string; description: string; required: boolean };
  };
  banner_text: string;
  accept_all_text: string;
  reject_all_text: string;
  manage_text: string;
}

interface SocialPixels {
  facebook_pixel: { id: string; enabled: boolean };
  google_analytics: { id: string; enabled: boolean };
  linkedin_insight: { id: string; enabled: boolean };
  twitter_pixel: { id: string; enabled: boolean };
  tiktok_pixel: { id: string; enabled: boolean };
  google_ads: { id: string; enabled: boolean };
}

interface ConversionTracking {
  track_form_submissions: boolean;
  track_page_views: boolean;
  track_button_clicks: boolean;
  track_file_downloads: boolean;
}

const MarketingManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    enabled: true,
    categories: {
      necessary: { name: "Necessary", description: "Essential cookies for website functionality", required: true },
      analytics: { name: "Analytics", description: "Help us understand how visitors use our website", required: false },
      marketing: { name: "Marketing", description: "Used to track visitors and display relevant ads", required: false }
    },
    banner_text: "We use cookies to enhance your experience and analyze our traffic.",
    accept_all_text: "Accept All",
    reject_all_text: "Reject All",
    manage_text: "Manage Preferences"
  });

  const [socialPixels, setSocialPixels] = useState<SocialPixels>({
    facebook_pixel: { id: "", enabled: false },
    google_analytics: { id: "", enabled: false },
    linkedin_insight: { id: "", enabled: false },
    twitter_pixel: { id: "", enabled: false },
    tiktok_pixel: { id: "", enabled: false },
    google_ads: { id: "", enabled: false }
  });

  const [conversionTracking, setConversionTracking] = useState<ConversionTracking>({
    track_form_submissions: true,
    track_page_views: true,
    track_button_clicks: true,
    track_file_downloads: true
  });

  const [consentStats, setConsentStats] = useState({
    total_visitors: 0,
    accepted_all: 0,
    accepted_analytics: 0,
    accepted_marketing: 0,
    rejected_all: 0
  });

  useEffect(() => {
    loadSettings();
    loadConsentStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('marketing_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['cookie_consent', 'social_pixels', 'conversion_tracking']);

      if (settings) {
        settings.forEach(setting => {
          if (setting.setting_value && typeof setting.setting_value === 'object') {
            switch (setting.setting_key) {
              case 'cookie_consent':
                setCookieSettings(prev => ({ ...prev, ...setting.setting_value as Partial<CookieSettings> }));
                break;
              case 'social_pixels':
                setSocialPixels(prev => ({ ...prev, ...setting.setting_value as Partial<SocialPixels> }));
                break;
              case 'conversion_tracking':
                setConversionTracking(prev => ({ ...prev, ...setting.setting_value as Partial<ConversionTracking> }));
                break;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading marketing settings:', error);
      toast({
        title: "Error",
        description: "Failed to load marketing settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConsentStats = async () => {
    try {
      const { data } = await supabase
        .from('user_consent')
        .select('consent_categories');

      if (data) {
        const stats = data.reduce((acc, record) => {
          const categories = record.consent_categories as any;
          acc.total_visitors++;
          
          if (categories.analytics && categories.marketing) {
            acc.accepted_all++;
          } else if (!categories.analytics && !categories.marketing) {
            acc.rejected_all++;
          }
          
          if (categories.analytics) acc.accepted_analytics++;
          if (categories.marketing) acc.accepted_marketing++;
          
          return acc;
        }, {
          total_visitors: 0,
          accepted_all: 0,
          accepted_analytics: 0,
          accepted_marketing: 0,
          rejected_all: 0
        });

        setConsentStats(stats);
      }
    } catch (error) {
      console.error('Error loading consent stats:', error);
    }
  };

  const extractPixelId = (input: string, pixelType: string): string => {
    if (!input.trim()) return '';
    
    // If it's already just an ID (numbers/alphanumeric), return as-is
    if (/^[a-zA-Z0-9-_]+$/.test(input.trim())) {
      return input.trim();
    }
    
    // Extract ID from various pixel code formats
    const patterns = {
      facebook: /fbq\('init',\s*['"]([^'"]+)['"]\)|id=([a-zA-Z0-9]+)/,
      google_analytics: /gtag\('config',\s*['"]([^'"]+)['"]\)|UA-[\d-]+|G-[A-Z0-9]+/,
      linkedin: /partner_id=(\d+)/,
      twitter: /twq\('init',\s*['"]([^'"]+)['"]\)/,
      tiktok: /ttq\.load\(['"]([^'"]+)['"]\)/,
      google_ads: /gtag\('config',\s*['"]AW-([^'"]+)['"]\)/
    };
    
    const pattern = patterns[pixelType as keyof typeof patterns];
    if (pattern) {
      const match = input.match(pattern);
      if (match) {
        return match[1] || match[2] || match[0];
      }
    }
    
    return input.trim();
  };

  const validatePixelId = (id: string, pixelType: string): boolean => {
    if (!id) return true; // Empty is valid
    
    const patterns = {
      facebook: /^\d{15,16}$/,
      google_analytics: /^(UA-\d+-\d+|G-[A-Z0-9]+)$/,
      linkedin: /^\d+$/,
      twitter: /^[a-zA-Z0-9]+$/,
      tiktok: /^[A-Z0-9]+$/,
      google_ads: /^\d+$/
    };
    
    const pattern = patterns[pixelType as keyof typeof patterns];
    return pattern ? pattern.test(id) : true;
  };

  const testPixel = (pixelType: string, pixelId: string) => {
    if (!pixelId || process.env.NODE_ENV !== 'development') return;
    
    try {
      switch (pixelType) {
        case 'facebook':
          if ((window as any).fbq) (window as any).fbq('track', 'PageView');
          break;
        case 'google_analytics':
          if ((window as any).gtag) (window as any).gtag('event', 'page_view');
          break;
        // Add other pixel tests as needed
      }
      toast({
        title: "Test Successful",
        description: `${pixelType} pixel test fired`
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: `Failed to test ${pixelType} pixel`,
        variant: "destructive"
      });
    }
  };

  const handlePixelIdChange = (pixelType: string, input: string) => {
    const extractedId = extractPixelId(input, pixelType);
    setSocialPixels(prev => ({
      ...prev,
      [`${pixelType}_pixel`]: { 
        ...prev[`${pixelType}_pixel` as keyof SocialPixels], 
        id: extractedId 
      }
    }));
  };

  const getPixelValidationState = (pixelType: string, id: string) => {
    if (!id) return null;
    return validatePixelId(id, pixelType);
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('marketing_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          is_active: true
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Marketing settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving marketing setting:', error);
      toast({
        title: "Error",
        description: "Failed to save marketing settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCookieSettings = () => {
    saveSetting('cookie_consent', cookieSettings);
  };

  const handleSavePixelSettings = () => {
    saveSetting('social_pixels', socialPixels);
  };

  const handleSaveTrackingSettings = () => {
    saveSetting('conversion_tracking', conversionTracking);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-navy">Marketing Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage cookie consent, tracking pixels, and marketing analytics
        </p>
      </div>

      <Tabs defaultValue="cookies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cookies" className="flex items-center gap-2">
            <Cookie className="h-4 w-4" />
            Cookies
          </TabsTrigger>
          <TabsTrigger value="pixels" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Pixels
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Cookie Management */}
        <TabsContent value="cookies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-brand-orange" />
                Cookie Consent Settings
              </CardTitle>
              <CardDescription>
                Configure cookie consent banner and categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Cookie Consent</Label>
                  <p className="text-sm text-muted-foreground">Show cookie consent banner to visitors</p>
                </div>
                <Switch
                  checked={cookieSettings.enabled}
                  onCheckedChange={(checked) => 
                    setCookieSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Banner Text Configuration</Label>
                
                <div>
                  <Label htmlFor="banner-text">Banner Message</Label>
                  <Textarea
                    id="banner-text"
                    value={cookieSettings.banner_text}
                    onChange={(e) => 
                      setCookieSettings(prev => ({ ...prev, banner_text: e.target.value }))
                    }
                    placeholder="Enter the main message for the cookie banner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="accept-text">Accept All Button</Label>
                    <Input
                      id="accept-text"
                      value={cookieSettings.accept_all_text}
                      onChange={(e) => 
                        setCookieSettings(prev => ({ ...prev, accept_all_text: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="reject-text">Reject All Button</Label>
                    <Input
                      id="reject-text"
                      value={cookieSettings.reject_all_text}
                      onChange={(e) => 
                        setCookieSettings(prev => ({ ...prev, reject_all_text: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="manage-text">Manage Preferences Button</Label>
                    <Input
                      id="manage-text"
                      value={cookieSettings.manage_text}
                      onChange={(e) => 
                        setCookieSettings(prev => ({ ...prev, manage_text: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Cookie Categories</Label>
                
                {Object.entries(cookieSettings.categories).map(([key, category]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{category.name}</Label>
                        {category.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={category.description}
                      onChange={(e) => 
                        setCookieSettings(prev => ({
                          ...prev,
                          categories: {
                            ...prev.categories,
                            [key]: { ...category, description: e.target.value }
                          }
                        }))
                      }
                      placeholder="Describe what this category of cookies does"
                      rows={2}
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveCookieSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Cookie Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Pixels */}
        <TabsContent value="pixels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-orange" />
                Social Media Pixels
              </CardTitle>
              <CardDescription>
                Configure tracking pixels for advertising platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Facebook Pixel */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <Label className="font-medium">Facebook Pixel</Label>
                  </div>
                  <Switch
                    checked={socialPixels.facebook_pixel.enabled}
                    onCheckedChange={(checked) => 
                      setSocialPixels(prev => ({
                        ...prev,
                        facebook_pixel: { ...prev.facebook_pixel, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter Facebook Pixel ID (e.g., 2213658662472790) or paste full pixel code"
                      value={socialPixels.facebook_pixel.id}
                      onChange={(e) => handlePixelIdChange('facebook', e.target.value)}
                      className={!getPixelValidationState('facebook', socialPixels.facebook_pixel.id) && socialPixels.facebook_pixel.id ? 'border-red-500' : ''}
                    />
                    {socialPixels.facebook_pixel.id && getPixelValidationState('facebook', socialPixels.facebook_pixel.id) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {socialPixels.facebook_pixel.id && !getPixelValidationState('facebook', socialPixels.facebook_pixel.id) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {process.env.NODE_ENV === 'development' && socialPixels.facebook_pixel.id && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => testPixel('facebook', socialPixels.facebook_pixel.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter only the 15-16 digit ID, or paste the full script code and we'll extract the ID automatically
                  </p>
                </div>
              </div>

              {/* Google Analytics */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <Label className="font-medium">Google Analytics</Label>
                  </div>
                  <Switch
                    checked={socialPixels.google_analytics.enabled}
                    onCheckedChange={(checked) => 
                      setSocialPixels(prev => ({
                        ...prev,
                        google_analytics: { ...prev.google_analytics, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter Google Analytics ID (e.g., G-XXXXXXXXXX or UA-XXXXX-X) or paste tracking code"
                      value={socialPixels.google_analytics.id}
                      onChange={(e) => handlePixelIdChange('google_analytics', e.target.value)}
                      className={!getPixelValidationState('google_analytics', socialPixels.google_analytics.id) && socialPixels.google_analytics.id ? 'border-red-500' : ''}
                    />
                    {socialPixels.google_analytics.id && getPixelValidationState('google_analytics', socialPixels.google_analytics.id) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {socialPixels.google_analytics.id && !getPixelValidationState('google_analytics', socialPixels.google_analytics.id) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {process.env.NODE_ENV === 'development' && socialPixels.google_analytics.id && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => testPixel('google_analytics', socialPixels.google_analytics.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the tracking ID (G-XXXXXXXXXX for GA4 or UA-XXXXX-X for Universal Analytics)
                  </p>
                </div>
              </div>

              {/* LinkedIn Insight */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <Label className="font-medium">LinkedIn Insight Tag</Label>
                  </div>
                  <Switch
                    checked={socialPixels.linkedin_insight.enabled}
                    onCheckedChange={(checked) => 
                      setSocialPixels(prev => ({
                        ...prev,
                        linkedin_insight: { ...prev.linkedin_insight, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter LinkedIn Partner ID (e.g., 123456) or paste insight tag code"
                      value={socialPixels.linkedin_insight.id}
                      onChange={(e) => handlePixelIdChange('linkedin', e.target.value)}
                      className={!getPixelValidationState('linkedin', socialPixels.linkedin_insight.id) && socialPixels.linkedin_insight.id ? 'border-red-500' : ''}
                    />
                    {socialPixels.linkedin_insight.id && getPixelValidationState('linkedin', socialPixels.linkedin_insight.id) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {socialPixels.linkedin_insight.id && !getPixelValidationState('linkedin', socialPixels.linkedin_insight.id) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the numeric Partner ID from your LinkedIn Campaign Manager
                  </p>
                </div>
              </div>

              {/* Twitter/X Pixel */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 text-black font-bold text-lg">𝕏</span>
                    <Label className="font-medium">Twitter/X Pixel</Label>
                  </div>
                  <Switch
                    checked={socialPixels.twitter_pixel.enabled}
                    onCheckedChange={(checked) => 
                      setSocialPixels(prev => ({
                        ...prev,
                        twitter_pixel: { ...prev.twitter_pixel, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter Twitter Pixel ID (e.g., o1234) or paste pixel code"
                      value={socialPixels.twitter_pixel.id}
                      onChange={(e) => handlePixelIdChange('twitter', e.target.value)}
                      className={!getPixelValidationState('twitter', socialPixels.twitter_pixel.id) && socialPixels.twitter_pixel.id ? 'border-red-500' : ''}
                    />
                    {socialPixels.twitter_pixel.id && getPixelValidationState('twitter', socialPixels.twitter_pixel.id) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {socialPixels.twitter_pixel.id && !getPixelValidationState('twitter', socialPixels.twitter_pixel.id) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the Twitter Pixel ID from your X/Twitter Ads Manager
                  </p>
                </div>
              </div>

              {/* TikTok Pixel */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">T</span>
                    <Label className="font-medium">TikTok Pixel</Label>
                  </div>
                  <Switch
                    checked={socialPixels.tiktok_pixel.enabled}
                    onCheckedChange={(checked) => 
                      setSocialPixels(prev => ({
                        ...prev,
                        tiktok_pixel: { ...prev.tiktok_pixel, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter TikTok Pixel ID (e.g., C4A4N4F2CBOBR4S4E1OG) or paste pixel code"
                      value={socialPixels.tiktok_pixel.id}
                      onChange={(e) => handlePixelIdChange('tiktok', e.target.value)}
                      className={!getPixelValidationState('tiktok', socialPixels.tiktok_pixel.id) && socialPixels.tiktok_pixel.id ? 'border-red-500' : ''}
                    />
                    {socialPixels.tiktok_pixel.id && getPixelValidationState('tiktok', socialPixels.tiktok_pixel.id) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {socialPixels.tiktok_pixel.id && !getPixelValidationState('tiktok', socialPixels.tiktok_pixel.id) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the TikTok Pixel ID from your TikTok Business Manager
                  </p>
                </div>
              </div>

              {/* Google Ads */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <Label className="font-medium">Google Ads</Label>
                  </div>
                  <Switch
                    checked={socialPixels.google_ads.enabled}
                    onCheckedChange={(checked) => 
                      setSocialPixels(prev => ({
                        ...prev,
                        google_ads: { ...prev.google_ads, enabled: checked }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter Google Ads Conversion ID (e.g., 123456789) or paste conversion tracking code"
                      value={socialPixels.google_ads.id}
                      onChange={(e) => handlePixelIdChange('google_ads', e.target.value)}
                      className={!getPixelValidationState('google_ads', socialPixels.google_ads.id) && socialPixels.google_ads.id ? 'border-red-500' : ''}
                    />
                    {socialPixels.google_ads.id && getPixelValidationState('google_ads', socialPixels.google_ads.id) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {socialPixels.google_ads.id && !getPixelValidationState('google_ads', socialPixels.google_ads.id) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the numeric Conversion ID from your Google Ads account
                  </p>
                </div>
              </div>

              <Button onClick={handleSavePixelSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Pixel Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Tracking */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-brand-orange" />
                Conversion Tracking
              </CardTitle>
              <CardDescription>
                Configure what events to track for conversion analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Form Submissions</Label>
                    <p className="text-sm text-muted-foreground">Track when users submit contact forms</p>
                  </div>
                  <Switch
                    checked={conversionTracking.track_form_submissions}
                    onCheckedChange={(checked) => 
                      setConversionTracking(prev => ({ ...prev, track_form_submissions: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Page Views</Label>
                    <p className="text-sm text-muted-foreground">Track page visits and navigation</p>
                  </div>
                  <Switch
                    checked={conversionTracking.track_page_views}
                    onCheckedChange={(checked) => 
                      setConversionTracking(prev => ({ ...prev, track_page_views: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Button Clicks</Label>
                    <p className="text-sm text-muted-foreground">Track important button interactions</p>
                  </div>
                  <Switch
                    checked={conversionTracking.track_button_clicks}
                    onCheckedChange={(checked) => 
                      setConversionTracking(prev => ({ ...prev, track_button_clicks: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">File Downloads</Label>
                    <p className="text-sm text-muted-foreground">Track PDF downloads and file access</p>
                  </div>
                  <Switch
                    checked={conversionTracking.track_file_downloads}
                    onCheckedChange={(checked) => 
                      setConversionTracking(prev => ({ ...prev, track_file_downloads: checked }))
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveTrackingSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Tracking Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{consentStats.total_visitors}</div>
                <p className="text-xs text-muted-foreground">Unique sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Accepted All</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{consentStats.accepted_all}</div>
                <p className="text-xs text-muted-foreground">
                  {consentStats.total_visitors > 0 
                    ? `${Math.round((consentStats.accepted_all / consentStats.total_visitors) * 100)}% of visitors`
                    : '0% of visitors'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Analytics Consent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{consentStats.accepted_analytics}</div>
                <p className="text-xs text-muted-foreground">
                  {consentStats.total_visitors > 0 
                    ? `${Math.round((consentStats.accepted_analytics / consentStats.total_visitors) * 100)}% consent`
                    : '0% consent'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Marketing Consent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{consentStats.accepted_marketing}</div>
                <p className="text-xs text-muted-foreground">
                  {consentStats.total_visitors > 0 
                    ? `${Math.round((consentStats.accepted_marketing / consentStats.total_visitors) * 100)}% consent`
                    : '0% consent'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rejected All</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{consentStats.rejected_all}</div>
                <p className="text-xs text-muted-foreground">
                  {consentStats.total_visitors > 0 
                    ? `${Math.round((consentStats.rejected_all / consentStats.total_visitors) * 100)}% rejected`
                    : '0% rejected'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Consent Overview</CardTitle>
              <CardDescription>
                Monitor how users are responding to cookie consent requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Consent Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {consentStats.total_visitors > 0 
                      ? `${Math.round(((consentStats.accepted_analytics + consentStats.accepted_marketing) / (consentStats.total_visitors * 2)) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  A higher consent rate indicates users trust your privacy practices and are willing to share data for improved experiences.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingManagement;