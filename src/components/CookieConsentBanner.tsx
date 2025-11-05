import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Settings, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConsentCategories {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface MarketingSettings {
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

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [settings, setSettings] = useState<MarketingSettings | null>(null);
  const [preferences, setPreferences] = useState<ConsentCategories>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  const sessionId = sessionStorage.getItem('session_id') || 
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem('session_id', id);
      return id;
    })();

  useEffect(() => {
    loadSettings();
    checkExistingConsent();
  }, []);

  // Cache settings to avoid repeated DB calls
  const [settingsCache, setSettingsCache] = useState<Map<string, any>>(new Map());

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('marketing_settings')
        .select('setting_value')
        .eq('setting_key', 'cookie_consent')
        .eq('is_active', true)
        .single();

      if (data) {
        setSettings(data.setting_value as unknown as MarketingSettings);
      }
    } catch (error) {
      console.error('Error loading cookie settings:', error);
    }
  };

  const checkExistingConsent = () => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      const parsed = JSON.parse(consent);
      setConsentGiven(true);
      setPreferences(parsed.categories);
      loadTrackingPixels(parsed.categories);
    } else {
      setShowBanner(true);
    }
  };

  const saveConsent = async (categories: ConsentCategories) => {
    const consentData = {
      categories,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // Save to localStorage
    localStorage.setItem('cookie_consent', JSON.stringify(consentData));

    // Save to database
    try {
      // First, try to update existing record
      const { data: existingData } = await supabase
        .from('user_consent')
        .select('id')
        .eq('session_id', sessionId)
        .gte('last_updated', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Within last 30 minutes
        .maybeSingle();

      if (existingData) {
        // Update existing record
        await supabase
          .from('user_consent')
          .update({
            consent_categories: categories as any,
            user_agent: navigator.userAgent,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingData.id);
      } else {
        // Insert new record
        await supabase
          .from('user_consent')
          .insert({
            session_id: sessionId,
            consent_categories: categories as any,
            user_agent: navigator.userAgent,
            ip_address: null, // Let the server determine this for security
            consent_timestamp: new Date().toISOString(),
            last_updated: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error saving consent to database:', error);
      // Continue anyway - consent is still saved to localStorage
    }

    setConsentGiven(true);
    setPreferences(categories);
    setShowBanner(false);
    setShowPreferences(false);
    loadTrackingPixels(categories);
  };

  const loadTrackingPixels = async (categories: ConsentCategories) => {
    if (!categories.analytics && !categories.marketing) return;

    try {
      const { data } = await supabase
        .from('marketing_settings')
        .select('setting_value')
        .eq('setting_key', 'social_pixels')
        .eq('is_active', true)
        .single();

      if (data) {
        const pixels = data.setting_value as any;
        
        // Load Google Analytics if analytics enabled
        if (categories.analytics && pixels.google_analytics?.enabled && pixels.google_analytics?.id) {
          loadGoogleAnalytics(pixels.google_analytics.id);
        }

        // Load Facebook Pixel if marketing enabled
        if (categories.marketing && pixels.facebook_pixel?.enabled && pixels.facebook_pixel?.id) {
          loadFacebookPixel(pixels.facebook_pixel.id);
        }

        // Load LinkedIn Insight Tag if marketing enabled
        if (categories.marketing && pixels.linkedin_insight?.enabled && pixels.linkedin_insight?.id) {
          loadLinkedInInsight(pixels.linkedin_insight.id);
        }

        // Load Twitter/X Pixel if marketing enabled
        if (categories.marketing && pixels.twitter_pixel?.enabled && pixels.twitter_pixel?.id) {
          loadTwitterPixel(pixels.twitter_pixel.id);
        }

        // Load TikTok Pixel if marketing enabled
        if (categories.marketing && pixels.tiktok_pixel?.enabled && pixels.tiktok_pixel?.id) {
          loadTikTokPixel(pixels.tiktok_pixel.id);
        }

        // Load Google Ads if marketing enabled
        if (categories.marketing && pixels.google_ads?.enabled && pixels.google_ads?.id) {
          loadGoogleAds(pixels.google_ads.id);
        }
      }
    } catch (error) {
      console.error('Error loading tracking pixels:', error);
    }
  };

  const loadGoogleAnalytics = (trackingId: string) => {
    // Validate tracking ID format (stricter validation)
    if (!/^G-[A-Z0-9]{10}$/.test(trackingId) && !/^UA-\d{4,12}-\d+$/.test(trackingId)) {
      console.error('Invalid Google Analytics tracking ID format');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(trackingId)}`;
    script.async = true;
    document.head.appendChild(script);

    const configScript = document.createElement('script');
    configScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId.replace(/['"]/g, '')}');
    `;
    document.head.appendChild(configScript);
  };

  const loadFacebookPixel = (pixelId: string) => {
    // Validate pixel ID format (stricter validation)
    if (!/^\d{10,20}$/.test(pixelId)) {
      console.error('Invalid Facebook Pixel ID format');
      return;
    }

    const script = document.createElement('script');
    script.textContent = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId.replace(/['"]/g, '')}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  };

  const loadLinkedInInsight = (partnerId: string) => {
    // Validate LinkedIn partner ID format
    if (!/^\d{6,12}$/.test(partnerId)) {
      console.error('Invalid LinkedIn Insight Tag partner ID format');
      return;
    }
    
    const script = document.createElement('script');
    script.innerHTML = `
      _linkedin_partner_id = "${partnerId.replace(/['"]/g, '')}";
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(_linkedin_partner_id);
    `;
    document.head.appendChild(script);

    const trackingScript = document.createElement('script');
    trackingScript.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    trackingScript.async = true;
    document.head.appendChild(trackingScript);
  };

  const loadTwitterPixel = (pixelId: string) => {
    // Validate Twitter pixel ID format
    if (!/^[a-z0-9]{5,10}$/.test(pixelId)) {
      console.error('Invalid Twitter/X Pixel ID format');
      return;
    }
    
    const script = document.createElement('script');
    script.innerHTML = `
      !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
      },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
      a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
      twq('init', '${pixelId.replace(/['"]/g, '')}');
      twq('track', 'PageView');
    `;
    document.head.appendChild(script);
  };

  const loadTikTokPixel = (pixelId: string) => {
    // Validate TikTok pixel ID format
    if (!/^[A-Z0-9]{15,25}$/.test(pixelId)) {
      console.error('Invalid TikTok Pixel ID format');
      return;
    }
    
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId.replace(/['"]/g, '')}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
  };

  const loadGoogleAds = (conversionId: string) => {
    // Validate Google Ads conversion ID format
    if (!/^AW-\d{8,12}$/.test(conversionId)) {
      console.error('Invalid Google Ads conversion ID format');
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(conversionId)}`;
    script.async = true;
    document.head.appendChild(script);

    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${conversionId.replace(/['"]/g, '')}');
    `;
    document.head.appendChild(configScript);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handlePreferenceChange = (category: keyof ConsentCategories, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  if (!settings?.enabled || consentGiven) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg">
          <div className="container mx-auto max-w-6xl">
            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Cookie className="h-6 w-6 text-brand-orange flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {settings.banner_text}
                      </p>
                      <button
                        onClick={() => setShowPreferences(true)}
                        className="text-brand-orange text-sm underline hover:no-underline mt-1"
                      >
                        Learn more about our cookies
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRejectAll}
                      className="text-sm"
                    >
                      {settings.reject_all_text}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreferences(true)}
                      className="text-sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {settings.manage_text}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAcceptAll}
                      className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm"
                    >
                      {settings.accept_all_text}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Cookie Preferences Modal */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-brand-orange" />
              Cookie Preferences
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience and analyze our traffic. 
              Choose which types of cookies you'd like to accept.
            </p>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="font-semibold text-brand-navy">
                      {settings.categories.necessary.name}
                    </Label>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Required
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {settings.categories.necessary.description}
                  </p>
                </div>
                <Switch
                  checked={true}
                  disabled={true}
                  className="ml-4"
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="font-semibold text-brand-navy mb-2 block">
                    {settings.categories.analytics.name}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {settings.categories.analytics.description}
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                  className="ml-4"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="font-semibold text-brand-navy mb-2 block">
                    {settings.categories.marketing.name}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {settings.categories.marketing.description}
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                  className="ml-4"
                />
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleRejectAll}
              >
                Reject All
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsentBanner;