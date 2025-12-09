-- Allow public (anonymous) users to submit contact forms
CREATE POLICY "Allow public to submit contact forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (form_type = 'contact');