-- Add public read policy for marketing settings (needed for cookie banner)
CREATE POLICY "Public can read marketing settings" 
ON public.marketing_settings 
FOR SELECT 
USING (true);

-- Add Twitter/X pixel to default marketing settings if not exists
INSERT INTO public.marketing_settings (setting_key, setting_value, is_active)
VALUES 
  ('social_pixels', '{
    "google_analytics_id": "",
    "facebook_pixel_id": "",
    "linkedin_insight_id": "",
    "twitter_pixel_id": "",
    "tiktok_pixel_id": "",
    "google_ads_id": ""
  }', true),
  ('cookie_consent', '{
    "enabled": true,
    "banner_text": "We use cookies to enhance your browsing experience and analyze our traffic. By clicking Accept All, you consent to our use of cookies.",
    "learn_more_url": "/privacy-policy",
    "accept_button_text": "Accept All",
    "reject_button_text": "Reject All",
    "manage_button_text": "Manage Preferences",
    "categories": {
      "necessary": {
        "name": "Necessary",
        "description": "Essential cookies for website functionality",
        "required": true
      },
      "analytics": {
        "name": "Analytics",
        "description": "Help us understand how visitors interact with our website",
        "required": false
      },
      "marketing": {
        "name": "Marketing",
        "description": "Used to track visitors and display relevant ads",
        "required": false
      }
    }
  }', true)
ON CONFLICT (setting_key) DO NOTHING;