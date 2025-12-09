-- 1) Ensure profiles are auto-created on signup via trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Keep updated_at accurate via BEFORE UPDATE triggers on key tables
DO $$
BEGIN
  -- profiles
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_set_updated_at') THEN
    DROP TRIGGER trg_profiles_set_updated_at ON public.profiles;
  END IF;
  CREATE TRIGGER trg_profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- form_submissions
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_form_submissions_set_updated_at') THEN
    DROP TRIGGER trg_form_submissions_set_updated_at ON public.form_submissions;
  END IF;
  CREATE TRIGGER trg_form_submissions_set_updated_at
    BEFORE UPDATE ON public.form_submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- blog_posts
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_blog_posts_set_updated_at') THEN
    DROP TRIGGER trg_blog_posts_set_updated_at ON public.blog_posts;
  END IF;
  CREATE TRIGGER trg_blog_posts_set_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- blog_categories
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_blog_categories_set_updated_at') THEN
    DROP TRIGGER trg_blog_categories_set_updated_at ON public.blog_categories;
  END IF;
  CREATE TRIGGER trg_blog_categories_set_updated_at
    BEFORE UPDATE ON public.blog_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  -- user_roles
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_roles_set_updated_at') THEN
    DROP TRIGGER trg_user_roles_set_updated_at ON public.user_roles;
  END IF;
  CREATE TRIGGER trg_user_roles_set_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
END $$;

-- 3) Storage bucket for CV uploads with policies (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-uploads', 'cv-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Recreate policies to ensure correct roles (admin, hr)
DROP POLICY IF EXISTS "Allow public upload of CV files" ON storage.objects;
CREATE POLICY "Allow public upload of CV files"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'cv-uploads');

DROP POLICY IF EXISTS "Allow authorized users to view CV files" ON storage.objects;
CREATE POLICY "Allow authorized users to view CV files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cv-uploads' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin','hr')
  )
);

DROP POLICY IF EXISTS "Allow authorized users to delete CV files" ON storage.objects;
CREATE POLICY "Allow authorized users to delete CV files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cv-uploads' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role IN ('admin','hr')
  )
);