-- Add admin role for the current user if they don't have one
-- This will allow them to create portfolio projects

-- First, let's check if the user already has a role, if not assign admin
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current authenticated user
    current_user_id := auth.uid();
    
    -- Only proceed if we have a current user
    IF current_user_id IS NOT NULL THEN
        -- Insert admin role if user doesn't already have one
        INSERT INTO public.user_roles (user_id, role)
        VALUES (current_user_id, 'admin'::user_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;