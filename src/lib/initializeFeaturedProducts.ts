import { supabase } from '@/integrations/supabase/client';

export const initializeFeaturedProductsTable = async () => {
  try {
    // Test if products table exists by trying to query it
    const { error: checkError } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact', head: true });

    if (!checkError) {
      return { success: true, message: 'Products table already exists' };
    }

    // If table doesn't exist, create it using raw SQL
    // Since we can't directly execute SQL through the client, we'll use an approach
    // where we inform the user and provide a download option
    const migrationSQL = `-- Create products table
CREATE TABLE IF NOT EXISTS products (
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
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_featured_order ON products(featured_order);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow admins to manage products" ON products;

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
  );`;

    return { 
      success: false, 
      message: 'Products table needs to be created',
      sql: migrationSQL
    };
  } catch (error) {
    console.error('Error checking products table:', error);
    return { 
      success: false, 
      message: 'Error initializing products table',
      error 
    };
  }
};

export const checkIfProductsTableExists = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    return !error;
  } catch {
    return false;
  }
};
