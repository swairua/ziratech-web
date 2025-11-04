import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star, Plus, Trash2, AlertTriangle, RefreshCw, Upload, X, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { productsAPI, type Product } from '@/lib/api';

const AdminFeaturedProducts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://zira-tech.com/api.php?action=upload_image&table=products', {
        method: 'POST',
        body: formData,
      });

      // Try to extract any server-provided error details
      let data: any = null;
      try {
        data = await response.clone().json();
      } catch (_) {
        try {
          const text = await response.clone().text();
          if (text) console.error('Upload raw response:', text);
        } catch (_) {
          // ignore
        }
      }

      if (!response.ok) {
        const status = response.status;
        const msg = (data && (data.error || data.message)) || `Upload failed: ${status}`;
        throw new Error(msg);
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      const imageUrl = (data && (data.url || data.image_url)) || `https://zira-tech.com/assets/${file.name}`;
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      setImagePreview(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      console.error('Upload error:', err);
      const message = typeof err?.message === 'string' ? err.message : 'Failed to upload image';
      toast.error(`${message}. You can paste an image URL as an alternative.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productsAPI.getAll();

      const sorted = [...data].sort((a, b) => {
        const orderA = a.featured_order || 999;
        const orderB = b.featured_order || 999;
        if (orderA !== orderB) return orderA - orderB;
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setProducts(sorted);
      const featured = new Set(
        sorted.filter(p => p.is_featured).map(p => p.id)
      );
      setFeaturedProducts(featured);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureToggle = async (productId: number, currentState: boolean) => {
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
      await productsAPI.update(productId, {
        is_featured: !currentState ? (1 as any) : (0 as any),
        featured_order: order,
      });

      setFeaturedProducts(newFeatured);
      fetchProducts();
      toast.success(
        !currentState
          ? 'Product added to featured'
          : 'Product removed from featured'
      );
    } catch (err) {
      toast.error('Failed to update product');
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
        await productsAPI.update(editingId, {
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          image_url: formData.image_url || undefined,
          category: formData.category || undefined,
        });

        toast.success('Product updated successfully');
        setEditingId(null);
        resetForm();
        fetchProducts();
      } else {
        await productsAPI.create({
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          image_url: formData.image_url || undefined,
          category: formData.category || undefined,
          is_featured: false,
        });

        toast.success('Product created successfully');
        resetForm();
        fetchProducts();
      }
    } catch (err) {
      toast.error('Failed to save product');
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
    setImagePreview(product.image_url || null);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await productsAPI.delete(productId);

      toast.success('Product deleted successfully');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
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
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
                  <Label>Product Image</Label>
                  <div className="mt-2 space-y-3">
                    {imagePreview || formData.image_url ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={imagePreview || formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image_url: '' }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange hover:bg-orange-50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />

                    {/* Manual URL fallback */}
                    <div className="grid gap-2">
                      <Label htmlFor="imageUrl" className="text-xs text-gray-600">Or paste an image URL</Label>
                      <Input
                        id="imageUrl"
                        placeholder="https://.../image.jpg"
                        value={formData.image_url}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFormData(prev => ({ ...prev, image_url: url }));
                          setImagePreview(url || null);
                        }}
                      />
                      <p className="text-xs text-gray-500">If upload fails, paste a direct image URL. We will store this URL.</p>
                    </div>

                    {isUploading && (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Loader className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                    {formData.image_url && !imagePreview && (
                      <p className="text-xs text-green-600">Image URL: {formData.image_url}</p>
                    )}
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
