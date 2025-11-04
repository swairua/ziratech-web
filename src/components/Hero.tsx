import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap, Shield, Globe2 } from "lucide-react";
// Use optimized CDN image for hero background
const AFRICAN_HERO_BANNER = "https://cdn.builder.io/api/v1/image/assets%2F150a78d67a964e7687264c9806aa58ae%2F6bf90dacd92e49de87d411f713341609?format=webp&width=1600";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={AFRICAN_HERO_BANNER}
          alt="African Technology Landscape"
          className="w-full h-full object-cover opacity-40"
          loading="lazy"
          width={1600}
          height={970}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/40 via-black/30 to-brand-orange/25"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-brand-navy px-8 py-4 rounded-full text-sm font-bold border border-brand-navy/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-white/90 group">
                <Zap className="h-4 w-4 text-brand-orange group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-brand-navy">Powering African Digital Transformation</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-brand-navy leading-tight">
                Build. Scale.
                <span className="text-brand-orange"> Dominate.</span>
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed max-w-xl">
                Four powerful platforms. One vision. We're not just building software — we're architecting the digital infrastructure that will power Africa's next business revolution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('platforms')}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white text-lg px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Explore Platforms
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => scrollToSection('impact')}
                className="text-lg px-8 py-6 rounded-xl bg-white text-brand-navy hover:bg-white/90 hover:text-brand-navy border-0 transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                See Impact
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-orange">1000+</div>
                <div className="text-sm text-white">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-orange">4</div>
                <div className="text-sm text-white">Core Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-orange">99.9%</div>
                <div className="text-sm text-white">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Column - Platform Preview */}
          <div className="lg:pl-12">
            <div className="relative">
              {/* Main Platform Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-navy to-brand-orange rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">Z</span>
                    </div>
                    <div>
                      <div className="font-semibold text-brand-navy">Zira Platform Suite</div>
                      <div className="text-sm text-muted-foreground">Connected Business Tools</div>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                {/* Platform Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-brand-navy" />
                      <span className="font-medium text-brand-navy">Zira Homes</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Property Management</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-5 w-5 text-brand-orange" />
                      <span className="font-medium text-brand-navy">Zira Lock</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Device Management</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe2 className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-brand-navy">Zira SMS</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Bulk Messaging</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-brand-navy">Web Dev</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Digital Presence</div>
                  </div>
                </div>
                
                {/* Stats Bar */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Platform Performance</span>
                    <span className="text-sm font-medium text-green-600">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-brand-navy to-brand-orange h-2 rounded-full w-[94%]"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-brand-orange text-white p-3 rounded-full shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-brand-navy text-white p-3 rounded-full shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
