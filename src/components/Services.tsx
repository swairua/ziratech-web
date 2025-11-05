import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Home, Lock, MessageSquare, Globe } from "lucide-react";
import ziraHomesIcon from "@/assets/zira-homes-icon.jpg";
import ziraLockIcon from "@/assets/zira-lock-icon.jpg";
import ziraSmsIcon from "@/assets/zira-sms-icon.jpg";
import webDevIcon from "@/assets/web-dev-icon.jpg";

const Services = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const services = [
    {
      icon: <Home className="h-8 w-8 text-brand-navy" />,
      image: ziraHomesIcon,
      title: "Zira Homes",
      subtitle: "Property Management Platform",
      description: "Automate rent tracking, lease management, and tenant communication. Perfect for landlords and property managers who want to streamline their operations and reduce manual work.",
      features: [
        "Automated rent collection tracking",
        "Digital lease management",
        "Tenant communication portal",
        "Payment reminders & notifications",
        "Property maintenance scheduling"
      ],
      cta: "Learn More About Zira Homes"
    },
    {
      icon: <Lock className="h-8 w-8 text-brand-orange" />,
      image: ziraLockIcon,
      title: "Zira Lock",
      subtitle: "PAYGo Device Management",
      description: "Enable financiers of smartphones and solar devices to remotely manage device access based on payment status. Reduce default rates and expand access to technology.",
      features: [
        "Remote device lock/unlock",
        "Payment-based access control",
        "Real-time device monitoring",
        "Flexible payment plans",
        "Risk management tools"
      ],
      cta: "Discover Zira Lock"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-brand-navy" />,
      image: ziraSmsIcon,
      title: "Zira SMS",
      subtitle: "Bulk Messaging Platform",
      description: "Send marketing messages, alerts, and customer updates at scale. Perfect for businesses, cooperatives, and institutions that need reliable communication channels.",
      features: [
        "Bulk SMS campaigns",
        "Automated messaging",
        "Customer segmentation",
        "Delivery reports & analytics",
        "API integration"
      ],
      cta: "Try Zira SMS"
    },
    {
      icon: <Globe className="h-8 w-8 text-brand-orange" />,
      image: webDevIcon,
      title: "Website Development",
      subtitle: "Professional Web Solutions",
      description: "Custom websites for SMEs, startups, and service providers. Improve your digital presence with modern, responsive websites that convert visitors into customers.",
      features: [
        "Custom website design",
        "Mobile-responsive layouts",
        "SEO optimization",
        "E-commerce integration",
        "Ongoing maintenance & support"
      ],
      cta: "Get Your Website"
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We build smart digital platforms that solve real problems for businesses across Africa. 
            Each solution is designed to increase efficiency, reduce costs, and drive growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img 
                      src={service.image} 
                      alt={`${service.title} - ${service.subtitle} platform showcase`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
                    <CardDescription className="text-brand-navy font-medium">
                      {service.subtitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-brand-orange rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-brand-navy group-hover:text-primary-foreground transition-colors"
                  onClick={scrollToContact}
                >
                  {service.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;