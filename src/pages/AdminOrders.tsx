import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ComingSoon } from '@/components/admin/ComingSoon';
import { ShoppingCart } from 'lucide-react';

const AdminOrders = () => {
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
        title="Orders Management"
        description="Complete order processing system with payment tracking and fulfillment management."
        icon={ShoppingCart}
        features={[
          "Order processing and tracking",
          "Payment status management",
          "Shipping and fulfillment",
          "Customer communication tools",
          "Returns and refunds handling",
          "Order analytics and reporting"
        ]}
        estimatedDate="Q1 2026"
      />
    </AdminLayout>
  );
};

export default AdminOrders;