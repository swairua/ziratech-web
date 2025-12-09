-- Remove dangerous anonymous upload policy for cv-uploads
DROP POLICY IF EXISTS "Allow authenticated uploads to cv-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to cv-uploads" ON storage.objects;

-- Create secure CV upload policies - only allow authenticated users to upload to their own folder
CREATE POLICY "Allow authenticated users to upload their own CVs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'cv-uploads' 
  AND auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow authenticated users to view their own CVs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'cv-uploads' 
  AND auth.uid() IS NOT NULL 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all CVs
CREATE POLICY "Allow admins to view all CVs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'cv-uploads' 
  AND has_role(auth.uid(), 'admin'::user_role)
);

-- Fix portfolio-images policies to use consistent role names
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload portfolio images" ON storage.objects;

CREATE POLICY "Anyone can view portfolio images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Admins and editors can upload portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'portfolio-images' 
  AND (
    has_role(auth.uid(), 'admin'::user_role) 
    OR has_role(auth.uid(), 'editor'::user_role)
  )
);

-- Tighten email_events RLS - remove system insert policy, only allow through functions
DROP POLICY IF EXISTS "System can insert email events" ON email_events;

-- Tighten offer_events RLS - remove system insert policy, only allow through functions  
DROP POLICY IF EXISTS "System can insert offer events" ON offer_events;

-- Add rate limiting trigger to form_submissions for additional security
CREATE OR REPLACE FUNCTION public.enhanced_form_validation()
RETURNS TRIGGER AS $$
DECLARE
  recent_submissions integer;
  suspicious_patterns integer;
BEGIN
  -- Server-side timestamp setting (cannot be manipulated by client)
  NEW.created_at = now();
  NEW.updated_at = now();
  
  -- Enhanced rate limiting: Check for too many submissions from same IP recently
  IF NEW.ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_submissions
    FROM public.form_submissions 
    WHERE ip_address = NEW.ip_address 
      AND created_at > now() - interval '1 hour';
    
    IF recent_submissions >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded: Too many submissions from this IP address';
    END IF;
    
    -- Check for suspicious patterns across different IPs
    SELECT COUNT(*) INTO suspicious_patterns
    FROM public.form_submissions 
    WHERE email = NEW.email 
      AND created_at > now() - interval '24 hours';
    
    IF suspicious_patterns >= 3 THEN
      RAISE EXCEPTION 'Suspicious activity detected for this email address';
    END IF;
  END IF;
  
  -- Enhanced email validation
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format provided';
  END IF;
  
  -- Prevent suspicious patterns and common attack vectors
  IF NEW.name ~* '(admin|root|test|demo|null|undefined|script|<|>|javascript|onclick)' THEN
    RAISE EXCEPTION 'Invalid name format detected';
  END IF;
  
  -- Enhanced message content validation
  IF NEW.message IS NOT NULL AND NEW.message ~* '(script|javascript|onclick|onerror|<iframe|<object|<embed|data:)' THEN
    RAISE EXCEPTION 'Suspicious content detected in message';
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
      'timestamp', now(),
      'user_agent', NEW.user_agent
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
        'email', NEW.email,
        'timestamp', now()
      )
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace the existing trigger with enhanced version
DROP TRIGGER IF EXISTS validate_form_submission ON form_submissions;
CREATE TRIGGER enhanced_form_validation_trigger
  BEFORE INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION enhanced_form_validation();