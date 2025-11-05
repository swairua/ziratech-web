import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Globe, Zap, Users, TrendingUp, Code, Shield, ArrowRight, CheckCircle } from "lucide-react";

const ZiraWebHighlight = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Beautiful, Responsive Design",
      description: "Mobile-first websites that look stunning on any device"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast Performance",
      description: "Optimized for speed and search engine rankings"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Modern Technology Stack",
      description: "Built with React, Supabase, and latest frameworks"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Scalable",
      description: "Enterprise-ready security and performance"
    }
  ];

  const highlights = [
    "Custom website design & development",
    "E-commerce platforms with full checkout flows",
    "SEO optimization & performance tuning",
    "Integration with tools & payment systems",
    "Ongoing maintenance & dedicated support"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-navy mb-6">
            Digital Presence That Converts
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your website is often the first impression customers have of your business. Zira Web builds stunning, 
            fast, and conversion-optimized digital experiences for ambitious brands across Africa.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center max-w-6xl mx-auto">
          {/* Left: Features Grid */}
          <div>
            <h3 className="text-2xl font-bold text-brand-navy mb-8">Why Choose Zira Web?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    <div className="text-brand-orange">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="font-semibold text-brand-navy mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Highlights */}
          <div className="bg-gradient-to-br from-brand-navy/5 to-brand-orange/5 p-8 rounded-2xl border border-brand-orange/10">
            <h3 className="text-2xl font-bold text-brand-navy mb-8">What's Included</h3>
            <div className="space-y-4 mb-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-orange mt-0.5 flex-shrink-0" />
                  <p className="text-foreground">{highlight}</p>
                </div>
              ))}
            </div>
            
            <div className="mb-6 p-4 bg-white rounded-lg border border-brand-orange/20">
              <p className="text-sm font-semibold text-brand-navy mb-2">150+ Websites Built</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-orange" />
                <span className="text-sm text-muted-foreground">Trusted by businesses across Kenya</span>
              </div>
            </div>

            <Button 
              size="lg"
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
              onClick={() => {
                navigate('/web-development-kenya');
                window.scrollTo(0, 0);
              }}
            >
              Explore Zira Web
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-orange mb-2">150+</div>
            <p className="text-muted-foreground">Websites Built</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-orange mb-2">98%</div>
            <p className="text-muted-foreground">Client Satisfaction</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-orange mb-2">2-4 weeks</div>
            <p className="text-muted-foreground">Average Project Timeline</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZiraWebHighlight;
