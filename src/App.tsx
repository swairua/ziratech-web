import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminUsers from "./pages/AdminUsers";
import AdminForms from "./pages/AdminForms";
import AdminBlog from "./pages/AdminBlog";
import AdminPages from "./pages/AdminPages";
import AdminProducts from "./pages/AdminProducts";
import AdminFeaturedProducts from "./pages/AdminFeaturedProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReports from "./pages/AdminReports";
import AdminEmail from "./pages/AdminEmail";
import AdminSettings from "./pages/AdminSettings";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import ZiraHomes from "./pages/ZiraHomes";
import ZiraLock from "./pages/ZiraLock";
import ZiraSMS from "./pages/ZiraSMS";
import ZiraWeb from "./pages/ZiraWeb";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin" element={<Auth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/forms" element={<AdminForms />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/pages" element={<AdminPages />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/email" element={<AdminEmail />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/zira-homes" element={<ZiraHomes />} />
            <Route path="/zira-lock" element={<ZiraLock />} />
            <Route path="/zira-sms" element={<ZiraSMS />} />
            <Route path="/zira-web" element={<ZiraWeb />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
