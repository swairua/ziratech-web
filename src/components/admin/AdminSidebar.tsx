import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Building2,
  Tag,
  Target
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users & Roles', href: '/admin/users', icon: Users },
  { name: 'Forms', href: '/admin/forms', icon: FileText },
  { name: 'Blog Management', href: '/admin/blog', icon: PenTool },
  { name: 'Portfolio', href: '/admin/portfolio', icon: Globe },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { name: 'Email Automation', href: '/admin/email', icon: Mail },
  { name: 'Marketing', href: '/admin/marketing', icon: Target },
  { name: 'Offers & Promotions', href: '/admin/offers', icon: Tag },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/9489ec23-8de1-485a-8132-7c13ceed629b.png" 
            alt="Zira Technologies" 
            className="h-8 w-8"
          />
          {isOpen && (
            <div>
              <h1 className="text-lg font-bold">Zira Technologies</h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="mt-6">
          <ul className="space-y-2 pb-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
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
      </ScrollArea>
    </div>
  );
};