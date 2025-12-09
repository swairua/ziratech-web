import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  CheckCircle,
  ArrowRight,
  BarChart3,
  KeyRound,
  Smartphone,
  Building,
  TrendingUp,
  Video
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactZiraHomes from "@/components/ContactZiraHomes";
import SEO from "@/components/SEO";
import { OfferPopup } from "@/components/OfferPopup";
import africanPersonMobile from "@/assets/african-person-mobile-estate.jpg";

const ZIRA_HOMES_WEBAPP_URL = "https://www.zira-homes.com/";

const ZiraHomes = () => {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Zira Homes - Rental Management Software",
    "description": "Complete rental management software for landlords in Kenya. Automate rent collection via M-Pesa, track tenants, manage leases, and send SMS reminders.",
    "applicationCategory": "PropertyManagementSoftware",
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "Contact for pricing",
      "priceCurrency": "KES"
    },
    "provider": {
      "@type": "Organization",
      "name": "Zira Technologies"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does M-Pesa rent collection work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zira Homes integrates with M-Pesa to automatically collect rent payments. Tenants receive payment reminders via SMS and can pay directly through M-Pesa. All payments are tracked automatically in the system."
        }
      },
      {
        "@type": "Question",
        "name": "Can I manage multiple properties?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Zira Homes supports unlimited properties and units. You can manage multiple buildings, track different lease terms, and generate separate reports for each property."
        }
      }
    ]
  };

  const features = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Automated Rent Collection & Tracking",
      description: "Track payments, send automated reminders, and monitor late fees — perfect for busy diaspora landlords managing properties remotely."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Detailed Reports & Insights",
      description: "Comprehensive financial reporting and property analytics that busy professionals need to make informed investment decisions."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Lease & Expense Management",
      description: "Easily upload lease agreements and monitor recurring or usage-based expenses. Stay organized, always."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Reports & KPIs at Your Fingertips",
      description: "Understand your rental performance with real-time dashboards and downloadable reports."
    },
    {
      icon: <KeyRound className="h-6 w-6" />,
      title: "Remote Management Controls",
      description: "Assign roles, control permissions, and manage multiple properties seamlessly — ideal for investors managing portfolios from anywhere."
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Global Access, Local Expertise",
      description: "Manage your Kenyan properties from London, Toronto, or anywhere. Built for the diaspora with local market knowledge and global accessibility."
    }
  ];

  const quickFeatures = [
    "Unlimited property & unit management",
    "Lease uploads & tracking",
    "Tenant onboarding with profession & employment info",
    "Rent & deposit logging",
    "Utility & service fee tracking",
    "Custom expense categories",
    "Notifications & alerts",
    "Role-based access control",
    "Secure cloud storage via Supabase",
    "Clean, modern UI/UX"
  ];

  const targetUsers = [
    "Landlords with 1 to 100+ units",
    "Property Managers managing for multiple owners",
    "Agents looking to streamline operations",
    "Housing Cooperatives & gated communities",
    "Commercial property owners needing hybrid lease tracking"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Rental Management Software Kenya | Zira Homes"
        description="Simplify property management with Zira Homes. Automate rent collection via M-Pesa, track tenants and leases, send SMS reminders, and manage documents easily."
        keywords="rental management software Kenya, property management system Kenya, online rent collection platform, landlord tenant management system, M-Pesa rent collection, tenant tracking Kenya"
        canonical="https://ziratechnologies.com/rental-management-kenya"
        schema={[productSchema, faqSchema]}
        ogImage="https://ziratechnologies.com/assets/zira-homes-dashboard.jpg"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-orange/20 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
                Rental Management Software Kenya
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-brand-orange bg-clip-text text-transparent">
                Rental Management Software Kenya
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
                Property Management System for Kenyan Landlords
              </h2>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Transform your property management business with our comprehensive rental management software designed for Kenya. 
                Automate rent collection via M-Pesa, track tenants efficiently, manage leases digitally, send SMS reminders, 
                and access detailed reporting from anywhere. Perfect for diaspora landlords and local property managers who need 
                smart rental platform solutions that work with Kenyan banking and mobile money systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <a href={ZIRA_HOMES_WEBAPP_URL} target="_blank" rel="noopener noreferrer">
                    Start Managing Smarter Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-brand-navy px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all"
                  asChild
                >
                  <a href="#contact">
                    Request for a Demo
                    <Video className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/lovable-uploads/6849846c-44dd-48b1-b784-df9410c87150.png" 
                alt="Rental management software Kenya dashboard showing property management system features including tenant tracking, M-Pesa rent collection, and lease management tools" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/20 to-transparent pointer-events-none" />
      </section>

      {/* Why Choose Zira Homes */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Advanced Property Management System Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete landlord tenant management system with automated rental payments, digital property management tools, 
              and smart rental platform features designed specifically for Kenya's property management market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 text-center border-l-4 border-l-brand-orange">
                <CardHeader>
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    <div className="text-brand-orange">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-brand-navy">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <div className="px-6 pb-6">
                  <Button 
                    className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-2"
                    asChild
                  >
                    <a href="#contact">
                      Request for a Demo
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features at a Glance */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Features at a Glance
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive tools for modern property management across Africa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickFeatures.map((feature, index) => (
              <div key={index} className="flex items-center p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <CheckCircle className="h-5 w-5 text-brand-orange mr-3 flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is Zira Homes For */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Who Is Zira Homes For?
            </h2>
            <p className="text-xl text-muted-foreground">
              Perfect for property professionals across Africa and emerging markets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {targetUsers.map((user, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brand-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-6 w-6 text-brand-navy" />
                </div>
                <p className="font-medium text-foreground">{user}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Showcase */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Mobile Friendly, Built for Growth
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Access your dashboard anywhere across Africa and beyond. From Nairobi to Lagos, Cape Town to Cairo, 
                you'll have the same smooth experience on desktop, tablet, or phone, even on 3G connections.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-brand-orange mr-3" />
                  <span>Responsive design for all devices</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-brand-orange mr-3" />
                  <span>Offline-capable for remote areas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-brand-orange mr-3" />
                  <span>Built for African markets and connectivity</span>
                </div>
              </div>
              <div className="mt-8">
                <Button 
                  size="lg" 
                  className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-3 text-lg font-semibold shadow-lg"
                  asChild
                >
                  <a href="#contact">
                    Request for a Demo
                    <Smartphone className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={africanPersonMobile} 
                alt="African property manager using mobile app" 
                className="rounded-lg shadow-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <ContactZiraHomes />

      <Footer />
      <OfferPopup currentPath="/zira-homes" />
    </div>
  );
};

export default ZiraHomes;