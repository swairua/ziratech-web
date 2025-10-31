import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  PenTool,
  Globe,
  ShoppingBag,
  ShoppingCart,
  BarChart3,
  FileBarChart,
  Mail,
  Settings,
  Building2
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users & Roles', href: '/admin/users', icon: Users },
  { name: 'Forms', href: '/admin/forms', icon: FileText },
  { name: 'Blog Management', href: '/admin/blog', icon: PenTool },
  { name: 'Web Pages', href: '/admin/pages', icon: Globe },
  { name: 'Featured Products', href: '/admin/featured-products', icon: ShoppingBag },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { name: 'Email Automation', href: '/admin/email', icon: Mail },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/9489ec23-8de1-485a-8132-7c13ceed629b.png" 
            alt="Zira Technologies" 
            className="h-8 w-8"
          />
          {isOpen && (
            <div>
              <h1 className="text-lg font-bold">Zira Technologies</h1>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-brand-orange text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    !isOpen && "justify-center"
                  )}
                  title={!isOpen ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", isOpen && "mr-3")} />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
