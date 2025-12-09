import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
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
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground mb-4">
                    We collect information you provide directly to us, such as when you:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Create an account or use our services</li>
                    <li>Submit job applications or contact forms</li>
                    <li>Subscribe to our newsletter or communications</li>
                    <li>Participate in surveys or provide feedback</li>
                    <li>Communicate with us via email, phone, or chat</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">2. How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send you technical notices, updates, and support messages</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Communicate with you about products, services, and events</li>
                    <li>Monitor and analyze trends and usage</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">3. Information Sharing</h2>
                  <p className="text-muted-foreground mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>With your consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>With trusted service providers who assist our operations</li>
                    <li>In connection with a merger, acquisition, or asset sale</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">4. Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement appropriate security measures to protect your personal information against unauthorized access, 
                    alteration, disclosure, or destruction. However, no internet transmission is 100% secure, and we cannot 
                    guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">5. Data Retention</h2>
                  <p className="text-muted-foreground">
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
                    privacy policy, unless a longer retention period is required by law.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">6. Your Rights</h2>
                  <p className="text-muted-foreground mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to processing of your personal information</li>
                    <li>Request data portability</li>
                    <li>Withdraw consent where applicable</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">7. Cookies and Tracking</h2>
                  <p className="text-muted-foreground">
                    We use cookies and similar tracking technologies to track activity on our website and hold certain 
                    information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">8. Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the 
                    new privacy policy on this page and updating the "Last updated" date.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-4">9. Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;