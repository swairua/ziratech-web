import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, AlertTriangle, ShoppingBag, RefreshCw, Zap } from 'lucide-react';
import { checkIfProductsTableExists } from '@/lib/initializeFeaturedProducts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const FeaturedProductsInit = () => {
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkTableStatus();
  }, []);

  const checkTableStatus = async () => {
    setIsChecking(true);
    try {
      const exists = await checkIfProductsTableExists();
      setTableExists(exists);
    } catch (error) {
      console.error('Error checking table status:', error);
      setTableExists(false);
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(migrationSQL);
    setIsCopied(true);
    toast.success('SQL copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadSQL = () => {
    const element = document.createElement('a');
    const file = new Blob([migrationSQL], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'init-featured-products.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('SQL file downloaded!');
  };

  if (tableExists === null) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>Checking setup status...</CardDescription>
              </div>
            </div>
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (tableExists) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>Setup complete and ready to use</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Initialized
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-900 mb-4">
            The products table has been successfully created. You can now manage featured products in the admin panel.
          </p>
          <Button 
            onClick={() => window.location.href = '/admin/featured-products'}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Go to Featured Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <CardTitle>Featured Products Setup Required</CardTitle>
              <CardDescription>Initialize the database table to enable featured products</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="bg-white border-yellow-300">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            The products table hasn't been created yet. Follow the steps below to initialize featured products.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold text-yellow-900">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-900">
            <li>Go to your <a 
              href="https://app.supabase.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-medium hover:no-underline"
            >
              Supabase Dashboard
            </a></li>
            <li>Select your project</li>
            <li>Navigate to <strong>SQL Editor</strong></li>
            <li>Create a new query and paste the SQL below</li>
            <li>Click <strong>Run</strong> to execute</li>
            <li>Come back here and click <strong>Verify Setup</strong></li>
          </ol>
        </div>

        {/* SQL Code Block */}
        <div className="bg-gray-900 rounded-lg p-4 text-white text-xs font-mono overflow-x-auto">
          <pre className="whitespace-pre-wrap break-words">{migrationSQL}</pre>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={copyToClipboard}
            variant="outline"
            className="border-yellow-400 text-yellow-900 hover:bg-yellow-100"
          >
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy SQL
              </>
            )}
          </Button>

          <Button 
            onClick={downloadSQL}
            variant="outline"
            className="border-yellow-400 text-yellow-900 hover:bg-yellow-100"
          >
            <Code className="mr-2 h-4 w-4" />
            Download SQL File
          </Button>

          <Button 
            onClick={checkTableStatus}
            disabled={isChecking}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Verify Setup
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-yellow-800 mt-4 p-3 bg-white rounded border border-yellow-200">
          💡 <strong>Tip:</strong> After running the SQL in Supabase, click "Verify Setup" above to check if the table was created successfully.
        </p>
      </CardContent>
    </Card>
  );
};
