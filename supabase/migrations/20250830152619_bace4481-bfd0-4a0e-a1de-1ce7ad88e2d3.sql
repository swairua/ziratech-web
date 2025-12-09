-- Create marketing settings table for cookie and pixel management
CREATE TABLE IF NOT EXISTS public.marketing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage marketing settings"
  ON public.marketing_settings
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Insert default marketing settings
INSERT INTO public.marketing_settings (setting_key, setting_value, is_active) VALUES
  ('cookie_consent', '{
    "enabled": true,
    "categories": {
      "necessary": {"name": "Necessary", "description": "Essential cookies for website functionality", "required": true},
      "analytics": {"name": "Analytics", "description": "Help us understand how visitors use our website", "required": false},
      "marketing": {"name": "Marketing", "description": "Used to track visitors and display relevant ads", "required": false}
    },
    "banner_text": "We use cookies to enhance your experience and analyze our traffic.",
    "accept_all_text": "Accept All",
    "reject_all_text": "Reject All",
    "manage_text": "Manage Preferences"
  }', true),
  ('social_pixels', '{
    "facebook_pixel": {"id": "", "enabled": false},
    "google_analytics": {"id": "", "enabled": false},
    "linkedin_insight": {"id": "", "enabled": false},
    "twitter_pixel": {"id": "", "enabled": false}
  }', true),
  ('conversion_tracking', '{
    "track_form_submissions": true,
    "track_page_views": true,
    "track_button_clicks": true,
    "track_file_downloads": true
  }', true);

-- Create user consent tracking table
CREATE TABLE IF NOT EXISTS public.user_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  ip_address inet,
  user_agent text,
  consent_categories jsonb NOT NULL DEFAULT '{}',
  consent_timestamp timestamptz NOT NULL DEFAULT now(),
  last_updated timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage their own consent"
  ON public.user_consent
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_consent_session_idx ON public.user_consent (session_id);
CREATE INDEX IF NOT EXISTS user_consent_timestamp_idx ON public.user_consent (consent_timestamp DESC);