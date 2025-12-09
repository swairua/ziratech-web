import { AdminLayout } from '@/components/admin/AdminLayout';
import { EmailAutomation } from '@/components/admin/email/EmailAutomation';
import AdminRoute from '@/components/auth/AdminRoute';

const AdminEmail = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <EmailAutomation />
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminEmail;