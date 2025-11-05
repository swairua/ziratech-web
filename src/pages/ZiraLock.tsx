import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Smartphone, 
  Shield, 
  Zap,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Unlock,
  Settings,
  AlertTriangle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DemoBookingModal from "@/components/DemoBookingModal";
import ContactZiraLock from "@/components/ContactZiraLock";
import SEO from "@/components/SEO";
import iotDevices from "@/assets/iot-devices.jpg";
import dashboardAnalytics from "@/assets/dashboard-analytics.jpg";

const ZiraLock = () => {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Zira Lock - PAYGo Device Management",
    "description": "Secure PAYGo device management platform for smartphone financing and solar device control. Remote locking technology for loan recovery and asset management.",
    "applicationCategory": "FinancialSoftware",
    "operatingSystem": "Web-based",
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
      icon: <Lock className="h-6 w-6" />,
      title: "Remote Device Control",
      description: "Lock or unlock devices instantly based on payment status"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Flexible Payment Plans",
      description: "Create custom payment schedules and grace periods"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-time Monitoring",
      description: "Track device status and payment compliance in real-time"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Fraud Protection",
      description: "Advanced security measures to prevent device tampering"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Customer Management",
      description: "Comprehensive customer profiles and payment history"
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Risk Assessment",
      description: "AI-powered risk scoring and default prediction"
    }
  ];

  const useCases = [
    {
      title: "Solar Energy Financing",
      description: "Enable affordable solar access with payment-based device control",
      benefits: ["Reduced default rates", "Expanded market reach", "Automated compliance"]
    },
    {
      title: "Smartphone Financing",
      description: "Provide smartphones on flexible payment plans with security",
      benefits: ["Device protection", "Payment enforcement", "Customer retention"]
    },
    {
      title: "Equipment Leasing",
      description: "Secure high-value equipment rentals and leases",
      benefits: ["Asset protection", "Remote management", "Instant recovery"]
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Device Registration",
      description: "Register devices in the Zira Lock system with unique identifiers"
    },
    {
      step: "2",
      title: "Customer Onboarding",
      description: "Set up customer profiles with payment plans and device assignments"
    },
    {
      step: "3",
      title: "Automated Monitoring",
      description: "System monitors payments and automatically manages device access"
    },
    {
      step: "4",
      title: "Smart Enforcement",
      description: "Devices lock/unlock based on payment status and configured rules"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="PAYGo Smartphone Management Kenya | Zira Lock"
        description="Secure device financing with Zira Lock. Our PAYGo device locking platform supports smartphones and solar devices, enabling safe financing and loan recovery."
        keywords="PAYGo smartphone management, device locking software Kenya, smartphone financing platform, PAYGo solar device management, secure smartphone financing, GSM device lock technology"
        canonical="https://ziratechnologies.com/paygo-device-management"
        schema={productSchema}
        ogImage="https://ziratechnologies.com/assets/zira-lock-dashboard.jpg"
      />
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-orange/20 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              PAYGo Smartphone Management Kenya
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-brand-orange bg-clip-text text-transparent">
              PAYGo Device Management
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Secure smartphone financing platform with device locking software for Kenya. Enable PAYGo solar device management and remote GSM device lock technology to reduce defaults and expand access to technology through safe financing solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-4 text-lg"
                onClick={scrollToContact}
              >
                Talk to Us About Zira Lock
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <DemoBookingModal platform="Zira Lock">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-brand-navy px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all"
                >
                  View Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </DemoBookingModal>
            </div>
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="relative">
            <div className="w-32 h-56 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 flex items-center justify-center">
              <Smartphone className="h-16 w-16 text-white/80" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How Zira Lock Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, secure, and automated device management that protects your investments while enabling customer access.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 text-center relative">
                <CardHeader>
                  <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-orange/30"></div>
                )}
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
              Comprehensive Device Management Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to secure your PAYGo business and reduce financial risk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                {index === 0 && (
                  <div className="h-48 overflow-hidden">
                    <img src={iotDevices} alt="PAYGo device management technology showing smartphone financing and solar device control systems for Kenya" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                {index === 1 && (
                  <div className="h-48 overflow-hidden">
                    <img src={dashboardAnalytics} alt="PAYGo analytics dashboard showing device locking software performance and smartphone financing metrics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                {index === 2 && (
                  <div className="h-48 bg-gradient-to-br from-brand-navy/10 to-brand-orange/10 flex items-center justify-center">
                    <Smartphone className="h-16 w-16 text-brand-navy" />
                  </div>
                )}
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
              Proven Use Cases Across Industries
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From solar energy to smartphone financing, Zira Lock enables secure PAYGo business models.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-navy to-brand-orange rounded-lg flex items-center justify-center mx-auto mb-4">
                    {index === 0 && <Zap className="h-8 w-8 text-white" />}
                    {index === 1 && <Smartphone className="h-8 w-8 text-white" />}
                    {index === 2 && <Settings className="h-8 w-8 text-white" />}
                  </div>
                  <CardTitle className="text-xl text-center">{useCase.title}</CardTitle>
                  <CardDescription className="text-center">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-brand-orange mr-3 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Device Visual Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-8">
              Secure. Reliable. Scalable.
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Unlock className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Payment Received</h3>
                <p className="text-muted-foreground text-sm">Device automatically unlocks when payment is confirmed</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Payment Overdue</h3>
                <p className="text-muted-foreground text-sm">Device locks securely until payment is made</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-muted-foreground text-sm">Monitor performance and compliance across your fleet</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactZiraLock />
      <Footer />
    </div>
  );
};

export default ZiraLock;