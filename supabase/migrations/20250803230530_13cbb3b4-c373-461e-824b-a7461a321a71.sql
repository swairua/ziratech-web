-- Update RLS policy to allow demo booking submissions
DROP POLICY IF EXISTS "Allow public to submit contact forms" ON public.form_submissions;

CREATE POLICY "Allow public to submit forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  form_type IN ('contact', 'demo_booking', 'career_application')
);