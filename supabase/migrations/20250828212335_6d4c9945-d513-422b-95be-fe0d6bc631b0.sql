-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true);

-- Create policy for public read access to portfolio images
CREATE POLICY "Allow public read access to portfolio images" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'portfolio-images');

-- Create policy for authenticated users to upload portfolio images
CREATE POLICY "Allow authenticated users to upload portfolio images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'portfolio-images');

-- Create policy for authenticated users to update portfolio images
CREATE POLICY "Allow authenticated users to update portfolio images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'portfolio-images');

-- Create policy for authenticated users to delete portfolio images
CREATE POLICY "Allow authenticated users to delete portfolio images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'portfolio-images');