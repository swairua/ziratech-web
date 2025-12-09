
-- 1) Promotions: add theme and popup_size for consistent styling and sizing
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'brand',
  ADD COLUMN IF NOT EXISTS popup_size text NOT NULL DEFAULT 'standard';

-- Ensure promo codes are unique when present
CREATE UNIQUE INDEX IF NOT EXISTS promotions_code_unique_not_null
  ON public.promotions (code)
  WHERE code IS NOT NULL;

-- 2) Offer events: capture code, affiliate code, and flexible metadata
ALTER TABLE public.offer_events
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS affiliate_code text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Helpful index for analytics queries
CREATE INDEX IF NOT EXISTS offer_events_promotion_event_time_idx
  ON public.offer_events (promotion_id, event_type, created_at DESC);

-- 3) Form submissions: accept codes and attribution data
ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS promotion_id uuid REFERENCES public.promotions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS affiliate_code text,
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS attribution jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS form_submissions_promo_idx
  ON public.form_submissions (promo_code);

CREATE INDEX IF NOT EXISTS form_submissions_affiliate_idx
  ON public.form_submissions (affiliate_code);

-- 4) Affiliates: simple table to manage partner codes
CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  contact_email text,
  commission_rate numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Allow only admins to manage and view affiliates
CREATE POLICY "Admins can manage affiliates"
  ON public.affiliates
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
