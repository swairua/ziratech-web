-- Drop the existing check constraint that's blocking demo_booking
ALTER TABLE public.form_submissions 
DROP CONSTRAINT IF EXISTS form_submissions_form_type_check;

-- Add a new check constraint that allows the form types we need
ALTER TABLE public.form_submissions 
ADD CONSTRAINT form_submissions_form_type_check 
CHECK (form_type IN ('contact', 'demo_booking', 'career_application', 'partnership', 'support'));