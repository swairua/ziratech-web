-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-uploads', 'cv-uploads', false);

-- Create policy for CV uploads
CREATE POLICY "Allow public upload of CV files" 
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'cv-uploads');

-- Create policy for authorized users to view CV files
CREATE POLICY "Allow authorized users to view CV files" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
    bucket_id = 'cv-uploads' AND
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('SystemAdmin', 'HR')
    )
);

-- Create policy for authorized users to delete CV files
CREATE POLICY "Allow authorized users to delete CV files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'cv-uploads' AND
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('SystemAdmin', 'HR')
    )
);