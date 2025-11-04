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
  Users,
  AlertCircle,
  FileText,
  Settings,
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
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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

  const handleSaveTemplate = () => {
    toast({
      title: "Template Saved",
      description: "Email template has been saved successfully",
    });
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "Email template has been deleted successfully",
    });
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
    toast({
      title: "Template Duplicated",
      description: "Email template has been duplicated successfully",
    });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">Email Templates</h2>
          <p className="text-muted-foreground">Create and manage email templates for automation</p>
        </div>
        <Dialog>
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
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input id="template-name" placeholder="Enter template name" />
                  </div>
                  <div>
                    <Label htmlFor="template-type">Type</Label>
                    <select className="w-full px-3 py-2 border rounded-md" id="template-type">
                      <option value="form_confirmation">Form Confirmation</option>
                      <option value="admin_alert">Admin Alert</option>
                      <option value="welcome">Welcome Email</option>
                      <option value="newsletter">Newsletter</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="template-subject">Subject Line</Label>
                  <Input id="template-subject" placeholder="Enter email subject" />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea id="template-description" placeholder="Describe when this template is used" />
                </div>
              </TabsContent>
              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="template-content">Email Content (HTML)</Label>
                  <Textarea 
                    id="template-content" 
                    rows={12}
                    placeholder="Enter your email content here. Use {{variable_name}} for dynamic content."
                    className="font-mono text-sm"
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Available Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {['{{name}}', '{{email}}', '{{message}}', '{{phone}}', '{{company}}', '{{date}}'].map((variable) => (
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
                    <div className="text-sm text-gray-600">Subject: Thank you for your submission</div>
                  </div>
                  <div className="prose max-w-none">
                    <h1>Thank you, John Doe!</h1>
                    <p>We have received your message and will get back to you within 6 hours during business hours.</p>
                    <p>Your submission details:</p>
                    <ul>
                      <li>Name: John Doe</li>
                      <li>Email: john@example.com</li>
                      <li>Message: I'm interested in your services.</li>
                    </ul>
                    <p>Best regards,<br />The Zira Technologies Team</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Test Send</Button>
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

      {/* Templates Grid */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getTypeColor(template.type)}>
                      {template.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Updated {new Date(template.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
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
                  Variables: {template.variables.join(', ')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-white">
            <div className="border-b pb-2 mb-4">
              <div className="text-sm text-gray-600">Subject: Thank you for your submission</div>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
              __html: mockTemplates[0].content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
                const sampleData: Record<string, string> = {
                  name: 'John Doe',
                  email: 'john@example.com',
                  message: "I'm interested in your services."
                };
                return sampleData[variable] || match;
              })
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
