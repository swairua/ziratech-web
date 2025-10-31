import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star, Plus, Trash2, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';
import { checkIfProductsTableExists, initializeProductsTable } from '@/lib/initializeFeaturedProducts';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const AdminFeaturedProducts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkTableAndFetchProducts();
    }
  }, [user]);

  const checkTableAndFetchProducts = async () => {
    try {
      setIsLoading(true);
      const exists = await checkIfProductsTableExists();
      setTableExists(exists);
      if (exists) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error checking table:', error);
      setTableExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        const errorDetails = {
          message: error.message,
          code: error.code,
          status: error.status,
          details: error.details,
          hint: error.hint,
          fullError: JSON.stringify(error)
        };
        console.error('Error fetching products:', errorDetails);

        // Check for table not found errors
        if (error.code === 'PGRST116' ||
            error.message?.includes('relation') ||
            error.message?.includes('does not exist') ||
            error.message?.includes('products')) {
          toast.error('Products table not initialized. Go back to Dashboard and click "Initialize Now".');
        } else if (error.code === '42P01') {
          toast.error('Products table does not exist. Please initialize it in the dashboard.');
        } else if (error.code === 'PGRST301') {
          toast.error('Permission denied. You may not have admin access.');
        } else {
          toast.error('Failed to fetch products: ' + (error.message || 'Unknown error'));
        }
      } else {
        setProducts(data || []);
        const featured = new Set(
          data?.filter(p => p.is_featured).map(p => p.id) || []
        );
        setFeaturedProducts(featured);
      }
    } catch (err) {
      console.error('Unexpected error fetching products:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      toast.error('An unexpected error occurred while fetching products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureToggle = async (productId: string, currentState: boolean) => {
    const newFeatured = new Set(featuredProducts);
    
    if (!currentState) {
      if (newFeatured.size >= 4) {
        toast.error('Maximum 4 featured products allowed');
        return;
      }
      newFeatured.add(productId);
    } else {
      newFeatured.delete(productId);
    }

    try {
      const order = !currentState ? Array.from(newFeatured).indexOf(productId) + 1 : null;
      const { error } = await supabase
        .from('products')
        .update({
          is_featured: !currentState,
          featured_order: order,
        })
        .eq('id', productId);

      if (error) {
        toast.error('Failed to update product');
      } else {
        setFeaturedProducts(newFeatured);
        fetchProducts();
        toast.success(
          !currentState 
            ? 'Product added to featured' 
            : 'Product removed from featured'
        );
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description || null,
            price: formData.price ? parseFloat(formData.price) : null,
            image_url: formData.image_url || null,
            category: formData.category || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) {
          toast.error('Failed to update product');
        } else {
          toast.success('Product updated successfully');
          setEditingId(null);
          resetForm();
          fetchProducts();
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description || null,
            price: formData.price ? parseFloat(formData.price) : null,
            image_url: formData.image_url || null,
            category: formData.category || null,
            is_featured: false,
          });

        if (error) {
          toast.error('Failed to create product');
        } else {
          toast.success('Product created successfully');
          resetForm();
          fetchProducts();
        }
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
      category: product.category || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        toast.error('Failed to delete product');
      } else {
        toast.success('Product deleted successfully');
        setDeleteConfirm(null);
        fetchProducts();
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreateTable = async () => {
    try {
      setIsInitializing(true);
      const result = await initializeProductsTable();

      if (result.success) {
        toast.success('Products table created successfully!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkTableAndFetchProducts();
      } else {
        toast.error(result.message || 'Failed to create table. Please try again.');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error('An error occurred while creating the table');
    } finally {
      setIsInitializing(false);
    }
  };

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

  if (tableExists === false) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
            <p className="text-gray-600 mt-1">
              Manage up to 4 featured products displayed on the home page
            </p>
          </div>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <CardTitle>Products Table Not Initialized</CardTitle>
                    <CardDescription>Create the products database table to get started</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-white border-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  The products table needs to be created in your database before you can manage featured products.
                </AlertDescription>
              </Alert>

              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3">What happens next?</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-yellow-900">
                  <li>We'll create a products table in your Supabase database</li>
                  <li>Configure proper access permissions and indexes</li>
                  <li>You'll be able to add and manage featured products</li>
                </ul>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleCreateTable}
                  disabled={isInitializing}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
                >
                  {isInitializing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating Table...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Create Table
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => checkTableAndFetchProducts()}
                  disabled={isInitializing}
                  variant="outline"
                  className="border-yellow-400 text-yellow-900 hover:bg-yellow-100"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verify Setup
                </Button>
              </div>

              <p className="text-xs text-yellow-800 p-3 bg-white rounded border border-yellow-200">
                💡 <strong>Tip:</strong> Click "Create Table" to automatically set up your products database. This typically takes a few seconds.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const featuredCount = featuredProducts.size;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
            <p className="text-gray-600 mt-1">
              Manage up to 4 featured products displayed on the home page
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-brand-orange hover:bg-brand-orange-dark text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>

        {/* Featured Count */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Featured Products Count</p>
                <p className="text-2xl font-bold text-blue-600">{featuredCount} / 4</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400 fill-current" />
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
              <CardDescription>
                Fill in the product details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Premium, Standard"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                  >
                    {editingId ? 'Update' : 'Create'} Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Products</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No products yet. Create your first product to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const isFeatured = featuredProducts.has(product.id);
                return (
                  <Card key={product.id} className={isFeatured ? 'border-brand-orange border-2' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          {product.category && (
                            <Badge variant="outline" className="mt-2">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        {isFeatured && (
                          <Star className="h-5 w-5 text-yellow-400 fill-current flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {product.price && (
                        <p className="text-lg font-semibold text-brand-orange">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </p>
                      )}

                      {product.image_url && (
                        <div className="rounded-lg bg-gray-100 h-32 overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                          id={`featured-${product.id}`}
                          checked={isFeatured}
                          onCheckedChange={() =>
                            handleFeatureToggle(product.id, isFeatured)
                          }
                          disabled={!isFeatured && featuredCount >= 4}
                        />
                        <Label
                          htmlFor={`featured-${product.id}`}
                          className="text-sm cursor-pointer"
                        >
                          Featured
                          {!isFeatured && featuredCount >= 4 && (
                            <span className="text-gray-500"> (max reached)</span>
                          )}
                        </Label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirm(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteProduct(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminFeaturedProducts;
