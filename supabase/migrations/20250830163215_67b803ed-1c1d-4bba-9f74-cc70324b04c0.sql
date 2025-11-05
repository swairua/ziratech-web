-- Fix CV upload storage policies to prevent anonymous uploads
-- and ensure proper access control

-- First, let's update the existing policies to be more secure
DROP POLICY IF EXISTS "Allow public upload of CV files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to view CV files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete CV files" ON storage.objects;

-- Create new secure policies for CV uploads
-- Only authenticated users can upload CVs
CREATE POLICY "Authenticated users can upload CV files" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'cv-uploads' AND
    auth.uid() IS NOT NULL
);

-- Only HR and admins can view CV files
CREATE POLICY "HR and admins can view CV files" 
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

-- Only HR and admins can delete CV files
CREATE POLICY "HR and admins can delete CV files" 
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

-- Make CV uploads bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'cv-uploads';