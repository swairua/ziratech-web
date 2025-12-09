import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Shield, Zap, Quote, Star } from "lucide-react";

const Impact = () => {
  const stats = [
    {
      icon: <Users className="h-8 w-8 text-brand-orange" />,
      value: "2,000+",
      label: "Active Users",
      description: "Businesses trusting our platforms"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-orange" />,
      value: "KES 75M+",
      label: "Transactions Processed",
      description: "Value flowing through our platforms"
    },
    {
      icon: <Shield className="h-8 w-8 text-brand-orange" />,
      value: "99.9%",
      label: "Platform Uptime",
      description: "Enterprise-grade reliability"
    },
    {
      icon: <Zap className="h-8 w-8 text-brand-orange" />,
      value: "65%",
      label: "Efficiency Increase",
      description: "Average business improvement"
    }
  ];

  const testimonials = [
    {
      quote: "Zira Homes transformed how we manage our rental properties. What used to take days now takes minutes. Our tenants love the digital experience, and we've reduced late payments by 80%.",
      name: "Sarah Kimani",
      title: "Property Manager",
      company: "Kimani Properties",
      rating: 5
    },
    {
      quote: "The Zira Lock platform has revolutionized our device financing business. Default rates dropped by 65% in the first quarter. It's been a game-changer for expanding smartphone access in Kenya.",
      name: "David Ochieng",
      title: "Operations Director",
      company: "TechFinance Kenya",
      rating: 5
    },
    {
      quote: "With Zira SMS, we've reached over 50,000 customers with our marketing campaigns. The delivery rates are exceptional, and the analytics help us optimize every message we send.",
      name: "Grace Wanjiku",
      title: "Marketing Manager",
      company: "Greenfield Cooperative",
      rating: 5
    },
    {
      quote: "Our new website built by Zira Technologies increased our online inquiries by 300% in just two months. The modern design and fast loading speed have transformed our digital presence completely.",
      name: "James Mwangi",
      title: "CEO",
      company: "Savanna Business Solutions",
      rating: 5
    }
  ];

  const achievements = [
    "TechCrunch Africa Rising Star 2024",
    "Kenya ICT Innovation Award Winner",
    "Best SaaS Platform - Africa Tech Summit",
    "Top 10 African Startups to Watch"
  ];

  return (
    <section id="impact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-8 px-6 py-3 text-white bg-brand-navy border-0 shadow-lg font-semibold text-sm tracking-wide uppercase">
            Proven Impact
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-brand-navy mb-6">
            Transforming African
            <span className="text-brand-orange"> Business</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our platforms aren't just tools — they're catalysts for growth. Here's how we're empowering 
            businesses across Africa to achieve unprecedented efficiency and scale.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-orange/10 to-brand-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-brand-navy mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-brand-navy mb-2">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-brand-navy mb-4">What Our Clients Say</h3>
            <p className="text-lg text-muted-foreground">
              Real stories from African businesses using Zira platforms to drive growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <Quote className="h-8 w-8 text-brand-orange mb-4" />
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="border-t pt-4">
                    <div className="font-semibold text-brand-navy">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Impact;