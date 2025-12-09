
-- 1) Update form_type CHECK constraint to include zira_* types
ALTER TABLE public.form_submissions 
DROP CONSTRAINT IF EXISTS form_submissions_form_type_check;

ALTER TABLE public.form_submissions 
ADD CONSTRAINT form_submissions_form_type_check
CHECK (
  form_type IN (
    'contact',
    'demo_booking',
    'career_application',
    'partnership',
    'support',
    'zira_web',
    'zira_lock',
    'zira_sms'
  )
);

-- 2) Update RLS policy to allow public inserts for the same set
DROP POLICY IF EXISTS "Allow public to submit forms" ON public.form_submissions;

CREATE POLICY "Allow public to submit forms"
ON public.form_submissions
FOR INSERT
WITH CHECK (
  form_type IN (
    'contact',
    'demo_booking',
    'career_application',
    'partnership',
    'support',
    'zira_web',
    'zira_lock',
    'zira_sms'
  )
);
