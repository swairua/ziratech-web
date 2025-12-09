import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromoCodeField } from "@/components/PromoCodeField";

const ContactZiraLock = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    device_type: "",
    volume: "",
    use_case: "",
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
          form_type: 'zira_lock',
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          form_data: {
            company: formData.company,
            device_type: formData.device_type,
            volume: formData.volume,
            use_case: formData.use_case,
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
            device_type: formData.device_type,
            volume: formData.volume,
            use_case: formData.use_case,
            form_type: 'zira_lock'
          }
        });
      } catch (emailError) {
        console.error('Error calling email function:', emailError);
      }

      toast({
        title: "Device Management Inquiry Sent!",
        description: "Thank you for your interest in Zira Lock. We respond within 6 hours during business hours."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        device_type: "",
        volume: "",
        use_case: "",
        message: "",
        promoCode: ""
      });
    } catch (error) {
      console.error("Error submitting Zira Lock form:", error);
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
            Secure Your Device Business
            <span className="text-brand-orange"> with Zira Lock</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Protect your PAYGo investments and expand access to technology across Africa. 
            Let's discuss how Zira Lock can secure your device financing business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-navy flex items-center">
                <Lock className="mr-3 h-6 w-6" />
                Secure Your Devices
              </CardTitle>
              <CardDescription>
                Tell us about your device financing business and we'll show you how Zira Lock can reduce defaults and increase profitability.
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
                    <Label htmlFor="device_type" className="text-brand-navy font-semibold">Device Type</Label>
                    <Select value={formData.device_type} onValueChange={value => handleInputChange("device_type", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="What devices do you finance?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smartphones">Smartphones/Mobile Phones</SelectItem>
                        <SelectItem value="solar_systems">Solar Home Systems</SelectItem>
                        <SelectItem value="solar_panels">Solar Panels/Kits</SelectItem>
                        <SelectItem value="appliances">Home Appliances</SelectItem>
                        <SelectItem value="motorcycles">Motorcycles/Boda Bodas</SelectItem>
                        <SelectItem value="tvs">TVs/Electronics</SelectItem>
                        <SelectItem value="iot_devices">IoT/Smart Devices</SelectItem>
                        <SelectItem value="multiple">Multiple Device Types</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="volume" className="text-brand-navy font-semibold">Monthly Device Volume</Label>
                    <Select value={formData.volume} onValueChange={value => handleInputChange("volume", value)}>
                      <SelectTrigger className="border-2 focus:border-brand-orange">
                        <SelectValue placeholder="How many devices/month?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_50">Under 50 devices</SelectItem>
                        <SelectItem value="50_200">50 - 200 devices</SelectItem>
                        <SelectItem value="200_1000">200 - 1,000 devices</SelectItem>
                        <SelectItem value="1000_5000">1,000 - 5,000 devices</SelectItem>
                        <SelectItem value="over_5000">Over 5,000 devices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="use_case" className="text-brand-navy font-semibold">Primary Use Case</Label>
                  <Select value={formData.use_case} onValueChange={value => handleInputChange("use_case", value)}>
                    <SelectTrigger className="border-2 focus:border-brand-orange">
                      <SelectValue placeholder="How do you plan to use Zira Lock?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paygo_financing">PAYGo Device Financing</SelectItem>
                      <SelectItem value="rental_leasing">Device Rental/Leasing</SelectItem>
                      <SelectItem value="asset_protection">Asset Protection & Recovery</SelectItem>
                      <SelectItem value="usage_control">Usage Control & Monitoring</SelectItem>
                      <SelectItem value="payment_enforcement">Payment Enforcement</SelectItem>
                      <SelectItem value="fleet_management">Fleet Management</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-brand-navy font-semibold">Tell us about your current challenges and goals</Label>
                  <Textarea 
                    id="message" 
                    value={formData.message} 
                    onChange={e => handleInputChange("message", e.target.value)} 
                    placeholder="e.g., High default rates, device recovery issues, need for better payment enforcement..." 
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
                      Secure My Devices with Zira Lock
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
              <CardTitle className="text-2xl text-white">Reduce Defaults by 70%+</CardTitle>
              <CardDescription className="text-gray-300">
                Join device financing companies across Africa using Zira Lock to protect investments 
                and enable more people to access technology through secure PAYGo solutions.
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
                  <h3 className="font-semibold text-white">Africa & Beyond</h3>
                  <p className="text-gray-300">Nairobi, Kenya (HQ)</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Zira Lock Benefits</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>✓ 70%+ reduction in default rates</li>
                  <li>✓ Real-time device control & monitoring</li>
                  <li>✓ Automated payment enforcement</li>
                  <li>✓ Proven across multiple device types</li>
                  <li>✓ API integration support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactZiraLock;