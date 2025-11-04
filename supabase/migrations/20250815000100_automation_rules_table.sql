-- Create automation_rules table for storing automation rules
CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger TEXT NOT NULL CHECK (trigger IN ('form_submission', 'user_registration', 'time_based', 'manual')),
  template_id UUID NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sent_count INTEGER DEFAULT 0,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view automation rules" 
ON public.automation_rules 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage automation rules" 
ON public.automation_rules 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create indexes for better query performance
CREATE INDEX idx_automation_rules_trigger ON public.automation_rules(trigger);
CREATE INDEX idx_automation_rules_is_active ON public.automation_rules(is_active);
CREATE INDEX idx_automation_rules_template_id ON public.automation_rules(template_id);
CREATE INDEX idx_automation_rules_created_at ON public.automation_rules(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER trg_automation_rules_set_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
