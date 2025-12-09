import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BlogPostsList } from './BlogPostsList';
import { BlogPostEditor } from './BlogPostEditor';
import { BlogCategories } from './BlogCategories';
import { BlogAnalytics } from './BlogAnalytics';
import { Plus, FileText, Folder, BarChart3 } from 'lucide-react';

export const BlogManagement = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const handleCreatePost = () => {
    setEditingPostId(null);
    setShowEditor(true);
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingPostId(null);
  };

  if (showEditor) {
    return <BlogPostEditor postId={editingPostId} onClose={handleCloseEditor} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog content</p>
        </div>
        <Button onClick={handleCreatePost} className="bg-brand-orange hover:bg-brand-orange-dark">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Posts</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center space-x-2">
            <Folder className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <BlogPostsList onEditPost={handleEditPost} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <BlogCategories />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BlogAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Blog settings coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};