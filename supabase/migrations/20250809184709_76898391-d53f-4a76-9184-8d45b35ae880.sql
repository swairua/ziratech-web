
-- 1) Ensure profiles are auto-created on signup
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Allow HR/support_agent to view profiles (read-only), keep existing admin/self rules
-- Existing policies remain; we add another SELECT policy for HR/support_agent
create policy "HR and support can view profiles"
on public.profiles
for select
using (
  has_role(auth.uid(), 'hr'::user_role)
  or has_role(auth.uid(), 'support_agent'::user_role)
  or is_admin(auth.uid())
  or auth.uid() = user_id
);

-- 3) Keep updated_at accurate via triggers on common tables
-- Drop if exist then create BEFORE UPDATE triggers
do $$
begin
  -- profiles
  if exists (select 1 from pg_trigger where tgname = 'trg_profiles_set_updated_at') then
    drop trigger trg_profiles_set_updated_at on public.profiles;
  end if;
  create trigger trg_profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at_column();

  -- form_submissions
  if exists (select 1 from pg_trigger where tgname = 'trg_form_submissions_set_updated_at') then
    drop trigger trg_form_submissions_set_updated_at on public.form_submissions;
  end if;
  create trigger trg_form_submissions_set_updated_at
    before update on public.form_submissions
    for each row execute function public.update_updated_at_column();

  -- blog_posts
  if exists (select 1 from pg_trigger where tgname = 'trg_blog_posts_set_updated_at') then
    drop trigger trg_blog_posts_set_updated_at on public.blog_posts;
  end if;
  create trigger trg_blog_posts_set_updated_at
    before update on public.blog_posts
    for each row execute function public.update_updated_at_column();

  -- blog_categories
  if exists (select 1 from pg_trigger where tgname = 'trg_blog_categories_set_updated_at') then
    drop trigger trg_blog_categories_set_updated_at on public.blog_categories;
  end if;
  create trigger trg_blog_categories_set_updated_at
    before update on public.blog_categories
    for each row execute function public.update_updated_at_column();

  -- user_roles
  if exists (select 1 from pg_trigger where tgname = 'trg_user_roles_set_updated_at') then
    drop trigger trg_user_roles_set_updated_at on public.user_roles;
  end if;
  create trigger trg_user_roles_set_updated_at
    before update on public.user_roles
    for each row execute function public.update_updated_at_column();
end $$;
