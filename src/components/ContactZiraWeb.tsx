import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromoCodeField } from "@/components/PromoCodeField";

const ContactZiraWeb = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website_type: "",
    budget_range: "",
    timeline: "",
    features_needed: "",
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
          form_type: 'zira_web',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          form_data: {
            company: formData.company,
            website_type: formData.website_type,
            budget_range: formData.budget_range,
            timeline: formData.timeline,
            features_needed: formData.features_needed,
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
            company: formData.company,
            message: formData.message,
            website_type: formData.website_type,
            budget_range: formData.budget_range,
            timeline: formData.timeline,
            features_needed: formData.features_needed,
            form_type: 'zira_web'
          }
        });
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
      }

      toast({
        title: "Website Project Inquiry Sent!",
        description: "Thank you for your interest in Zira Web. We respond within 6 hours during business hours."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        website_type: "",
        budget_range: "",
        timeline: "",
        features_needed: "",
        message: "",
        promoCode: ""
      });
    } catch (error) {
      console.error("Error submitting Zira Web form:", error);
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

  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-brand-navy to-brand-navy-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Something
            <span className="text-brand-orange"> Amazing?</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Let's create a digital presence that elevates your brand and drives real results. 
            Tell us about your vision and we'll make it happen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-navy flex items-center">
                <Globe className="mr-3 h-6 w-6" />
                Start Your Web Project
              </CardTitle>
              <CardDescription>
                Tell us about your vision and we'll create a custom proposal for your website or web application.
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
                      placeholder="your@company.com" 
                      className="border-2 focus:border-brand-orange" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-brand-navy font-semibold">Phone Number</Label>
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
                    <Label htmlFor="company" className="text-brand-navy font-semibold">Company/Organization</Label>
                    <Input 
                      id="company" 
                      value={formData.company} 
                      onChange={e => handleInputChange("company", e.target.value)} 
                      placeholder="Your business name" 
                      className="border-2 focus:border-brand-orange" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website_type" className="text-brand-navy font-semibold">Type of Website</Label>
                    <Select value={formData.website_type} onValueChange={value => handleInputChange("website_type", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="What do you need?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business_website">Business Website</SelectItem>
                        <SelectItem value="ecommerce">E-commerce Store</SelectItem>
                        <SelectItem value="portfolio">Portfolio/Personal Site</SelectItem>
                        <SelectItem value="blog">Blog/Content Site</SelectItem>
                        <SelectItem value="landing_page">Landing Page</SelectItem>
                        <SelectItem value="web_app">Web Application</SelectItem>
                        <SelectItem value="saas_platform">SaaS Platform</SelectItem>
                        <SelectItem value="educational">Educational Platform</SelectItem>
                        <SelectItem value="nonprofit">Non-Profit Website</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget_range" className="text-brand-navy font-semibold">Budget Range</Label>
                    <Select value={formData.budget_range} onValueChange={value => handleInputChange("budget_range", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="Your budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_100k">Under KES 100,000</SelectItem>
                        <SelectItem value="100k_300k">KES 100,000 - 300,000</SelectItem>
                        <SelectItem value="300k_500k">KES 300,000 - 500,000</SelectItem>
                        <SelectItem value="500k_1m">KES 500,000 - 1,000,000</SelectItem>
                        <SelectItem value="over_1m">Over KES 1,000,000</SelectItem>
                        <SelectItem value="discuss">Let's Discuss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeline" className="text-brand-navy font-semibold">Project Timeline</Label>
                    <Select value={formData.timeline} onValueChange={value => handleInputChange("timeline", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="When do you need it?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP (Rush Job)</SelectItem>
                        <SelectItem value="1_month">Within 1 Month</SelectItem>
                        <SelectItem value="2_months">1-2 Months</SelectItem>
                        <SelectItem value="3_months">2-3 Months</SelectItem>
                        <SelectItem value="flexible">Flexible Timeline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="features_needed" className="text-brand-navy font-semibold">Key Features Needed</Label>
                    <Select value={formData.features_needed} onValueChange={value => handleInputChange("features_needed", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="Main functionality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic_pages">Basic Pages & Content</SelectItem>
                        <SelectItem value="contact_forms">Contact Forms & Lead Gen</SelectItem>
                        <SelectItem value="booking_system">Booking/Appointment System</SelectItem>
                        <SelectItem value="ecommerce">Online Store & Payments</SelectItem>
                        <SelectItem value="user_accounts">User Accounts & Profiles</SelectItem>
                        <SelectItem value="cms">Content Management</SelectItem>
                        <SelectItem value="integrations">Third-party Integrations</SelectItem>
                        <SelectItem value="custom_features">Custom Features</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-brand-navy font-semibold">Tell us about your project and goals</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message} 
                    onChange={e => handleInputChange("message", e.target.value)} 
                    placeholder="Describe your vision, target audience, specific requirements, design preferences..." 
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
                      Start Building with Zira Web
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
              <CardTitle className="text-2xl text-white">Digital Excellence, Delivered</CardTitle>
              <CardDescription className="text-gray-300">
                From concept to launch, we build digital experiences that elevate your brand 
                and drive real business results. Modern technology, beautiful design, measurable impact.
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
                  <p className="text-gray-300">Serving clients globally</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Why Choose Zira Web?</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>✓ Modern, responsive designs</li>
                  <li>✓ Fast delivery (2-4 weeks typical)</li>
                  <li>✓ Built with latest tech stack</li>
                  <li>✓ SEO optimized by default</li>
                  <li>✓ Ongoing support included</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactZiraWeb;