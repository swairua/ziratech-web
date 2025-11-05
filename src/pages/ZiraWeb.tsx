import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/lib/portfolioService";
import { Link, useNavigate } from "react-router-dom";
import { 
  Globe, 
  Code, 
  Smartphone, 
  ShoppingCart,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Star,
  Users,
  Clock,
  TrendingUp,
  Building,
  Heart,
  GraduationCap,
  Briefcase,
  Rocket
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DemoBookingModal from "@/components/DemoBookingModal";
import ContactZiraWeb from "@/components/ContactZiraWeb";
import SEO from "@/components/SEO";
import { OfferPopup } from "@/components/OfferPopup";
import webDevWorkspace from "@/assets/web-dev-workspace.jpg";
import teamCollaboration from "@/assets/team-collaboration.jpg";
import responsiveMockup from "@/assets/responsive-mockup.jpg";

const ZiraWeb = () => {
  const navigate = useNavigate();
  
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch portfolio projects
  const { data: allProjects = [], isLoading: isPortfolioLoading } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: portfolioService.getPublishedProjects,
  });

  // Filter and get top 3 website projects
  const getWebsiteProjects = () => {
    const webTags = ['web', 'website', 'web app', 'landing', 'ecommerce', 'cms'];
    const webKeywords = ['web', 'website', 'ecom', 'commerce'];
    
    const websiteProjects = allProjects.filter(project => {
      const hasWebTag = project.tags?.some(tag => 
        webTags.some(webTag => tag.toLowerCase().includes(webTag))
      );
      const hasWebIndustry = project.industry && 
        webKeywords.some(keyword => project.industry.toLowerCase().includes(keyword));
      
      return hasWebTag || hasWebIndustry;
    });

    // If we have fewer than 3, fill with featured or recent projects
    if (websiteProjects.length < 3) {
      const remaining = allProjects
        .filter(p => !websiteProjects.includes(p))
        .slice(0, 3 - websiteProjects.length);
      websiteProjects.push(...remaining);
    }

    return websiteProjects.slice(0, 3);
  };

  const topWebsiteProjects = getWebsiteProjects();

  const services = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Beautiful, Responsive Design",
      description: "Mobile-first, lightning-fast, and elegantly on-brand websites that make unforgettable first impressions"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Functional by Default",
      description: "Contact forms, booking flows, integrated payments, newsletter sign-ups — all optimized to work hard for you"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Built to Grow With You",
      description: "Whether launching your first product or running complex digital business, we scale with your ambition"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Future-Ready",
      description: "SSL encryption, clean code, optimized performance — ready for SEO, social sharing, and integrations"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Modern Technology Stack",
      description: "Built with Lovable AI, Supabase backend, GitHub version control, and flexible hosting options"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "All Organization Types",
      description: "From small businesses to tech startups, education to healthcare — we serve ambitious brands across all sectors"
    }
  ];

  const sectors = [
    {
      icon: <Building className="h-6 w-6" />,
      title: "Small Businesses",
      description: "Websites with lead generation, booking tools, and integrations"
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Professional Services", 
      description: "Portfolios, contact automation, resource hubs"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Education",
      description: "School websites, student portals, e-learning integration"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Healthcare",
      description: "Clinic websites, intake forms, online scheduling"
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "E-commerce",
      description: "Stores with full checkout flows, shipping, and analytics"
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Tech & SaaS",
      description: "Landing pages, user onboarding, documentation systems"
    }
  ];

  const portfolioHighlights = [
    {
      title: "E-commerce Platform",
      description: "Complete online marketplace with multi-vendor support",
      technologies: ["React", "Node.js", "Stripe", "MongoDB"],
      results: "300% increase in online sales"
    },
    {
      title: "Corporate Website",
      description: "Professional corporate site with CMS integration",
      technologies: ["WordPress", "Custom PHP", "MySQL"],
      results: "50% increase in lead generation"
    },
    {
      title: "SaaS Application",
      description: "Cloud-based project management platform",
      technologies: ["Vue.js", "Laravel", "AWS", "Redis"],
      results: "1000+ active users within 6 months"
    }
  ];

  const whyChooseZira = [
    {
      icon: <Clock className="h-8 w-8 text-brand-orange" />,
      title: "Fast Delivery",
      description: "Most projects completed within 2-4 weeks"
    },
    {
      icon: <Code className="h-8 w-8 text-brand-orange" />,
      title: "Modern Technology",
      description: "Built with the latest web technologies and best practices"
    },
    {
      icon: <Users className="h-8 w-8 text-brand-orange" />,
      title: "Dedicated Support",
      description: "Ongoing support and maintenance after launch"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-orange" />,
      title: "Scalable Solutions",
      description: "Websites that grow with your business needs"
    }
  ];

  const testimonials = [
    {
      name: "Tech Startup Founder",
      text: "Zira built us a clean, modern site that made us look like a premium brand overnight.",
      rating: 5
    },
    {
      name: "Wellness Business Owner", 
      text: "The booking system they added helped us cut customer calls by 40% — everything just works.",
      rating: 5
    },
    {
      name: "Educational Director",
      text: "Our new student portal streamlined admissions and improved parent communication tremendously.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Web Development Kenya | Professional Websites by Zira"
        description="Professional web development services in Kenya. Custom websites, e-commerce platforms, and web applications for businesses across all sectors."
        keywords="web development Kenya, website design Kenya, custom web development, e-commerce development Kenya, responsive website design, professional websites Kenya"
        canonical="https://ziratechnologies.com/web-development-kenya"
        ogImage="https://ziratechnologies.com/assets/web-dev-dashboard.jpg"
      />
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-orange/20 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Modern Websites for Ambitious Brands
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-brand-orange bg-clip-text text-transparent">
              Zira Web
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Build a digital presence that reflects your vision. We design and develop stunning websites and web applications that elevate your brand, streamline your processes, and help you scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-4 text-lg"
                onClick={scrollToContact}
              >
                Build with Zira Web
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="relative">
            <img 
              src={webDevWorkspace} 
              alt="Modern web development workspace"
              className="w-64 h-40 object-cover rounded-lg shadow-2xl border border-white/20"
            />
            <div className="absolute -bottom-4 -left-4 w-24 h-16 bg-brand-orange/20 backdrop-blur-sm rounded-lg border border-brand-orange/30 flex items-center justify-center">
              <Globe className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Zira Web?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We design and develop with real-world use in mind, creating digital experiences that work hard for ambitious brands.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    <div className="text-brand-orange">
                      {service.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* We Serve All Types of Organizations */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              We Serve All Types of Organizations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From startups to established businesses, education to healthcare — we build for ambitious brands across all sectors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sectors.map((sector, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    <div className="text-brand-orange">
                      {sector.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{sector.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{sector.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Portfolio
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A clean, sleek showcase of work across sectors — responsive designs that drive results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {portfolioHighlights.map((project, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-brand-navy/10 to-brand-orange/10 flex items-center justify-center">
                  {index === 0 && <img src={responsiveMockup} alt="Responsive design showcase" className="w-full h-full object-cover" />}
                  {index === 1 && <img src={teamCollaboration} alt="Team collaboration" className="w-full h-full object-cover" />}
                  {index === 2 && <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-orange flex items-center justify-center"><Rocket className="h-16 w-16 text-white" /></div>}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Technologies Used:</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-700">
                      {project.results}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top 3 Real Portfolio Projects */}
          {topWebsiteProjects.length > 0 && (
            <div className="mt-20">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Recent Website Projects
                </h3>
                <p className="text-lg text-muted-foreground">
                  Live examples from our portfolio
                </p>
              </div>

              {isPortfolioLoading ? (
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mb-4">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {topWebsiteProjects.map((project) => (
                    <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {project.cover_image_url ? (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={project.cover_image_url} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-brand-navy/10 to-brand-orange/10 flex items-center justify-center">
                          <Globe className="h-16 w-16 text-brand-orange/60" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          {project.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {project.industry}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {project.short_description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                                <Badge key={techIndex} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                         <div className="flex gap-2">
                           {project.live_url ? (
                             <Button 
                               variant="cta" 
                               size="sm" 
                               className="flex-1"
                               onClick={() => window.open(project.live_url, '_blank')}
                             >
                               View Live
                             </Button>
                           ) : (
                             <Button 
                               variant="cta" 
                               size="sm" 
                               className="flex-1"
                               onClick={() => navigate(`/portfolio/${project.slug}`)}
                             >
                               View Details
                             </Button>
                           )}
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              variant="cta" 
              size="lg"
              onClick={() => navigate("/portfolio#top")}
              className="px-8 py-4 text-lg"
            >
              See Full Portfolio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* What Powers Our Builds */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What Powers Our Builds
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Modern technology stack for secure, professional, and future-ready websites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {whyChooseZira.map((reason, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-orange/20 transition-colors">
                    {reason.icon}
                  </div>
                  <CardTitle className="text-lg">{reason.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{reason.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real feedback from ambitious brands we've helped succeed online
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <Star key={starIndex} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-center italic">
                    "{testimonial.text}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      <ContactZiraWeb />
      <Footer />
      <OfferPopup currentPath="/zira-web" />
    </div>
  );
};

export default ZiraWeb;