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
import { Label } from '@/components/ui/label';
import { Plus, Trash2, AlertTriangle, RefreshCw, Database, Edit2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { checkIfShowcaseWebsitesTableExists, initializeShowcaseWebsitesTable } from '@/lib/initializeShowcaseWebsites';

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
  const [websites, setWebsites] = useState<ShowcaseWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      checkTableAndFetchWebsites();
    }
  }, [user]);

  const checkTableAndFetchWebsites = async () => {
    try {
      setIsLoading(true);
      const exists = await checkIfShowcaseWebsitesTableExists();
      setTableExists(exists);
      if (exists) {
        await fetchWebsites();
      }
    } catch (error) {
      console.error('Error checking table:', error);
      setTableExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWebsites = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('showcase_websites')
        .select('*')
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
        console.error('Error fetching showcase websites:', errorDetails);

        if (error.code === 'PGRST116' ||
            error.message?.includes('relation') ||
            error.message?.includes('does not exist') ||
            error.message?.includes('showcase_websites')) {
          toast.error('Showcase websites table not initialized. Click "Create Table" to set it up.');
        } else if (error.code === '42P01') {
          toast.error('Showcase websites table does not exist. Please initialize it.');
        } else if (error.code === 'PGRST301') {
          toast.error('Permission denied. You may not have admin access.');
        } else {
          toast.error('Failed to fetch showcase websites: ' + (error.message || 'Unknown error'));
        }
      } else {
        setWebsites(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching showcase websites:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      toast.error('An unexpected error occurred while fetching showcase websites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `showcase-websites/${fileName}`;

      const { data, error } = await supabase.storage
        .from('showcase-websites')
        .upload(filePath, file, { upsert: false });

      if (error) {
        toast.error('Failed to upload image: ' + error.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('showcase-websites')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Website name is required');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('showcase_websites')
          .update({
            name: formData.name,
            description: formData.description || null,
            url: formData.url || null,
            image_url: formData.image_url || null,
            category: formData.category || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) {
          toast.error('Failed to update showcase website');
        } else {
          toast.success('Showcase website updated successfully');
          setEditingId(null);
          resetForm();
          fetchWebsites();
        }
      } else {
        const { error } = await supabase
          .from('showcase_websites')
          .insert({
            name: formData.name,
            description: formData.description || null,
            url: formData.url || null,
            image_url: formData.image_url || null,
            category: formData.category || null,
          });

        if (error) {
          toast.error('Failed to create showcase website');
        } else {
          toast.success('Showcase website created successfully');
          resetForm();
          fetchWebsites();
        }
      }
    } catch (err) {
      toast.error('An error occurred');
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
      const { error } = await supabase
        .from('showcase_websites')
        .delete()
        .eq('id', websiteId);

      if (error) {
        toast.error('Failed to delete showcase website');
      } else {
        toast.success('Showcase website deleted successfully');
        setDeleteConfirm(null);
        fetchWebsites();
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
      url: '',
      image_url: '',
      category: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreateTable = async () => {
    try {
      setIsInitializing(true);
      const result = await initializeShowcaseWebsitesTable();

      if (result.success) {
        toast.success('Showcase websites table created successfully!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkTableAndFetchWebsites();
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
            <h1 className="text-3xl font-bold text-gray-900">Products (Showcase Websites)</h1>
            <p className="text-gray-600 mt-1">
              Manage showcase websites and descriptions
            </p>
          </div>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <CardTitle>Showcase Websites Table Not Initialized</CardTitle>
                    <CardDescription>Create the showcase websites database table to get started</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert className="bg-white border-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  The showcase websites table needs to be created in your database before you can manage showcase websites.
                </AlertDescription>
              </Alert>

              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3">What happens next?</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-yellow-900">
                  <li>We'll create a showcase_websites table in your Supabase database</li>
                  <li>Configure proper access permissions and indexes</li>
                  <li>You'll be able to add and manage showcase websites with images</li>
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
                  onClick={() => checkTableAndFetchWebsites()}
                  disabled={isInitializing}
                  variant="outline"
                  className="border-yellow-400 text-yellow-900 hover:bg-yellow-100"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verify Setup
                </Button>
              </div>

              <p className="text-xs text-yellow-800 p-3 bg-white rounded border border-yellow-200">
                💡 <strong>Tip:</strong> Click "Create Table" to automatically set up your showcase websites database. This typically takes a few seconds.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
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
                  <Label htmlFor="image">Website Image</Label>
                  <div className="mt-2">
                    {formData.image_url && (
                      <div className="mb-4 relative">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
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
                    <div className="relative">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="cursor-pointer"
                      />
                      {uploadingImage && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-orange"></div>
                          <span className="text-sm text-gray-600">Uploading image...</span>
                        </div>
                      )}
                    </div>
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
