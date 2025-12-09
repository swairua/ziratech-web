import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ComingSoon } from '@/components/admin/ComingSoon';
import { ShoppingBag } from 'lucide-react';

const AdminProducts = () => {
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
        title="Products Management"
        description="Comprehensive product catalog management with inventory tracking and pricing controls."
        icon={ShoppingBag}
        features={[
          "Product catalog with categories",
          "Inventory management and tracking",
          "Price management and discounts",
          "Product variants and options",
          "Bulk import/export functionality",
          "Product analytics and insights"
        ]}
        estimatedDate="Q4 2025"
      />
    </AdminLayout>
  );
};

export default AdminProducts;