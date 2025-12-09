-- Check what constraints exist on form_submissions table
SELECT constraint_name, constraint_type, check_clause 
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'form_submissions' AND tc.constraint_type = 'CHECK';

-- Drop the existing check constraint that's blocking demo_booking
ALTER TABLE public.form_submissions 
DROP CONSTRAINT IF EXISTS form_submissions_form_type_check;

-- Add a new check constraint that allows the form types we need
ALTER TABLE public.form_submissions 
ADD CONSTRAINT form_submissions_form_type_check 
CHECK (form_type IN ('contact', 'demo_booking', 'career_application', 'partnership', 'support'));