
import { AdminLayout } from "@/components/admin/AdminLayout";
import PortfolioManagement from "@/components/admin/portfolio/PortfolioManagement";
import AdminRoute from "@/components/auth/AdminRoute";

const AdminPages = () => {
  return (
    <AdminRoute>
      <AdminLayout>
        <PortfolioManagement />
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminPages;
