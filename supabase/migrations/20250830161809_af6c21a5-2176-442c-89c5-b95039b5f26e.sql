-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public can manage their own consent" ON public.user_consent;

-- Create secure session-based policies for user consent

-- Allow anyone to insert their own consent record (needed for GDPR compliance before auth)
CREATE POLICY "Users can insert their own consent record"
ON public.user_consent
FOR INSERT
WITH CHECK (true); -- We can't restrict by session on insert since session_id comes from the client

-- Allow users to view only their own consent records based on session_id
CREATE POLICY "Users can view their own consent record"
ON public.user_consent
FOR SELECT
USING (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR session_id = current_setting('request.cookies', true)::json->>'session_id'
  OR session_id = current_setting('request.query', true)::json->>'session_id'
);

-- Allow users to update only their own consent records based on session_id
CREATE POLICY "Users can update their own consent record"
ON public.user_consent
FOR UPDATE
USING (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR session_id = current_setting('request.cookies', true)::json->>'session_id' 
  OR session_id = current_setting('request.query', true)::json->>'session_id'
)
WITH CHECK (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR session_id = current_setting('request.cookies', true)::json->>'session_id'
  OR session_id = current_setting('request.query', true)::json->>'session_id'
);

-- Prevent deletes entirely (consent records should be immutable for compliance)
-- No DELETE policy = no one can delete

-- Add index for performance on session_id lookups
CREATE INDEX IF NOT EXISTS idx_user_consent_session_id ON public.user_consent(session_id);

-- Add a more restrictive policy that works with the current client-side session approach
-- Since we can't easily access request context in RLS, we'll use a simpler approach
DROP POLICY IF EXISTS "Users can view their own consent record" ON public.user_consent;
DROP POLICY IF EXISTS "Users can update their own consent record" ON public.user_consent;

-- Create a policy that allows access only to records created in the last 24 hours
-- This limits exposure while still allowing legitimate cookie consent functionality
CREATE POLICY "Recent consent records are accessible"
ON public.user_consent
FOR SELECT
USING (consent_timestamp > now() - interval '24 hours');

-- Allow updates only to very recent records (within 1 hour) to prevent abuse
CREATE POLICY "Recent consent records can be updated"
ON public.user_consent
FOR UPDATE
USING (last_updated > now() - interval '1 hour')
WITH CHECK (last_updated > now() - interval '1 hour');

-- Create a cleanup function to remove old consent records (for GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_consent_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete consent records older than 2 years (adjust based on your retention policy)
  DELETE FROM public.user_consent 
  WHERE consent_timestamp < now() - interval '2 years';
END;
$$;