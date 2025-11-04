import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { api } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, AlertTriangle, RefreshCw, Edit2 } from 'lucide-react';

interface ShowcaseWebsite {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

const AdminProducts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<ShowcaseWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    image_url: '',
    category: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user]);

  const fetchWebsites = async () => {
    try {
      setIsLoading(true);
      const response = await api.products.list();

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch products: " + response.error,
        });
      } else {
        let websites = response.data || [];
        // Sort by created_at descending
        websites.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setWebsites(websites);
      }
    } catch (err) {
      console.error(
        'Unexpected error fetching products:',
        JSON.stringify({
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined
        }, null, 2)
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching products",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Website name is required",
      });
      return;
    }

    try {
      const websiteData = {
        name: formData.name,
        description: formData.description || null,
        url: formData.url || null,
        image_url: formData.image_url || null,
        category: formData.category || null,
      };

      let response;
      if (editingId) {
        response = await api.products.update(editingId, websiteData);
        if (response.error) {
          throw new Error(response.error);
        }
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        response = await api.products.create(websiteData);
        if (response.error) {
          throw new Error(response.error);
        }
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setEditingId(null);
      resetForm();
      fetchWebsites();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred",
      });
      console.error(err);
    }
  };

  const handleEditWebsite = (website: ShowcaseWebsite) => {
    setFormData({
      name: website.name,
      description: website.description || '',
      url: website.url || '',
      image_url: website.image_url || '',
      category: website.category || '',
    });
    setEditingId(website.id);
    setShowForm(true);
  };

  const handleDeleteWebsite = async (websiteId: string) => {
    try {
      const response = await api.products.delete(websiteId);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setDeleteConfirm(null);
      fetchWebsites();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred",
      });
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      url: '',
      image_url: '',
      category: '',
    });
    setEditingId(null);
    setShowForm(false);
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


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products (Showcase Websites)</h1>
            <p className="text-gray-600 mt-1">
              Manage showcase websites and descriptions
            </p>
          </div>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-brand-orange hover:bg-brand-orange-dark text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Showcase Website
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? 'Edit Showcase Website' : 'Add New Showcase Website'}
              </CardTitle>
              <CardDescription>
                Fill in the showcase website details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddWebsite} className="space-y-4">
                <div>
                  <Label htmlFor="name">Website Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter website name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Enterprise, SaaS, Portfolio"
                  />
                </div>

                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this showcase website"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">Website Image URL</Label>
                  <div className="mt-2 space-y-2">
                    {formData.image_url && (
                      <div className="relative">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            // Handle broken image
                            (e.target as HTMLImageElement).src = '';
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-gray-500">Enter a direct URL to an image or use an image hosting service</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                  >
                    {editingId ? 'Update' : 'Create'} Website
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

        {/* Websites List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Showcase Websites</h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
                <p className="text-gray-600">Loading showcase websites...</p>
              </div>
            </div>
          ) : websites.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">No showcase websites yet. Create your first website to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {websites.map((website) => (
                <Card key={website.id} className="overflow-hidden flex flex-col">
                  {website.image_url && (
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={website.image_url}
                        alt={website.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardHeader className="flex-grow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{website.name}</CardTitle>
                        {website.category && (
                          <Badge variant="outline" className="mt-2">
                            {website.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {website.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {website.description}
                      </p>
                    )}

                    {website.url && (
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-orange hover:underline block truncate"
                      >
                        Visit Website →
                      </a>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditWebsite(website)}
                        className="flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(website.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Showcase Website</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this showcase website? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteWebsite(deleteConfirm)}
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

export default AdminProducts;
