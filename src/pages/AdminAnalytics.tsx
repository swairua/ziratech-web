import { AdminLayout } from '@/components/admin/AdminLayout';
import { ComingSoon } from '@/components/admin/ComingSoon';
import { BarChart3 } from 'lucide-react';
import AdminRoute from '@/components/auth/AdminRoute';

const AdminAnalytics = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <ComingSoon
          title="Advanced Analytics"
          description="Comprehensive business intelligence dashboard with real-time insights and custom reporting."
          icon={BarChart3}
          features={[
            "Real-time business metrics",
            "Custom dashboard creation",
            "Advanced data visualization",
            "Conversion funnel analysis",
            "User behavior tracking",
            "Performance benchmarking"
          ]}
          estimatedDate="Q2 2026"
        />
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminAnalytics;