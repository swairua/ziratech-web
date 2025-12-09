import { Mail, Phone, MapPin, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    // First check if the section exists on the current page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    // If section doesn't exist, navigate to home page with hash
    navigate(`/#${sectionId}`);
    
    // After navigation, try to scroll to the section
    setTimeout(() => {
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <footer className="bg-gradient-to-br from-brand-navy via-brand-navy-dark to-brand-navy text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-brand-orange-dark rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div>
                <span className="text-xl font-bold">Zira</span>
                <span className="text-sm text-gray-300 block leading-tight">Technologies</span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Building the digital infrastructure that powers Africa's business transformation. 
              Four platforms. One vision. Unlimited possibilities.
            </p>
          </div>

          {/* Platforms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Our Platforms</h3>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection('platforms')} className="text-gray-300 hover:text-brand-orange transition-colors">Zira Homes</button></li>
              <li><button onClick={() => scrollToSection('platforms')} className="text-gray-300 hover:text-brand-orange transition-colors">Zira Lock</button></li>
              <li><button onClick={() => scrollToSection('platforms')} className="text-gray-300 hover:text-brand-orange transition-colors">Zira SMS</button></li>
              <li><button onClick={() => scrollToSection('platforms')} className="text-gray-300 hover:text-brand-orange transition-colors">Web Development</button></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/blog" className="text-gray-300 hover:text-brand-orange transition-colors">Blog & Insights</Link></li>
              <li><Link to="/portfolio" className="text-gray-300 hover:text-brand-orange transition-colors">Our Portfolio</Link></li>
              <li><button onClick={() => scrollToSection('platforms')} className="text-gray-300 hover:text-brand-orange transition-colors">Platform Demos</button></li>
              <li><button onClick={() => scrollToSection('impact')} className="text-gray-300 hover:text-brand-orange transition-colors">Success Stories</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-brand-orange transition-colors">Get Support</button></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-brand-orange transition-colors">Join Our Team</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4 text-brand-orange" />
                <span>info@ziratech.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4 text-brand-orange" />
                <span>+254 757878023</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4 text-brand-orange" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">
                © {currentYear} Zira Technologies Ltd. All rights reserved.
              </p>
              <div className="h-4 w-px bg-gray-600"></div>
              <p className="text-gray-400 text-sm">
                Built in Africa, for Africa 🇰🇪
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-brand-orange text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-brand-orange text-sm transition-colors">Terms of Service</Link>
              <Link to="/admin" className="text-gray-400 hover:text-brand-orange text-sm transition-colors flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;