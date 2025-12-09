
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import ZiraHomes from "./pages/ZiraHomes";
import ZiraLock from "./pages/ZiraLock";
import ZiraSMS from "./pages/ZiraSMS";
import ZiraWeb from "./pages/ZiraWeb";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminForms from "./pages/AdminForms";
import AdminBlog from "./pages/AdminBlog";
import AdminEmail from "./pages/AdminEmail";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminProfile from "./pages/AdminProfile";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminPages from "./pages/AdminPages";
import AdminReports from "./pages/AdminReports";
import AdminOffers from "./pages/AdminOffers";
import AdminMarketing from "./pages/AdminMarketing";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
            
            {/* SEO-friendly URLs */}
            <Route path="/rental-management-kenya" element={<ZiraHomes />} />
            <Route path="/bulk-sms-kenya" element={<ZiraSMS />} />
            <Route path="/paygo-device-management" element={<ZiraLock />} />
            <Route path="/web-development-kenya" element={<ZiraWeb />} />
            
            {/* Legacy redirects */}
            <Route path="/zira-homes" element={<ZiraHomes />} />
            <Route path="/zira-lock" element={<ZiraLock />} />
            <Route path="/zira-sms" element={<ZiraSMS />} />
            <Route path="/zira-web" element={<ZiraWeb />} />
            
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Legacy redirects for policy pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/forms" element={<AdminForms />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/email" element={<AdminEmail />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/pages" element={<AdminPages />} />
            <Route path="/admin/portfolio" element={<AdminPages />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsentBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
