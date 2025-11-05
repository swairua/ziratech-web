-- Create enum for promotion status
CREATE TYPE promotion_status AS ENUM ('draft', 'active', 'paused', 'expired');

-- Create enum for promotion trigger types
CREATE TYPE promotion_trigger AS ENUM ('page_load', 'exit_intent', 'scroll_percentage', 'time_delay');

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  offer_text TEXT NOT NULL,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  code TEXT,
  background_color TEXT DEFAULT '#FF6B6B',
  text_color TEXT DEFAULT '#FFFFFF',
  button_color TEXT DEFAULT '#4ECDC4',
  button_text TEXT DEFAULT 'Claim Offer',
  trigger_type promotion_trigger NOT NULL DEFAULT 'page_load',
  trigger_value INTEGER DEFAULT 0, -- seconds for delay, percentage for scroll
  target_pages TEXT[] DEFAULT '{}', -- array of page paths
  max_displays_per_user INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE,
  status promotion_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer_events table for tracking
CREATE TABLE public.offer_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- 'displayed', 'clicked', 'closed', 'converted'
  page_path TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promotions
CREATE POLICY "Admins can manage promotions" 
ON public.promotions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Public can view active promotions" 
ON public.promotions 
FOR SELECT 
USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for offer_events
CREATE POLICY "Admins can view all offer events" 
ON public.offer_events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "System can insert offer events" 
ON public.offer_events 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_promotions_status_expires ON public.promotions(status, expires_at);
CREATE INDEX idx_promotions_target_pages ON public.promotions USING GIN(target_pages);
CREATE INDEX idx_offer_events_promotion_session ON public.offer_events(promotion_id, session_id);
CREATE INDEX idx_offer_events_created_at ON public.offer_events(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample promotions
INSERT INTO public.promotions (title, description, offer_text, discount_percentage, code, trigger_type, target_pages, status) VALUES
('Welcome Offer', 'Get started with our premium services', '10% OFF Your First Project', 10, 'WELCOME10', 'page_load', '{"/"}', 'active'),
('ZiraHomes Special', 'Exclusive discount for rental management software', '15% OFF ZiraHomes Setup', 15, 'HOMES15', 'exit_intent', '{"/zira-homes"}', 'active'),
('Web Development Deal', 'Limited time offer for web development services', '20% OFF Custom Websites', 20, 'WEB20', 'scroll_percentage', '{"/zira-web"}', 'active');