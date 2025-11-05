import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Loader2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromoCodeField } from "@/components/PromoCodeField";

const ContactZiraHomes = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    number_of_units: "",
    country: "",
    message: "",
    promoCode: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_type: 'zira_homes',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          form_data: {
            role: formData.role,
            number_of_units: formData.number_of_units,
            country: formData.country,
            promo_code: formData.promoCode
          }
        });

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-form-emails', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            number_of_units: formData.number_of_units,
            country: formData.country,
            message: formData.message,
            form_type: 'zira_homes'
          }
        });
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
      }

      toast({
        title: "Demo Request Sent!",
        description: "Thank you for your interest in Zira Homes. We'll be in touch within 24 hours to schedule your demo."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        number_of_units: "",
        country: "",
        message: "",
        promoCode: ""
      });
    } catch (error) {
      console.error("Error submitting Zira Homes demo request:", error);
      toast({
        title: "Error",
        description: "There was an issue sending your demo request. Please try again.",
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
    <section id="contact" className="py-16 bg-gradient-to-br from-brand-navy to-brand-navy-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="text-brand-orange"> Property Management?</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Schedule a personalized demo of Zira Homes and see how we can streamline your property management operations. 
            Perfect for diaspora landlords and local property managers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Demo Request Form */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-navy flex items-center">
                <Home className="mr-3 h-6 w-6" />
                Request a Demo
              </CardTitle>
              <CardDescription>
                Tell us about your property management needs and we'll show you how Zira Homes can help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-brand-navy font-semibold">Full Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={e => handleInputChange("name", e.target.value)} 
                      placeholder="Your full name" 
                      className="border-2 focus:border-brand-orange" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-brand-navy font-semibold">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={e => handleInputChange("email", e.target.value)} 
                      placeholder="your@email.com" 
                      className="border-2 focus:border-brand-orange" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-brand-navy font-semibold">Phone Number (Optional)</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => handleInputChange("phone", e.target.value)} 
                      placeholder="+254 700 000 000" 
                      className="border-2 focus:border-brand-orange" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-brand-navy font-semibold">Your Role</Label>
                    <Select value={formData.role} onValueChange={value => handleInputChange("role", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property_owner">Property Owner</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="property_manager">Property Manager</SelectItem>
                        <SelectItem value="real_estate_agent">Real Estate Agent</SelectItem>
                        <SelectItem value="housing_cooperative">Housing Cooperative</SelectItem>
                        <SelectItem value="diaspora_investor">Diaspora Investor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number_of_units" className="text-brand-navy font-semibold">Number of Units</Label>
                    <Select value={formData.number_of_units} onValueChange={value => handleInputChange("number_of_units", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="How many units?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_5">1-5 units</SelectItem>
                        <SelectItem value="6_10">6-10 units</SelectItem>
                        <SelectItem value="11_25">11-25 units</SelectItem>
                        <SelectItem value="26_50">26-50 units</SelectItem>
                        <SelectItem value="51_100">51-100 units</SelectItem>
                        <SelectItem value="over_100">Over 100 units</SelectItem>
                        <SelectItem value="planning">Planning to invest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-brand-navy font-semibold">Country/Location</Label>
                    <Input 
                      id="country" 
                      value={formData.country} 
                      onChange={e => handleInputChange("country", e.target.value)} 
                      placeholder="e.g., Kenya, Uganda, Tanzania" 
                      className="border-2 focus:border-brand-orange" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-brand-navy font-semibold">Tell us about your property management needs</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message} 
                    onChange={e => handleInputChange("message", e.target.value)} 
                    placeholder="What challenges are you facing? What features are most important to you? Any specific questions about Zira Homes?" 
                    rows={4} 
                    className="border-2 focus:border-brand-orange" 
                    required 
                  />
                </div>

                <PromoCodeField 
                  value={formData.promoCode}
                  onChange={(value) => handleInputChange("promoCode", value)}
                />

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
                      Request Demo
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">We'll contact you within 24 hours to schedule your demo</p>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Transform Your Property Management</CardTitle>
              <CardDescription className="text-gray-300">
                Join property managers across Africa and the diaspora who are revolutionizing their operations with Zira Homes. 
                Get detailed insights, automate operations, and stay connected with your investments from anywhere.
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
                  <h3 className="font-semibold text-white">Based in Nairobi</h3>
                  <p className="text-gray-300">Serving Africa & Diaspora globally</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">What You'll See in the Demo:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>✓ Complete property & tenant management</li>
                  <li>✓ Automated rent collection & tracking</li>
                  <li>✓ Financial reporting & insights</li>
                  <li>✓ Mobile-first design for Africa</li>
                  <li>✓ Remote management capabilities</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactZiraHomes;