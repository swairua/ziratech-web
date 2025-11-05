import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Platforms from "@/components/Platforms";
import ZiraWebHighlight from "@/components/ZiraWebHighlight";
import Impact from "@/components/Impact";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { OfferPopup } from "@/components/OfferPopup";

const Index = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Zira Technologies",
    "description": "Smart digital platforms for businesses across Africa. We provide rental management software, bulk SMS services, PAYGo device management, and web development solutions.",
    "url": "https://ziratechnologies.com",
    "logo": "https://ziratechnologies.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Kenya",
      "addressLocality": "Nairobi"
    },
    "sameAs": [
      "https://twitter.com/ziratechnologies",
      "https://linkedin.com/company/ziratechnologies"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Zira Technologies Kenya | Web, SMS & PAYGo Solutions"
        description="Zira Technologies delivers smart IT solutions in Kenya. From rental management software and bulk SMS services to PAYGo device management, we help businesses grow."
        keywords="Zira Technologies Kenya, rental management software, bulk SMS Kenya, PAYGo device management, web development Kenya"
        canonical="https://ziratechnologies.com/"
        schema={organizationSchema}
      />
      <Header />
      <Hero />
      <Platforms />
      <ZiraWebHighlight />
      <Impact />
      <Contact />
      <Footer />
      <OfferPopup currentPath="/" />
    </div>
  );
};

export default Index;
