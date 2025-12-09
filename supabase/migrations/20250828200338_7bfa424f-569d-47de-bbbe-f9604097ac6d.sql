
-- 1) Create enum for project status if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM ('draft','published','archived');
  END IF;
END $$;

-- 2) Create portfolio_projects table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL,
  description text,
  client text,
  industry text,
  country text,
  year integer,
  status public.project_status NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  featured_order integer,
  cover_image_url text,
  gallery_urls text[],
  live_url text,
  repo_url text,
  results_summary text,
  metrics jsonb,
  technologies text[],
  tags text[],
  author_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Enable RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- 4) Policies
-- Anyone (including anon) can view published projects
CREATE POLICY "Anyone can view published portfolio projects"
  ON public.portfolio_projects
  FOR SELECT
  USING (
    status = 'published'::public.project_status
    OR has_role(auth.uid(), 'admin'::user_role)
    OR has_role(auth.uid(), 'editor'::user_role)
  );

-- Admins and Editors can insert
CREATE POLICY "Admins and editors can insert portfolio projects"
  ON public.portfolio_projects
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'editor'::user_role));

-- Admins and Editors can update
CREATE POLICY "Admins and editors can update portfolio projects"
  ON public.portfolio_projects
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'editor'::user_role));

-- Admins and Editors can delete
CREATE POLICY "Admins and editors can delete portfolio projects"
  ON public.portfolio_projects
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'editor'::user_role));

-- 5) Trigger to maintain updated_at
DROP TRIGGER IF EXISTS set_updated_at_on_portfolio_projects ON public.portfolio_projects;

CREATE TRIGGER set_updated_at_on_portfolio_projects
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Helpful indexes
-- slug unique is enforced by constraint; add status/created/featured indexes
CREATE INDEX IF NOT EXISTS portfolio_projects_status_idx ON public.portfolio_projects (status);
CREATE INDEX IF NOT EXISTS portfolio_projects_created_at_idx ON public.portfolio_projects (created_at DESC);
CREATE INDEX IF NOT EXISTS portfolio_projects_featureed_idx ON public.portfolio_projects (featured, featured_order NULLS LAST);
