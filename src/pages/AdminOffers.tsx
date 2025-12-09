import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OffersManager } from '@/components/admin/offers/OffersManager';

const AdminOffers = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Offers & Promotions</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage promotional offers with targeted popups to boost conversions.
          </p>
        </div>
        <OffersManager />
      </div>
    </AdminLayout>
  );
};

export default AdminOffers;