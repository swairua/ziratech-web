import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromoCodeField } from "@/components/PromoCodeField";

const ContactZiraSMS = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    business_type: "",
    monthly_volume: "",
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
          form_type: 'zira_sms',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          form_data: {
            company: formData.company,
            business_type: formData.business_type,
            monthly_volume: formData.monthly_volume,
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
            business_type: formData.business_type,
            monthly_volume: formData.monthly_volume,
            form_type: 'zira_sms'
          }
        });
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
      }

      toast({
        title: "SMS Inquiry Sent!",
        description: "Thank you for your interest in Zira SMS. We respond within 6 hours during business hours."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        business_type: "",
        monthly_volume: "",
        message: "",
        promoCode: ""
      });
    } catch (error) {
      console.error("Error submitting Zira SMS form:", error);
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
            Ready to Start Messaging Your Customers?
            <span className="text-brand-orange"> Let's Connect!</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Join hundreds of Kenyan businesses using Zira SMS for customer engagement. 
            Get a custom quote based on your messaging needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-navy flex items-center">
                <MessageSquare className="mr-3 h-6 w-6" />
                Get Your SMS Solution
              </CardTitle>
              <CardDescription>
                Tell us about your business and messaging needs in Kenya. We'll provide a custom solution with competitive rates.
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
                      placeholder="your@company.co.ke" 
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
                      placeholder="+254 7XX XXX XXX" 
                      className="border-2 focus:border-brand-orange" 
                      required 
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
                    <Label htmlFor="business_type" className="text-brand-navy font-semibold">Business Type</Label>
                    <Select value={formData.business_type} onValueChange={value => handleInputChange("business_type", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail/Shop</SelectItem>
                        <SelectItem value="restaurant">Restaurant/Food Service</SelectItem>
                        <SelectItem value="healthcare">Healthcare/Medical</SelectItem>
                        <SelectItem value="education">Education/School</SelectItem>
                        <SelectItem value="finance">Banking/Microfinance</SelectItem>
                        <SelectItem value="agriculture">Agriculture/Farming</SelectItem>
                        <SelectItem value="transportation">Transport/Logistics</SelectItem>
                        <SelectItem value="ngo">NGO/Non-Profit</SelectItem>
                        <SelectItem value="government">Government/Public Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="monthly_volume" className="text-brand-navy font-semibold">Expected Monthly SMS Volume</Label>
                    <Select value={formData.monthly_volume} onValueChange={value => handleInputChange("monthly_volume", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="Select volume range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_1000">Under 1,000 SMS</SelectItem>
                        <SelectItem value="1000_5000">1,000 - 5,000 SMS</SelectItem>
                        <SelectItem value="5000_20000">5,000 - 20,000 SMS</SelectItem>
                        <SelectItem value="20000_50000">20,000 - 50,000 SMS</SelectItem>
                        <SelectItem value="over_50000">Over 50,000 SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-brand-navy font-semibold">How will you use SMS? (Marketing, Alerts, Notifications, etc.)</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message} 
                    onChange={e => handleInputChange("message", e.target.value)} 
                    placeholder="e.g., Customer notifications, promotional campaigns, appointment reminders, payment alerts..." 
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
                      Get Zira SMS Pricing
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
              <CardTitle className="text-2xl text-white">Reach Every Customer in Kenya</CardTitle>
              <CardDescription className="text-gray-300">
                Join hundreds of Kenyan businesses using Zira SMS to reach customers on all networks - 
                Safaricom, Airtel, and Telkom with 99%+ delivery rates.
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
                  <h3 className="font-semibold text-white">Serving Kenya</h3>
                  <p className="text-gray-300">Nairobi & Nationwide</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Why Choose Zira SMS in Kenya?</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>✓ Direct routes to all Kenyan networks</li>
                  <li>✓ Competitive rates starting from KES 0.40</li>
                  <li>✓ Local support team in Nairobi</li>
                  <li>✓ M-Pesa integration available</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactZiraSMS;