import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });

  // Prefill from localStorage if present (e.g., Request Quote flow)
  useState(() => {
    try {
      const raw = localStorage.getItem('contact_prefill');
      if (raw) {
        const parsed = JSON.parse(raw);
        setFormData(prev => ({
          ...prev,
          service: parsed.service || prev.service,
          message: parsed.message || prev.message
        }));
        // remove prefill after applying
        localStorage.removeItem('contact_prefill');
      }
    } catch (e) {
      // ignore
    }
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to form_submissions table
      const response = await api.formSubmissions.create({
        form_type: 'contact',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
        form_data: {
          service_interest: formData.service
        }
      });

      if (response.error) throw new Error(response.error);

      toast({
        title: "Message Sent!",
        description: "Thank you for your interest. We respond within 6 hours during business hours."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "There was an issue sending your message. Please try again.",
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
  return <section id="contact" className="py-16 bg-gradient-to-br from-brand-navy to-brand-navy-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Let's Build the Future
            <span className="text-brand-orange"> Together</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Ready to transform your business with cutting-edge African technology? 
            Our team is here to help you choose the right platform and get started.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-navy">Start Your Journey</CardTitle>
              <CardDescription>
                Tell us about your business needs and we'll recommend the perfect Zira platform solution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-brand-navy font-semibold">Name</Label>
                    <Input id="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} placeholder="Your full name" className="border-2 focus:border-brand-orange" required />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-brand-navy font-semibold">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} placeholder="your@company.com" className="border-2 focus:border-brand-orange" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-brand-navy font-semibold">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} placeholder="+254 700 000 000" className="border-2 focus:border-brand-orange" />
                </div>

                <div>
                  <Label htmlFor="service" className="text-brand-navy font-semibold">Which Platform Interests You?</Label>
                  <Select value={formData.service} onValueChange={value => handleInputChange("service", value)}>
                    <SelectTrigger className="border-2 focus:border-brand-orange">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zira-homes">Zira Homes - Property Management</SelectItem>
                      <SelectItem value="zira-lock">Zira Lock - PAYGo Device Management</SelectItem>
                      <SelectItem value="zira-sms">Zira SMS - Bulk Messaging</SelectItem>
                      <SelectItem value="web-development">Website Development</SelectItem>
                      <SelectItem value="consultation">Platform Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-brand-navy font-semibold">Project Details</Label>
                  <Textarea id="message" value={formData.message} onChange={e => handleInputChange("message", e.target.value)} placeholder="Tell us about your business challenges and goals..." rows={5} className="border-2 focus:border-brand-orange" required />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Get Started Today
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">We respond within 6 hours during business hours</p>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Let's Connect</CardTitle>
              <CardDescription className="text-gray-300">
                Ready to revolutionize your business operations? Get in touch with our team 
                and discover which Zira platform is perfect for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center border border-brand-orange/30">
                  <Mail className="h-6 w-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email</h3>
                  <p className="text-gray-300">info@ziratech.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center border border-brand-orange/30">
                  <Phone className="h-6 w-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Phone & WhatsApp</h3>
                  <p className="text-gray-300">+254 757878023</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center border border-brand-orange/30">
                  <MapPin className="h-6 w-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Headquarters</h3>
                  <p className="text-gray-300">Nairobi, Kenya</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default Contact;
