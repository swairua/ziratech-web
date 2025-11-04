// This file provides direct instructions for creating the products table
// since the edge function approach may have deployment issues

export const PRODUCTS_TABLE_SQL = `
-- Create products table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_featured_order ON products(featured_order);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for public and admin access
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow admins to manage products" ON products;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to manage products" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
`;

export const copySQLToClipboard = () => {
  navigator.clipboard.writeText(PRODUCTS_TABLE_SQL);
  return true;
};

// Note: This is for legacy Supabase support. Current system uses mysqli via api.php
export const openSupabaseSQL = () => {
  console.warn('Supabase migration is being handled via api.php (mysqli)');
  return;
};
