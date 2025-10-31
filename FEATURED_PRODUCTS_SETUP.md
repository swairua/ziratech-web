# Featured Products Feature Setup Guide

## Overview
The Featured Products feature allows you to:
- Display up to 4 curated products on the home page
- Manage products (create, edit, delete) through the admin dashboard
- Mark products as featured with a simple checkbox
- Upload product images, prices, descriptions, and categories

## Database Setup

### Step 1: Run the Migration in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (vzznvztokpdtlzcvojar)
3. Navigate to **SQL Editor**
4. Create a new query and paste the following SQL:

```sql
-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on is_featured for faster queries
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_featured_order ON products(featured_order);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users (admins) to manage products
CREATE POLICY "Allow admins to manage products" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

5. Click **Run** to execute the migration

## Using the Featured Products Admin

### Access the Admin Page
1. Go to the Admin Dashboard (`/admin/dashboard`)
2. Click on **Featured Products** in the sidebar

### Create a Product

1. Click the **Add Product** button
2. Fill in the product details:
   - **Product Name** (required) - The display name of the product
   - **Category** (optional) - e.g., "Premium", "Standard", "Enterprise"
   - **Price** (optional) - Decimal price value
   - **Image URL** (optional) - Direct URL to product image
   - **Description** (optional) - Product description text
3. Click **Create Product**

### Feature a Product

1. In the products list, check the **Featured** checkbox for a product
2. Maximum 4 products can be featured at once
3. Featured products will appear on the home page in the "Featured Products" section
4. Products are displayed in the order they were featured

### Edit a Product

1. Click the **Edit** button on any product card
2. Update the product details
3. Click **Update Product**

### Delete a Product

1. Click the **Delete** button (trash icon) on a product
2. Confirm the deletion in the dialog
3. The product will be removed from the database

## Home Page Display

Featured products appear in a new section on the home page (`/`):
- **Location**: Between the Platforms section and Impact section
- **Display**: Grid layout showing up to 4 products
- **Auto-hide**: The section is hidden if no products are featured
- **Features Shown**:
  - Product image
  - Product name
  - Category badge
  - Description (truncated to 2 lines)
  - Price (if available)
  - "Learn More" button

## Product Data Structure

```typescript
type Product = {
  id: string;              // UUID
  name: string;            // Product name (required)
  description?: string;    // Product description
  price?: number;          // Product price
  image_url?: string;      // URL to product image
  category?: string;       // Product category
  is_featured: boolean;    // Whether product is featured
  featured_order?: number; // Display order (1-4)
  created_at?: string;     // Creation timestamp
  updated_at?: string;     // Last update timestamp
}
```

## File Structure

### New Files
- `src/components/FeaturedProducts.tsx` - Home page component
- `src/pages/AdminFeaturedProducts.tsx` - Admin management page
- `supabase/migrations/001_create_products_table.sql` - Database migration

### Modified Files
- `src/pages/Index.tsx` - Added FeaturedProducts component
- `src/App.tsx` - Added admin route
- `src/components/admin/AdminSidebar.tsx` - Added navigation link
- `src/integrations/supabase/types.ts` - Updated with products table type

## Features

### Admin Features
- ✅ Create unlimited products
- ✅ Feature up to 4 products max
- ✅ Edit product details
- ✅ Delete products
- ✅ View featured count
- ✅ Upload product images
- ✅ Categorize products
- ✅ Set product prices

### Home Page Features
- ✅ Displays featured products in grid layout
- ✅ Loads products from Supabase in real-time
- ✅ Shows product images with hover effects
- ✅ Displays pricing and descriptions
- ✅ Auto-hides section when no products are featured
- ✅ Loading state while fetching
- ✅ Error handling

## Security

The products table uses Supabase Row Level Security (RLS) policies:
- **Public Read**: All users can view featured products
- **Admin Manage**: Only users with 'admin' role can create, edit, delete products

## Troubleshooting

### Products not appearing on home page
1. Ensure the products table was created successfully in Supabase
2. Check that at least one product is marked as featured
3. Verify the Supabase credentials in `src/integrations/supabase/client.ts`

### Can't access admin page
1. Ensure you're logged in as an admin user
2. Check that your user has the 'admin' role in the `user_roles` table

### Max 4 products limit enforced
The admin interface prevents featuring more than 4 products. To feature a different product, unfeature one first.

## API Endpoints Used

The feature uses the following Supabase Postgrest endpoints:
- `GET /rest/v1/products` - Fetch products with filtering
- `POST /rest/v1/products` - Create new product
- `PATCH /rest/v1/products` - Update product
- `DELETE /rest/v1/products` - Delete product

All requests use the Supabase client configured with proper authentication.
