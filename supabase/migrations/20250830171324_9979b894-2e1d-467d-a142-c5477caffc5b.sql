-- Fix critical security issues for storage policies

-- 1. Drop the dangerous anonymous INSERT policy for cv-uploads bucket
DROP POLICY IF EXISTS "Allow public upload of CV files" ON storage.objects;

-- 2. Drop problematic policies that reference non-existent roles
DROP POLICY IF EXISTS "Allow authorized users to view CV files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete CV files" ON storage.objects;

-- 3. Create proper policies with correct role names (admin, hr, etc.)
CREATE POLICY "Authenticated users can view CV files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
    bucket_id = 'cv-uploads' AND
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'hr')
    )
);

CREATE POLICY "Authenticated users can delete CV files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'cv-uploads' AND
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'hr')
    )
);

-- 4. Create a secure policy for authenticated CV uploads (users can only upload their own CVs)
CREATE POLICY "Authenticated CV uploads only" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'cv-uploads' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
);