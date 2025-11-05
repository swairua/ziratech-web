import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import AdminRoute from '@/components/auth/AdminRoute';

const AdminDashboard = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <DashboardOverview />
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminDashboard;