import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagement } from '@/components/admin/users/UserManagement';
import AdminRoute from '@/components/auth/AdminRoute';

const AdminUsers = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <UserManagement />
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminUsers;