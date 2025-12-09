import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <section className="py-16 bg-gradient-to-br from-brand-navy to-brand-navy-dark">
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center text-white/60 hover:text-white/80 mb-8 transition-colors text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Please read these terms carefully before using our services.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="text-muted-foreground mb-6">
                <strong>Last updated:</strong> 05/01/2025
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">1. Agreement to Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing and using Zira Technologies' services, you accept and agree to be bound by the terms 
                    and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">2. Services Description</h2>
                  <p className="text-muted-foreground mb-4">
                    Zira Technologies provides software solutions including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Property management systems (Zira Homes)</li>
                    <li>Security and access control systems (Zira Lock)</li>
                    <li>SMS communication platforms (Zira SMS)</li>
                    <li>Custom web development services</li>
                    <li>Related technical support and consulting services</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">3. User Accounts</h2>
                  <p className="text-muted-foreground mb-4">
                    When you create an account with us, you must provide information that is accurate, complete, and current. 
                    You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Safeguarding your password and account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                    <li>Maintaining accurate and up-to-date account information</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">4. Acceptable Use</h2>
                  <p className="text-muted-foreground mb-4">
                    You agree not to use our services to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Transmit harmful, offensive, or illegal content</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt our services</li>
                    <li>Use our services for competitive analysis or benchmarking</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">5. Payment Terms</h2>
                  <p className="text-muted-foreground mb-4">
                    For paid services:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Fees are due in advance and non-refundable unless otherwise stated</li>
                    <li>We may change our fees with 30 days notice</li>
                    <li>Overdue accounts may result in service suspension</li>
                    <li>You are responsible for all taxes related to your use of our services</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">6. Intellectual Property</h2>
                  <p className="text-muted-foreground">
                    The service and its original content, features, and functionality are and will remain the exclusive 
                    property of Zira Technologies and its licensors. Our trademarks and trade dress may not be used in 
                    connection with any product or service without our prior written consent.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">7. Privacy and Data Protection</h2>
                  <p className="text-muted-foreground">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of 
                    our services, to understand our practices regarding the collection and use of your information.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">8. Service Availability</h2>
                  <p className="text-muted-foreground">
                    We strive to provide reliable service, but we do not guarantee uninterrupted access. We may modify, 
                    suspend, or discontinue any part of our service at any time with or without notice.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">9. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    In no event shall Zira Technologies be liable for any indirect, incidental, special, consequential, 
                    or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
                    intangible losses.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">10. Termination</h2>
                  <p className="text-muted-foreground">
                    We may terminate or suspend your account and bar access to the service immediately, without prior 
                    notice or liability, under our sole discretion, for any reason whatsoever including breach of these terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">11. Governing Law</h2>
                  <p className="text-muted-foreground">
                    These terms shall be interpreted and governed by the laws of Kenya. Any disputes arising from these 
                    terms shall be subject to the exclusive jurisdiction of the courts of Kenya.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">12. Changes to Terms</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to modify these terms at any time. We will notify users of any changes by posting 
                    the new terms on this page and updating the "Last updated" date.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">13. Contact Information</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground"><strong>Email:</strong> info@ziratech.com</p>
                    <p className="text-muted-foreground"><strong>Address:</strong> Nairobi, Kenya</p>
                    <p className="text-muted-foreground"><strong>Phone:</strong> +254 757878023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;