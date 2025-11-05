-- Fix function search path mutable warning by setting search_path for security functions
CREATE OR REPLACE FUNCTION public.has_role(user_uuid uuid, required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT public.has_role(user_uuid, 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role FROM public.user_roles 
  WHERE user_id = user_uuid 
  ORDER BY created_at DESC 
  LIMIT 1;
$function$;

-- Set search_path for the enhanced form validation function
CREATE OR REPLACE FUNCTION public.enhanced_form_validation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;