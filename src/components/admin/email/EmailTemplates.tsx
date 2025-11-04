import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { emailTemplatesApi } from '@/lib/apiClient';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  Save, 
  Mail,
  Loader
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  type: 'form_confirmation' | 'admin_alert' | 'welcome' | 'newsletter' | 'custom';
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export const EmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    type: 'form_confirmation' as const,
    content: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    const response = await emailTemplatesApi.list();
    if (response.data && Array.isArray(response.data)) {
      setTemplates(response.data as EmailTemplate[]);
    } else if (response.error) {
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.subject || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const variables = (formData.content.match(/\{\{(\w+)\}\}/g) || [])
        .map(v => v.replace(/[{}]/g, ''));

      await emailTemplatesApi.create({
        ...formData,
        variables,
      });
      
      toast({
        title: "Template Created",
        description: "Email template has been created successfully",
      });
      
      setFormData({
        name: '',
        subject: '',
        description: '',
        type: 'form_confirmation',
        content: '',
      });
      setIsCreateOpen(false);
      loadTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await emailTemplatesApi.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const newTemplate = {
        name: `${template.name} (Copy)`,
        subject: template.subject,
        description: template.description,
        type: template.type,
        content: template.content,
        variables: template.variables,
      };
      await emailTemplatesApi.create(newTemplate);
      toast({
        title: "Template Duplicated",
        description: "Email template has been duplicated successfully",
      });
      loadTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate email template",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'form_confirmation': return 'bg-blue-100 text-blue-800';
      case 'admin_alert': return 'bg-red-100 text-red-800';
      case 'welcome': return 'bg-green-100 text-green-800';
      case 'newsletter': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPreview = (content: string) => {
    return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      const sampleData: Record<string, string> = {
        name: 'John Doe',
        email: 'john@example.com',
        message: "I'm interested in your services.",
        phone: '+1 (555) 123-4567',
        company: 'Example Company',
        date: new Date().toLocaleDateString(),
        submitted_at: new Date().toLocaleString(),
        position: 'Software Engineer',
        admin_url: '/admin/forms',
      };
      return sampleData[variable] || match;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">Email Templates</h2>
          <p className="text-muted-foreground">Create and manage email templates for automation</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-orange hover:bg-brand-orange-dark">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Template Name *</Label>
                    <Input 
                      id="template-name" 
                      placeholder="Enter template name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-type">Type *</Label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md" 
                      id="template-type"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="form_confirmation">Form Confirmation</option>
                      <option value="admin_alert">Admin Alert</option>
                      <option value="welcome">Welcome Email</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="template-subject">Subject Line *</Label>
                  <Input 
                    id="template-subject" 
                    placeholder="Enter email subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea 
                    id="template-description" 
                    placeholder="Describe when this template is used"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </TabsContent>
              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="template-content">Email Content (HTML) *</Label>
                  <Textarea 
                    id="template-content" 
                    rows={12}
                    placeholder="Enter your email content here. Use {{variable_name}} for dynamic content."
                    className="font-mono text-sm"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Available Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {['{{name}}', '{{email}}', '{{message}}', '{{phone}}', '{{company}}', '{{date}}', '{{position}}', '{{submitted_at}}'].map((variable) => (
                      <Badge key={variable} variant="outline" className="cursor-pointer hover:bg-brand-orange hover:text-white">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="border-b pb-2 mb-4">
                    <div className="text-sm text-gray-600">Subject: {formData.subject || 'Preview your subject here'}</div>
                  </div>
                  {formData.content ? (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                      __html: renderPreview(formData.content)
                    }} />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Enter content to see preview</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate} className="bg-brand-orange hover:bg-brand-orange-dark">
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading templates...</p>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      {!isLoading && (
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No email templates</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first email template to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Updated {new Date(template.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setPreviewTemplate(template);
                          setIsPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="font-medium">Subject: {template.subject}</div>
                    <div className="text-muted-foreground mt-1">
                      Variables: {template.variables && template.variables.length > 0 ? template.variables.join(', ') : 'None'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="border-b pb-2 mb-4">
                <div className="text-sm text-gray-600">Subject: {previewTemplate.subject}</div>
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                __html: renderPreview(previewTemplate.content)
              }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
