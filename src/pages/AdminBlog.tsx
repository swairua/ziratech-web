import { AdminLayout } from '@/components/admin/AdminLayout';
import { BlogManagement } from '@/components/admin/blog/BlogManagement';
import AdminRoute from '@/components/auth/AdminRoute';

const AdminBlog = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <BlogManagement />
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminBlog;