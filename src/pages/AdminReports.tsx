import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ComingSoon } from '@/components/admin/ComingSoon';
import { FileBarChart } from 'lucide-react';

const AdminReports = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout>
      <ComingSoon
        title="Reports & Analytics"
        description="Generate detailed reports and export business intelligence data for strategic decision making."
        icon={FileBarChart}
        features={[
          "Automated report generation",
          "Scheduled report delivery",
          "Multi-format export options",
          "Custom report builder",
          "Historical data analysis",
          "Executive dashboards"
        ]}
        estimatedDate="Q3 2026"
      />
    </AdminLayout>
  );
};

export default AdminReports;