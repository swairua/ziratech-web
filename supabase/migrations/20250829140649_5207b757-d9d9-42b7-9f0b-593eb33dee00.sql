-- Create email_senders table for managing multiple sender profiles
CREATE TABLE public.email_senders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_senders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage email senders" 
ON public.email_senders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_senders_updated_at
BEFORE UPDATE ON public.email_senders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default senders
INSERT INTO public.email_senders (from_name, from_email, reply_to, is_default, is_active) VALUES
('Resend Demo', 'onboarding@resend.dev', 'noreply@resend.dev', true, true),
('Company Support', 'support@yourcompany.com', 'support@yourcompany.com', false, true);

-- Add sender_id column to email_automation_rules for future sender selection per rule
ALTER TABLE public.email_automation_rules 
ADD COLUMN sender_id UUID REFERENCES public.email_senders(id);