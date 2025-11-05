import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { portfolioService, PortfolioProject } from "@/lib/portfolioService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioEditorProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

const PortfolioEditor = ({ project, onClose }: PortfolioEditorProps) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    slug: project?.slug || '',
    short_description: project?.short_description || '',
    description: project?.description || '',
    client: project?.client || '',
    industry: project?.industry || '',
    country: project?.country || '',
    year: project?.year || new Date().getFullYear(),
    status: project?.status || 'draft' as const,
    featured: project?.featured || false,
    featured_order: project?.featured_order || null,
    cover_image_url: project?.cover_image_url || '',
    gallery_urls: project?.gallery_urls || [],
    live_url: project?.live_url || '',
    repo_url: project?.repo_url || '',
    results_summary: project?.results_summary || '',
    metrics: project?.metrics || {},
    technologies: project?.technologies || [],
    tags: project?.tags || [],
  });

  const [newTechnology, setNewTechnology] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [metricKey, setMetricKey] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [screenshotProvider, setScreenshotProvider] = useState('apiflash');

  const suggestedWebTags = ['web', 'website', 'web app', 'landing', 'ecommerce', 'cms', 'responsive', 'ui/ux', 'frontend', 'backend'];

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => portfolioService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast.success('Project created successfully');
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      const message = error.message?.includes('duplicate') 
        ? 'A project with this slug already exists. Please try again.'
        : 'Failed to create project';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      portfolioService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-projects'] });
      toast.success('Project updated successfully');
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      const message = error.message?.includes('duplicate') 
        ? 'A project with this slug already exists. Please try again.'
        : 'Failed to update project';
      toast.error(message);
    },
  });

  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      try {
        const { data: existing } = await supabase
          .from('portfolio_projects')
          .select('id')
          .eq('slug', uniqueSlug)
          .single();
        
        if (!existing || (project && existing.id === project.id)) {
          return uniqueSlug;
        }
        
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      } catch (error: any) {
        // If error is "PGRST116" (not found), the slug is unique
        if (error.code === 'PGRST116') {
          return uniqueSlug;
        }
        throw error;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.short_description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Generate unique slug from title if needed
      const baseSlug = formData.slug || generateSlug(formData.title);
      const uniqueSlug = await ensureUniqueSlug(baseSlug);

      const submitData = {
        ...formData,
        slug: uniqueSlug,
        live_url: normalizeUrl(formData.live_url),
        repo_url: normalizeUrl(formData.repo_url),
        featured_order: formData.featured ? formData.featured_order : null,
      };

      if (project) {
        updateMutation.mutate({ id: project.id, data: submitData });
      } else {
        createMutation.mutate(submitData);
      }
    } catch (error: any) {
      console.error('Error preparing submission:', error);
      toast.error('Failed to prepare project data');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-generate slug from title if slug is empty or matches the old title's slug
      slug: (!prev.slug || prev.slug === generateSlug(prev.title)) ? generateSlug(title) : prev.slug
    }));
  };

  const addTechnology = () => {
    if (newTechnology && !formData.technologies.includes(newTechnology)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addGalleryUrl = () => {
    if (newGalleryUrl && !formData.gallery_urls.includes(newGalleryUrl)) {
      setFormData(prev => ({
        ...prev,
        gallery_urls: [...prev.gallery_urls, newGalleryUrl]
      }));
      setNewGalleryUrl('');
    }
  };

  const removeGalleryUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter(u => u !== url)
    }));
  };

  const addMetric = () => {
    if (metricKey && metricValue) {
      setFormData(prev => ({
        ...prev,
        metrics: { ...prev.metrics, [metricKey]: metricValue }
      }));
      setMetricKey('');
      setMetricValue('');
    }
  };

  const removeMetric = (key: string) => {
    setFormData(prev => {
      const newMetrics = { ...prev.metrics };
      delete newMetrics[key];
      return { ...prev, metrics: newMetrics };
    });
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };

  const generateCoverImage = async (mode: 'auto' | 'screenshot' | 'thumbnail', provider = 'apiflash') => {
    if (!formData.live_url) {
      toast.error('Please add a live URL first');
      return;
    }

    setIsGeneratingCover(true);
    try {
      const normalizedUrl = normalizeUrl(formData.live_url);
      
      const { data, error } = await supabase.functions.invoke('portfolio-cover', {
        body: {
          mode,
          url: normalizedUrl,
          projectId: project?.id || 'temp-' + Date.now(),
          provider: mode === 'screenshot' ? screenshotProvider : 'apiflash'
        }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setFormData(prev => ({ ...prev, cover_image_url: data.imageUrl }));
        toast.success(data.message || 'Cover image generated successfully');
      } else {
        toast.error(data.error || 'Failed to generate cover image');
      }
    } catch (error: any) {
      console.error('Error generating cover:', error);
      toast.error(error.message || 'Failed to generate cover image');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <p className="text-muted-foreground">
            {project ? `Editing "${project.title}"` : 'Create a new portfolio project'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Project title"
                    required
                  />
                </div>

                 <div>
                   <Label htmlFor="slug">URL Slug *</Label>
                   <Input
                     id="slug"
                     value={formData.slug}
                     onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                     placeholder="auto-generated-from-title"
                     required
                   />
                   <p className="text-xs text-muted-foreground mt-1">
                     Auto-generated from title. Edit to customize.
                   </p>
                 </div>

                <div>
                  <Label htmlFor="short_description">Short Description *</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Brief description for cards and previews"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed project description"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                   <Label htmlFor="cover_image_url">Cover Image URL</Label>
                   <div className="space-y-2">
                     <Input
                       id="cover_image_url"
                       value={formData.cover_image_url}
                       onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                       placeholder="https://example.com/image.jpg"
                     />
                     {formData.cover_image_url && (
                       <div className="mt-2">
                         <img 
                           src={formData.cover_image_url} 
                           alt="Cover preview" 
                           className="w-full h-32 object-cover rounded border"
                           onError={(e) => {
                             e.currentTarget.style.display = 'none';
                             e.currentTarget.nextElementSibling?.classList.remove('hidden');
                           }}
                         />
                         <div className="hidden w-full h-32 bg-muted rounded border flex items-center justify-center text-muted-foreground text-sm">
                           Image failed to load
                         </div>
                       </div>
                     )}
                     <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => generateCoverImage('thumbnail')}
                          disabled={isGeneratingCover || !formData.live_url}
                        >
                          {isGeneratingCover ? 'Generating...' : 'Use Website Thumbnail'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => generateCoverImage('screenshot')}
                          disabled={isGeneratingCover || !formData.live_url}
                        >
                          {isGeneratingCover ? 'Generating...' : 'Grab Screenshot'}
                        </Button>
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => generateCoverImage('auto')}
                           disabled={isGeneratingCover || !formData.live_url}
                         >
                           {isGeneratingCover ? 'Generating...' : 'Auto (APIFlash)'}
                         </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor="screenshot-provider" className="text-sm text-muted-foreground">
                          Screenshot Provider:
                        </Label>
                        <Select value={screenshotProvider} onValueChange={setScreenshotProvider}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                           <SelectContent>
                            <SelectItem value="apiflash">APIFlash (Recommended)</SelectItem>
                            <SelectItem value="screenshotmachine">ScreenshotMachine</SelectItem>
                            <SelectItem value="screenshotone">ScreenshotOne (Paid)</SelectItem>
                            <SelectItem value="urlbox">URLBox (Paid)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {formData.cover_image_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.cover_image_url} 
                          alt="Cover preview" 
                          className="w-32 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Gallery Images</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="Gallery image URL"
                    />
                    <Button type="button" onClick={addGalleryUrl}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.gallery_urls.map((url) => (
                      <Badge key={url} variant="secondary" className="flex items-center gap-1">
                        Gallery Image
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeGalleryUrl(url)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results & Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Results & Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="results_summary">Results Summary</Label>
                  <Textarea
                    id="results_summary"
                    value={formData.results_summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, results_summary: e.target.value }))}
                    placeholder="Summary of project results and impact"
                  />
                </div>

                <div>
                  <Label>Key Metrics</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={metricKey}
                      onChange={(e) => setMetricKey(e.target.value)}
                      placeholder="Metric name"
                    />
                    <Input
                      value={metricValue}
                      onChange={(e) => setMetricValue(e.target.value)}
                      placeholder="Metric value"
                    />
                    <Button type="button" onClick={addMetric}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.metrics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 border rounded">
                        <span><strong>{key}:</strong> {value as string}</span>
                        <X 
                          className="h-4 w-4 cursor-pointer text-red-600" 
                          onClick={() => removeMetric(key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="e.g. Kenya, Nigeria"
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    placeholder="2024"
                  />
                </div>

                <div>
                  <Label htmlFor="live_url">Live URL</Label>
                  <Input
                    id="live_url"
                    value={formData.live_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, live_url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="repo_url">Repository URL</Label>
                  <Input
                    id="repo_url"
                    value={formData.repo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, repo_url: e.target.value }))}
                    placeholder="https://github.com/user/repo"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status & Features */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>

                {formData.featured && (
                  <div>
                    <Label htmlFor="featured_order">Featured Order</Label>
                    <Input
                      id="featured_order"
                      type="number"
                      value={formData.featured_order || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_order: parseInt(e.target.value) || null }))}
                      placeholder="Order in featured section"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="Add technology"
                  />
                  <Button type="button" onClick={addTechnology}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTechnology(tech)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-brand-orange hover:bg-brand-orange-dark"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioEditor;
