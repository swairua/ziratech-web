-- Assign admin role to the first user (David Wanjau)
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES ('969a5cd5-6380-49d1-ba9b-f71535c7d373', 'admin', '969a5cd5-6380-49d1-ba9b-f71535c7d373')
ON CONFLICT (user_id, role) DO NOTHING;