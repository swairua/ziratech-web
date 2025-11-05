import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    // First check if the section exists on the current page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
      return;
    }
    
    // If section doesn't exist on current page, navigate to home
    if (location.pathname !== '/') {
      navigate('/');
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        const homeElement = document.getElementById(sectionId);
        if (homeElement) {
          homeElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/c3459758-169f-4a51-bfc7-beb8ad362e87.png" 
              alt="Zira Technologies Logo" 
              className="w-10 h-10"
            />
            <div>
              <span className="text-xl font-bold text-brand-navy">Zira</span>
              <span className="text-sm text-muted-foreground block leading-tight">Technologies</span>
            </div>
          </button>
          
           {/* Desktop Navigation */}
           <nav className="hidden md:flex items-center space-x-8">
             <button 
               onClick={() => navigate('/')}
               className="text-muted-foreground hover:text-brand-navy transition-colors font-medium"
             >
               Home
             </button>
             <button 
               onClick={() => scrollToSection('platforms')}
               className="text-muted-foreground hover:text-brand-navy transition-colors font-medium"
             >
               Solutions
             </button>
             <DropdownMenu>
               <DropdownMenuTrigger className="flex items-center text-muted-foreground hover:text-brand-navy transition-colors font-medium">
                 Platforms
                 <ChevronDown className="ml-1 h-4 w-4" />
               </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link to="/rental-management-kenya">Zira Homes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/paygo-device-management">Zira Lock</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bulk-sms-kenya">Zira SMS</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/web-development-kenya">Zira Web</Link>
                  </DropdownMenuItem>
                  {user && (
                    <>
                      <div className="h-px bg-border my-2" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/portfolio" className="text-brand-orange">Admin: Manage Projects</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
             </DropdownMenu>
            <button 
              onClick={() => scrollToSection('impact')}
              className="text-muted-foreground hover:text-brand-navy transition-colors font-medium"
            >
              Impact
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-muted-foreground hover:text-brand-navy transition-colors font-medium"
            >
              Contact
            </button>
            <button 
              onClick={() => {
                navigate('/careers');
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              className="text-muted-foreground hover:text-brand-navy transition-colors font-medium"
            >
              Careers
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Context-aware CTA Button */}
            {(location.pathname === '/zira-homes' || location.pathname === '/rental-management-kenya') && (
              <Button
                variant="default"
                className="hidden md:inline-flex bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6"
                asChild
              >
                <a href="https://www.zira-homes.com/" target="_blank" rel="noopener noreferrer">
                  Get Zira Homes
                </a>
              </Button>
            )}
            {(location.pathname === '/zira-lock' || location.pathname === '/paygo-device-management') && (
              <Button
                variant="default"
                onClick={() => scrollToSection('contact')}
                className="hidden md:inline-flex bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6"
              >
                Secure My Devices
              </Button>
            )}
            {(location.pathname === '/zira-sms' || location.pathname === '/bulk-sms-kenya') && (
              <Button
                variant="default"
                onClick={() => scrollToSection('contact')}
                className="hidden md:inline-flex bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6"
              >
                Start Messaging
              </Button>
            )}
            {(location.pathname === '/zira-web' || location.pathname === '/web-development-kenya') && (
              <Button
                variant="default"
                onClick={() => scrollToSection('contact')}
                className="hidden md:inline-flex bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6"
              >
                Build My Website
              </Button>
            )}
            {location.pathname === '/' && (
              <Button
                variant="default"
                onClick={() => scrollToSection('contact')}
                className="hidden md:inline-flex bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6"
              >
                Start Building
              </Button>
            )}

            {/* User Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => {
                  navigate('/');
                  setIsMenuOpen(false);
                }}
                className="text-left text-foreground hover:text-brand-navy transition-colors"
              >
                Home
              </button>
              <div className="border-l-2 border-border pl-4 space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">Platforms</div>
                <button 
                  onClick={() => {
                    navigate('/rental-management-kenya');
                    setIsMenuOpen(false);
                  }}
                  className="block text-left text-foreground hover:text-brand-navy transition-colors"
                >
                  Zira Homes
                </button>
                <button 
                  onClick={() => {
                    navigate('/paygo-device-management');
                    setIsMenuOpen(false);
                  }}
                  className="block text-left text-foreground hover:text-brand-navy transition-colors"
                >
                  Zira Lock
                </button>
                <button 
                  onClick={() => {
                    navigate('/bulk-sms-kenya');
                    setIsMenuOpen(false);
                  }}
                  className="block text-left text-foreground hover:text-brand-navy transition-colors"
                >
                  Zira SMS
                </button>
                <button 
                  onClick={() => {
                    navigate('/web-development-kenya');
                    setIsMenuOpen(false);
                  }}
                  className="block text-left text-foreground hover:text-brand-navy transition-colors"
                >
                  Zira Web
                </button>
              </div>
              <button 
                onClick={() => scrollToSection('impact')}
                className="text-left text-foreground hover:text-brand-navy transition-colors"
              >
                Impact
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-left text-foreground hover:text-brand-navy transition-colors"
              >
                Contact
              </button>
              <button 
                onClick={() => {
                  navigate('/careers');
                  setTimeout(() => window.scrollTo(0, 0), 100);
                  setIsMenuOpen(false);
                }}
                className="text-left text-foreground hover:text-brand-navy transition-colors"
              >
                Careers
              </button>
              {/* Context-aware CTA Button for mobile */}
              {(location.pathname === '/zira-homes' || location.pathname === '/rental-management-kenya') && (
                <Button 
                  variant="default" 
                  className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                  asChild
                >
                  <a href="https://www.zira-homes.com/" target="_blank" rel="noopener noreferrer">
                    Get Zira Homes
                  </a>
                </Button>
              )}
              {(location.pathname === '/zira-lock' || location.pathname === '/paygo-device-management') && (
                <Button 
                  variant="default" 
                  onClick={() => {
                    scrollToSection('contact');
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
                >
                  Secure My Devices
                </Button>
              )}
              {(location.pathname === '/zira-sms' || location.pathname === '/bulk-sms-kenya') && (
                <Button 
                  variant="default" 
                  onClick={() => {
                    scrollToSection('contact');
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
                >
                  Start Messaging
                </Button>
              )}
              {(location.pathname === '/zira-web' || location.pathname === '/web-development-kenya') && (
                <Button 
                  variant="default" 
                  onClick={() => {
                    scrollToSection('contact');
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
                >
                  Build My Website
                </Button>
              )}
              {location.pathname === '/' && (
                <Button 
                  variant="default" 
                  onClick={() => {
                    scrollToSection('contact');
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
                >
                  Start Building
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
