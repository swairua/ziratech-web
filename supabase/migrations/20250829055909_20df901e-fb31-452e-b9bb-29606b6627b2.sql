
-- 1) Allow users to SELECT their own role rows to break circular dependency in has_role/is_admin
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2) Optional but recommended: auto-set author_id on insert for portfolio_projects
CREATE OR REPLACE FUNCTION public.set_portfolio_author()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.author_id IS NULL THEN
    NEW.author_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portfolio_projects_set_author ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_set_author
  BEFORE INSERT ON public.portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_portfolio_author();
