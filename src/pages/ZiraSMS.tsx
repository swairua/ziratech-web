import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Users, 
  BarChart3,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Target,
  Shield,
  TrendingUp,
  Video
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DemoBookingModal from "@/components/DemoBookingModal";
import ContactZiraSMS from "@/components/ContactZiraSMS";
import SEO from "@/components/SEO";

const ZiraSMS = () => {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Zira SMS - Bulk SMS Kenya",
    "description": "Affordable bulk SMS solutions for businesses in Kenya. Send marketing messages, notifications, and alerts with high delivery rates and branded sender IDs.",
    "applicationCategory": "CommunicationSoftware",
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "0.40",
      "priceCurrency": "KES"
    },
    "provider": {
      "@type": "Organization",
      "name": "Zira Technologies"
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Send className="h-6 w-6" />,
      title: "Bulk SMS Campaigns",
      description: "Send thousands of messages instantly with high delivery rates"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Automated Messaging",
      description: "Schedule and trigger messages based on events and conditions"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Customer Segmentation",
      description: "Target specific customer groups with personalized messaging"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Delivery Reports",
      description: "Real-time analytics and detailed delivery reports"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "API Integration",
      description: "Seamlessly integrate with your existing systems and workflows"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Reliable Infrastructure",
      description: "99.9% uptime with redundant message routing"
    }
  ];

  const useCases = [
    {
      title: "Marketing Campaigns",
      description: "Promotional messages, product launches, and special offers",
      examples: ["Flash sales alerts", "New product announcements", "Customer surveys"]
    },
    {
      title: "Customer Support",
      description: "Order updates, appointment reminders, and service alerts",
      examples: ["Delivery notifications", "Appointment confirmations", "Payment reminders"]
    },
    {
      title: "Emergency Alerts",
      description: "Critical notifications and urgent communications",
      examples: ["Security alerts", "System maintenance", "Emergency broadcasts"]
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "KES 0.50",
      unit: "per SMS",
      features: [
        "Up to 1,000 SMS/month",
        "Basic reporting",
        "Email support",
        "Standard delivery speed"
      ],
      popular: false
    },
    {
      name: "Business",
      price: "KES 0.40",
      unit: "per SMS",
      features: [
        "Up to 50,000 SMS/month",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom sender ID"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      unit: "pricing",
      features: [
        "Unlimited SMS",
        "Dedicated infrastructure",
        "24/7 support",
        "Advanced integrations",
        "Custom solutions"
      ],
      popular: false
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-orange" />,
      title: "98% Open Rate",
      description: "SMS messages have the highest open rates of any communication channel"
    },
    {
      icon: <Zap className="h-8 w-8 text-brand-orange" />,
      title: "Instant Delivery",
      description: "Messages delivered within seconds across all major networks"
    },
    {
      icon: <Users className="h-8 w-8 text-brand-orange" />,
      title: "Wide Reach",
      description: "Connect with customers across all mobile networks in Kenya and beyond"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Bulk SMS Kenya for Businesses | Zira SMS"
        description="Reach customers instantly with Zira SMS. Affordable bulk SMS solutions with branded sender IDs, scheduling, analytics, and high open rates for marketing in Kenya."
        keywords="bulk SMS Kenya, business SMS solutions, SMS marketing platform Kenya, send bulk SMS to customers, affordable bulk SMS packages, SMS gateway Kenya"
        canonical="https://ziratechnologies.com/bulk-sms-kenya"
        schema={productSchema}
        ogImage="https://ziratechnologies.com/assets/zira-sms-dashboard.jpg"
      />
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-orange/20 text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-brand-orange rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-brand-orange/20 text-white border-brand-orange/30 px-4 py-2 text-sm font-medium">
              🇰🇪 Bulk SMS Kenya Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-brand-orange bg-clip-text text-transparent leading-tight">
              Bulk SMS Kenya
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Reach every customer instantly with <span className="text-brand-orange font-semibold">98% delivery rates</span> across all Kenyan networks. 
              Affordable bulk SMS solutions for business SMS marketing, customer notifications, and automated messaging campaigns.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button 
                size="lg" 
                variant="cta"
                onClick={scrollToContact}
                className="group relative text-lg px-10 py-6 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange/80 hover:from-brand-orange/90 hover:to-brand-orange text-white font-bold shadow-2xl hover:shadow-brand-orange/25 transform hover:-translate-y-2 transition-all duration-300 border-2 border-brand-orange/20 hover:border-brand-orange/40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center">
                  <Zap className="mr-3 h-6 w-6 animate-pulse" />
                  Start Sending SMS Today
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Button>
              <DemoBookingModal platform="Zira SMS">
                <Button 
                  size="lg" 
                  variant="hero"
                  className="group relative border-3 border-white bg-white/10 text-white hover:bg-white hover:text-brand-navy backdrop-blur-md text-lg px-10 py-6 rounded-2xl font-bold shadow-2xl hover:shadow-white/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center">
                    <Video className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    See Live Demo
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Button>
              </DemoBookingModal>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-brand-orange" />
                No Setup Fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-brand-orange" />
                From KES 0.40/SMS
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-brand-orange" />
                All Kenya Networks
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Hero Visual */}
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="relative">
            <div className="w-48 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-2xl">
              <MessageSquare className="h-16 w-16 text-white/80" />
            </div>
            <div className="absolute -top-3 -right-3 flex space-x-1">
              <div className="w-4 h-4 bg-brand-orange rounded-full animate-pulse shadow-lg"></div>
              <div className="w-4 h-4 bg-brand-orange rounded-full animate-pulse delay-100 shadow-lg"></div>
              <div className="w-4 h-4 bg-brand-orange rounded-full animate-pulse delay-200 shadow-lg"></div>
            </div>
            {/* Floating message bubbles */}
            <div className="absolute -left-8 top-8 w-6 h-6 bg-brand-orange/30 rounded-full animate-bounce"></div>
            <div className="absolute -right-4 bottom-8 w-4 h-4 bg-white/40 rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose SMS Marketing?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              SMS remains the most effective direct communication channel with unmatched reach and engagement rates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-brand-navy">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Comprehensive Messaging Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to run successful SMS campaigns and customer communications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    <div className="text-brand-orange">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Versatile Use Cases
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From marketing campaigns to emergency alerts, Zira SMS adapts to your communication needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-navy to-brand-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                    {index === 0 && <Target className="h-8 w-8 text-white" />}
                    {index === 1 && <Users className="h-8 w-8 text-white" />}
                    {index === 2 && <Shield className="h-8 w-8 text-white" />}
                  </div>
                  <CardTitle className="text-xl text-center">{useCase.title}</CardTitle>
                  <CardDescription className="text-center">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-brand-orange mr-3 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{example}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your messaging volume and business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative group hover:shadow-xl transition-all duration-300 ${tier.popular ? 'ring-2 ring-brand-orange' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-orange text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-brand-navy">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">{tier.unit}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-brand-orange mr-3 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full group"
                    variant={tier.popular ? 'cta' : 'hero'}
                    onClick={scrollToContact}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Enhanced CTA Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-brand-navy via-brand-navy/95 to-brand-orange relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-brand-orange bg-clip-text text-transparent">
              Ready to Reach Your Customers Instantly?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed">
              Join <span className="text-brand-orange font-semibold">500+ Kenyan businesses</span> using Zira SMS for reliable, scalable messaging solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                size="lg" 
                variant="cta"
                className="bg-white text-brand-navy hover:bg-white/90 text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 group"
                onClick={scrollToContact}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="hero"
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-brand-navy backdrop-blur-sm text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 group"
                onClick={scrollToContact}
              >
                View Pricing
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            {/* Enhanced Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-brand-orange" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Call or WhatsApp</div>
                  <div className="text-white/80">+254 757878023</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-brand-orange" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">Email Us</div>
                  <div className="text-white/80">info@ziratech.com</div>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-white/80">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-brand-orange" />
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-brand-orange" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-brand-orange" />
                <span>98% Delivery Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactZiraSMS />
      <Footer />
    </div>
  );
};

export default ZiraSMS;