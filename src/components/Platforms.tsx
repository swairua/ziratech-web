import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Home, Lock, MessageSquare, Globe, Users, DollarSign, BarChart3, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Platforms = () => {
  const navigate = useNavigate();

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToPlatform = (platformName: string) => {
    const routes = {
      "Zira Homes": "/zira-homes",
      "Zira Lock": "/zira-lock", 
      "Zira SMS": "/zira-sms",
      "Web Development": "/zira-web"
    };
    navigate(routes[platformName as keyof typeof routes]);
    window.scrollTo(0, 0);
  };

  const platforms = [
    {
      icon: <Home className="h-8 w-8" />,
      title: "Zira Homes",
      subtitle: "Property Management Platform",
      description: "End-to-end property management platform that automates rent collection, lease management, and tenant communication. Built for African landlords and property managers.",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        "Automated rent tracking & collection",
        "Digital lease management",
        "Tenant communication portal",
        "Maintenance request system",
        "Financial reporting & analytics"
      ],
      metrics: [
        { label: "Properties", value: "500+", icon: <Home className="h-4 w-4" /> },
        { label: "Rent Collected", value: "KES 50M+", icon: <DollarSign className="h-4 w-4" /> },
        { label: "Users", value: "1,200+", icon: <Users className="h-4 w-4" /> }
      ],
      cta: "Manage Properties",
      badge: "Most Popular"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Zira Lock",
      subtitle: "PAYGo Device Intelligence",
      description: "Revolutionary device financing platform that enables lenders to remotely manage smartphone and solar device access based on payment status. Reducing default rates across Africa.",
      gradient: "from-orange-500 to-red-500",
      features: [
        "Remote device lock/unlock",
        "Payment-based access control",
        "Real-time device monitoring",
        "Flexible payment plans",
        "Default rate reduction tools"
      ],
      metrics: [
        { label: "Devices", value: "2,500+", icon: <Smartphone className="h-4 w-4" /> },
        { label: "Default Reduction", value: "65%", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Lenders", value: "45", icon: <Users className="h-4 w-4" /> }
      ],
      cta: "Secure Financing",
      badge: "Innovative"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Zira SMS",
      subtitle: "Bulk Communication at Scale",
      description: "Enterprise-grade bulk messaging platform designed for African businesses. Send marketing campaigns, alerts, and customer updates with unmatched delivery rates.",
      gradient: "from-purple-500 to-pink-500",
      features: [
        "Bulk SMS campaigns",
        "Automated messaging workflows",
        "Advanced customer segmentation",
        "Delivery analytics & reporting",
        "API integration & webhooks"
      ],
      metrics: [
        { label: "Messages/Month", value: "2M+", icon: <MessageSquare className="h-4 w-4" /> },
        { label: "Delivery Rate", value: "99.2%", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Businesses", value: "300+", icon: <Users className="h-4 w-4" /> }
      ],
      cta: "Send Messages",
      badge: "Enterprise Ready"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Web Development",
      subtitle: "Digital Presence That Converts",
      description: "Custom websites and web applications for African businesses. From startups to enterprises, we build fast, modern, and conversion-optimized digital experiences.",
      gradient: "from-green-500 to-emerald-500",
      features: [
        "Custom website design & development",
        "Mobile-first responsive layouts",
        "SEO optimization & performance",
        "E-commerce integration",
        "Ongoing maintenance & support"
      ],
      metrics: [
        { label: "Websites Built", value: "150+", icon: <Globe className="h-4 w-4" /> },
        { label: "Avg Load Time", value: "1.2s", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Client Satisfaction", value: "98%", icon: <Users className="h-4 w-4" /> }
      ],
      cta: "Build Website",
      badge: "Custom Solutions"
    }
  ];

  return (
    <section id="platforms" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-8 px-6 py-3 text-white bg-brand-orange border-0 shadow-lg font-semibold text-sm tracking-wide uppercase">
            Four Powerful Platforms
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
            Built for African
            <span className="text-brand-orange"> Businesses</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Each platform is meticulously designed to solve real challenges facing African businesses. 
            From property management to device financing — we're building the infrastructure for Africa's digital future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
          {platforms.map((platform, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${platform.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {platform.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <CardTitle className="text-2xl text-brand-navy">{platform.title}</CardTitle>
                        <Badge variant="outline" className="text-brand-orange border-brand-orange/30 bg-brand-orange/10 text-xs">
                          {platform.badge}
                        </Badge>
                      </div>
                      <CardDescription className="text-brand-orange font-semibold text-lg">
                        {platform.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {platform.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-brand-navy">Key Features</h4>
                  <ul className="space-y-2">
                    {platform.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-brand-orange rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics */}
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <h4 className="font-semibold text-brand-navy mb-3 text-sm">Platform Impact</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {platform.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="text-brand-navy">{metric.icon}</div>
                        </div>
                        <div className="text-lg font-bold text-brand-navy">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    console.log('Navigating to:', platform.title);
                    navigateToPlatform(platform.title);
                  }}
                  className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all group-hover:bg-brand-navy"
                >
                  {platform.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-brand-navy to-brand-navy-dark p-12 rounded-3xl text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of African businesses already using Zira platforms to streamline operations, 
            reduce costs, and accelerate growth.
          </p>
          <Button 
            size="lg"
            onClick={scrollToContact}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Platforms;