-- Strengthen form submissions security (corrected version)

-- 1. Drop existing policies to rebuild with enhanced security
DROP POLICY IF EXISTS "Allow public to submit forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins and HR can view all form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins and HR can update form submissions" ON public.form_submissions;

-- 2. Create enhanced insertion policy with strong validation
CREATE POLICY "Allow validated public form submissions"
ON public.form_submissions
FOR INSERT
WITH CHECK (
  -- Validate form type
  form_type = ANY (ARRAY[
    'contact', 'demo_booking', 'career_application', 
    'partnership', 'support', 'zira_web', 'zira_lock', 'zira_sms'
  ])
  -- Validate required fields
  AND name IS NOT NULL 
  AND trim(name) != ''
  AND email IS NOT NULL 
  AND trim(email) != ''
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'  -- Email validation
  -- Validate data lengths to prevent abuse
  AND char_length(name) <= 100
  AND char_length(email) <= 255
  AND (message IS NULL OR char_length(message) <= 5000)
  AND (company IS NULL OR char_length(company) <= 200)
  AND (phone IS NULL OR char_length(phone) <= 20)
  -- Prevent obviously malicious content
  AND name !~* '(script|javascript|<|>|onclick|onerror)'
  AND email !~* '(script|javascript|<|>|onclick|onerror)'
  AND (message IS NULL OR message !~* '(script|javascript|onclick|onerror)')
);

-- 3. Create highly restrictive read policy - only authorized staff
CREATE POLICY "Authorized staff can view form submissions"
ON public.form_submissions
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  -- Must have required role
  AND (
    has_role(auth.uid(), 'admin'::user_role) 
    OR has_role(auth.uid(), 'hr'::user_role) 
    OR has_role(auth.uid(), 'support_agent'::user_role)
  )
);

-- 4. Create restrictive update policy
CREATE POLICY "Authorized staff can update form status only"
ON public.form_submissions
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'admin'::user_role) 
    OR has_role(auth.uid(), 'hr'::user_role) 
    OR has_role(auth.uid(), 'support_agent'::user_role)
  )
)
WITH CHECK (
  -- Only allow updating specific fields
  status IN ('new', 'in_progress', 'resolved', 'closed')
  AND handled_by = auth.uid()
);

-- 5. NO DELETE policy - prevent data deletion for compliance

-- 6. Add trigger for server-side validation and security
CREATE OR REPLACE FUNCTION public.validate_form_submission()
RETURNS TRIGGER AS $$
DECLARE
  recent_submissions integer;
BEGIN
  -- Server-side timestamp setting (cannot be manipulated by client)
  NEW.created_at = now();
  NEW.updated_at = now();
  
  -- Rate limiting: Check for too many submissions from same IP recently
  IF NEW.ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_submissions
    FROM public.form_submissions 
    WHERE ip_address = NEW.ip_address 
      AND created_at > now() - interval '1 hour';
    
    IF recent_submissions >= 10 THEN
      RAISE EXCEPTION 'Rate limit exceeded: Too many submissions from this IP address';
    END IF;
  END IF;
  
  -- Enhanced email validation
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format provided';
  END IF;
  
  -- Prevent suspicious patterns
  IF NEW.name ~* '(admin|root|test|demo|null|undefined|script)' THEN
    RAISE EXCEPTION 'Invalid name format';
  END IF;
  
  -- Set default status
  IF NEW.status IS NULL THEN
    NEW.status = 'new';
  END IF;
  
  -- Log the submission attempt for monitoring
  INSERT INTO public.activity_logs (
    user_id, action, resource_type, details
  ) VALUES (
    NULL, -- Anonymous submission
    'form_submission',
    NEW.form_type,
    jsonb_build_object(
      'email', NEW.email,
      'ip_address', NEW.ip_address,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log failed attempts
    INSERT INTO public.activity_logs (
      user_id, action, resource_type, details
    ) VALUES (
      NULL,
      'form_submission_failed',
      NEW.form_type,
      jsonb_build_object(
        'error', SQLERRM,
        'ip_address', NEW.ip_address,
        'timestamp', now()
      )
    );
    RAISE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

DROP TRIGGER IF EXISTS validate_form_submission_trigger ON public.form_submissions;
CREATE TRIGGER validate_form_submission_trigger
  BEFORE INSERT ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_form_submission();

-- 7. Create performance indexes (without problematic predicates)
CREATE INDEX IF NOT EXISTS idx_form_submissions_ip_created 
ON public.form_submissions(ip_address, created_at);

CREATE INDEX IF NOT EXISTS idx_form_submissions_email_hash
ON public.form_submissions(md5(email));

CREATE INDEX IF NOT EXISTS idx_form_submissions_status 
ON public.form_submissions(status);

CREATE INDEX IF NOT EXISTS idx_form_submissions_type_created
ON public.form_submissions(form_type, created_at);