
-- 1) Create a public bucket for portfolio cover images (idempotent)
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

-- 2) Ensure RLS is enabled on storage.objects (usually already enabled)
alter table storage.objects enable row level security;

-- 3) Public read policy for images in the 'portfolio-images' bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and polname = 'Public read portfolio-images'
  ) then
    create policy "Public read portfolio-images"
      on storage.objects
      for select
      using (bucket_id = 'portfolio-images');
  end if;
end$$;

-- 4) Admins and editors can manage (insert/update/delete) images in the bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and polname = 'Admins and editors manage portfolio-images'
  ) then
    create policy "Admins and editors manage portfolio-images"
      on storage.objects
      for all
      using (
        bucket_id = 'portfolio-images'
        and (
          has_role(auth.uid(), 'admin'::user_role)
          or has_role(auth.uid(), 'editor'::user_role)
        )
      )
      with check (
        bucket_id = 'portfolio-images'
        and (
          has_role(auth.uid(), 'admin'::user_role)
          or has_role(auth.uid(), 'editor'::user_role)
        )
      );
  end if;
end$$;
