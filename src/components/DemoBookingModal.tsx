import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Send, Loader2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DemoBookingModalProps {
  children: React.ReactNode;
  platform?: string;
}

const DemoBookingModal = ({ children, platform = "Zira Homes" }: DemoBookingModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    country: "",
    city: "",
    businessSize: "",
    currentSolution: "",
    preferredTime: "",
    timezone: "",
    specificRequirements: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to form_submissions table
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_type: 'demo_booking',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          form_data: {
            platform: platform,
            company: formData.company,
            role: formData.role,
            country: formData.country,
            city: formData.city,
            business_size: formData.businessSize,
            current_solution: formData.currentSolution,
            preferred_time: formData.preferredTime,
            timezone: formData.timezone,
            specific_requirements: formData.specificRequirements
          }
        });

      if (error) throw error;

      // Send emails via edge function
      try {
        const emailResponse = await supabase.functions.invoke('send-form-emails', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            message: `Demo request for ${platform}. 
            Location: ${formData.city}, ${formData.country}
            Business: ${formData.company} (${formData.businessSize})
            Role: ${formData.role}
            Current Solution: ${formData.currentSolution}
            Preferred time: ${formData.preferredTime} (${formData.timezone})
            Specific Requirements: ${formData.specificRequirements}
            Additional message: ${formData.message}`,
            form_type: 'demo_booking'
          }
        });

        if (emailResponse.error) {
          console.error('Email sending failed:', emailResponse.error);
        }
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
      }

      toast({
        title: "Demo Scheduled!",
        description: "Thank you for your interest. We respond within 6 hours during business hours to confirm your demo time."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        role: "",
        country: "",
        city: "",
        businessSize: "",
        currentSolution: "",
        preferredTime: "",
        timezone: "",
        specificRequirements: "",
        message: ""
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast({
        title: "Error",
        description: "There was an issue scheduling your demo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-brand-navy flex items-center">
            <Video className="mr-2 h-6 w-6 text-brand-orange" />
            Book Your {platform} Demo
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demo-name" className="text-brand-navy font-medium">Full Name</Label>
              <Input 
                id="demo-name" 
                value={formData.name} 
                onChange={e => handleInputChange("name", e.target.value)} 
                placeholder="Your full name" 
                className="border-2 focus:border-brand-orange" 
                required 
              />
            </div>
            <div>
              <Label htmlFor="demo-email" className="text-brand-navy font-medium">Email</Label>
              <Input 
                id="demo-email" 
                type="email" 
                value={formData.email} 
                onChange={e => handleInputChange("email", e.target.value)} 
                placeholder="your@company.com" 
                className="border-2 focus:border-brand-orange" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demo-phone" className="text-brand-navy font-medium">Phone Number</Label>
              <Input 
                id="demo-phone" 
                type="tel" 
                value={formData.phone} 
                onChange={e => handleInputChange("phone", e.target.value)} 
                placeholder="+254 7XX XXX XXX" 
                className="border-2 focus:border-brand-orange" 
              />
            </div>
            <div>
              <Label htmlFor="demo-company" className="text-brand-navy font-medium">Company/Organization</Label>
              <Input 
                id="demo-company" 
                value={formData.company} 
                onChange={e => handleInputChange("company", e.target.value)} 
                placeholder="Your company name" 
                className="border-2 focus:border-brand-orange" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demo-country" className="text-brand-navy font-medium">Country</Label>
              <Select value={formData.country} onValueChange={value => handleInputChange("country", value)}>
                <SelectTrigger className="border-2 focus:border-brand-orange">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                  <SelectItem value="kenya">Kenya</SelectItem>
                  <SelectItem value="uganda">Uganda</SelectItem>
                  <SelectItem value="tanzania">Tanzania</SelectItem>
                  <SelectItem value="rwanda">Rwanda</SelectItem>
                  <SelectItem value="south-africa">South Africa</SelectItem>
                  <SelectItem value="nigeria">Nigeria</SelectItem>
                  <SelectItem value="ghana">Ghana</SelectItem>
                  <SelectItem value="ethiopia">Ethiopia</SelectItem>
                  <SelectItem value="zambia">Zambia</SelectItem>
                  <SelectItem value="botswana">Botswana</SelectItem>
                  <SelectItem value="morocco">Morocco</SelectItem>
                  <SelectItem value="egypt">Egypt</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="demo-city" className="text-brand-navy font-medium">City</Label>
              <Input 
                id="demo-city" 
                value={formData.city} 
                onChange={e => handleInputChange("city", e.target.value)} 
                placeholder="Your city" 
                className="border-2 focus:border-brand-orange" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demo-role" className="text-brand-navy font-medium">Your Role</Label>
              <Select value={formData.role} onValueChange={value => handleInputChange("role", value)}>
                <SelectTrigger className="border-2 focus:border-brand-orange">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                  <SelectItem value="property-manager">Property Manager</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="real-estate-agent">Real Estate Agent</SelectItem>
                  <SelectItem value="business-owner">Business Owner</SelectItem>
                  <SelectItem value="it-manager">IT Manager</SelectItem>
                  <SelectItem value="ceo-founder">CEO/Founder</SelectItem>
                  <SelectItem value="operations-manager">Operations Manager</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="demo-business-size" className="text-brand-navy font-medium">Business Size</Label>
              <Select value={formData.businessSize} onValueChange={value => handleInputChange("businessSize", value)}>
                <SelectTrigger className="border-2 focus:border-brand-orange">
                  <SelectValue placeholder="How many units do you manage?" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                  <SelectItem value="1-10">1-10 Units</SelectItem>
                  <SelectItem value="11-50">11-50 Units</SelectItem>
                  <SelectItem value="51-100">51-100 Units</SelectItem>
                  <SelectItem value="101-500">101-500 Units</SelectItem>
                  <SelectItem value="500+">500+ Units</SelectItem>
                  <SelectItem value="startup">Startup/Planning Phase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="demo-current-solution" className="text-brand-navy font-medium">Current Solution</Label>
            <Select value={formData.currentSolution} onValueChange={value => handleInputChange("currentSolution", value)}>
              <SelectTrigger className="border-2 focus:border-brand-orange">
                <SelectValue placeholder="How do you currently manage properties?" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                <SelectItem value="spreadsheets">Excel/Google Sheets</SelectItem>
                <SelectItem value="manual-records">Manual Records/Paper</SelectItem>
                <SelectItem value="basic-software">Basic Property Software</SelectItem>
                <SelectItem value="custom-system">Custom Built System</SelectItem>
                <SelectItem value="other-platform">Other Property Platform</SelectItem>
                <SelectItem value="none">No Current System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demo-time" className="text-brand-navy font-medium">Preferred Demo Time</Label>
              <Select value={formData.preferredTime} onValueChange={value => handleInputChange("preferredTime", value)}>
                <SelectTrigger className="border-2 focus:border-brand-orange">
                  <SelectValue placeholder="When works best for you?" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                  <SelectItem value="early-morning">Early Morning (7-9 AM)</SelectItem>
                  <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                  <SelectItem value="lunch">Lunch Time (12-2 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2-5 PM)</SelectItem>
                  <SelectItem value="evening">Evening (5-7 PM)</SelectItem>
                  <SelectItem value="late-evening">Late Evening (7-9 PM)</SelectItem>
                  <SelectItem value="weekend">Weekend (Any time)</SelectItem>
                  <SelectItem value="flexible">I'm flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="demo-timezone" className="text-brand-navy font-medium">Your Timezone</Label>
              <Select value={formData.timezone} onValueChange={value => handleInputChange("timezone", value)}>
                <SelectTrigger className="border-2 focus:border-brand-orange">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                  <SelectItem value="EAT">East Africa Time (EAT) - UTC+3</SelectItem>
                  <SelectItem value="CAT">Central Africa Time (CAT) - UTC+2</SelectItem>
                  <SelectItem value="WAT">West Africa Time (WAT) - UTC+1</SelectItem>
                  <SelectItem value="SAST">South Africa Time (SAST) - UTC+2</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time (GMT) - UTC+0</SelectItem>
                  <SelectItem value="EST">Eastern Time (EST) - UTC-5</SelectItem>
                  <SelectItem value="PST">Pacific Time (PST) - UTC-8</SelectItem>
                  <SelectItem value="IST">India Standard Time (IST) - UTC+5:30</SelectItem>
                  <SelectItem value="AEST">Australian Eastern Time (AEST) - UTC+10</SelectItem>
                  <SelectItem value="other">Other Timezone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="demo-requirements" className="text-brand-navy font-medium">Specific Requirements</Label>
            <Select value={formData.specificRequirements} onValueChange={value => handleInputChange("specificRequirements", value)}>
              <SelectTrigger className="border-2 focus:border-brand-orange">
                <SelectValue placeholder="What would you like to focus on?" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                <SelectItem value="rent-collection">Rent Collection & Payment Tracking</SelectItem>
                <SelectItem value="tenant-management">Tenant Management & Communication</SelectItem>
                <SelectItem value="property-analytics">Property Analytics & Reporting</SelectItem>
                <SelectItem value="maintenance-tracking">Maintenance & Work Orders</SelectItem>
                <SelectItem value="financial-reporting">Financial Reporting & Accounting</SelectItem>
                <SelectItem value="multi-property">Multi-Property Management</SelectItem>
                <SelectItem value="mobile-app">Mobile App Features</SelectItem>
                <SelectItem value="integration">Integration with Existing Systems</SelectItem>
                <SelectItem value="pricing">Pricing & Implementation</SelectItem>
                <SelectItem value="general">General Platform Overview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="demo-message" className="text-brand-navy font-medium">Additional Questions or Comments</Label>
            <Textarea 
              id="demo-message" 
              value={formData.message} 
              onChange={e => handleInputChange("message", e.target.value)} 
              placeholder="Tell us anything else you'd like to discuss during the demo..." 
              rows={3} 
              className="border-2 focus:border-brand-orange" 
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling Demo...
              </>
            ) : (
              <>
                Schedule My Demo
                <Calendar className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            We respond within 6 hours during business hours • 30-minute session via Google Meet/Zoom
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DemoBookingModal;