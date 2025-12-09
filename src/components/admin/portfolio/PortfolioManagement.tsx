
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Eye, ExternalLink } from "lucide-react";
import { portfolioService, PortfolioProject } from "@/lib/portfolioService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PortfolioEditor from "./PortfolioEditor";
import { Link } from "react-router-dom";

const PortfolioManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('published');
  
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-portfolio-projects'],
    queryFn: portfolioService.getAllProjects,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: portfolioService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portfolio-projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    },
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'all' || project.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleEdit = (project: PortfolioProject) => {
    setSelectedProject(project);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setSelectedProject(null);
    setIsEditing(true);
  };

  const handleDelete = async (project: PortfolioProject) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  const handleEditorClose = () => {
    setSelectedProject(null);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <PortfolioEditor
        project={selectedProject}
        onClose={handleEditorClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy">Portfolio Management</h2>
          <p className="text-muted-foreground">Manage your portfolio projects and showcase your work</p>
        </div>
        <Button onClick={handleCreate} className="bg-brand-orange hover:bg-brand-orange-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
          <TabsTrigger value="published">
            Published ({projects.filter(p => p.status === 'published').length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({projects.filter(p => p.status === 'draft').length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({projects.filter(p => p.status === 'archived').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No projects found matching your search.' : 'No projects found.'}
              </p>
              <Button onClick={handleCreate} className="bg-brand-orange hover:bg-brand-orange-dark">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete 
}: { 
  project: PortfolioProject;
  onEdit: (project: PortfolioProject) => void;
  onDelete: (project: PortfolioProject) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
     {project.cover_image_url && (
       <div className="aspect-video overflow-hidden rounded-t-lg">
         <img
           src={project.cover_image_url}
           alt={project.title}
           className="w-full h-full object-cover"
           onError={(e) => {
             e.currentTarget.style.display = 'none';
             e.currentTarget.parentElement?.classList.add('hidden');
           }}
         />
       </div>
     )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          {project.featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
        
        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
        
        {project.client && (
          <CardDescription className="text-brand-orange font-medium">
            {project.client}
          </CardDescription>
        )}
        
        <CardDescription className="line-clamp-3">
          {project.short_description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {project.year && `${project.year} • `}
            {new Date(project.created_at).toLocaleDateString()}
          </div>
          
          <div className="flex gap-2">
            {project.status === 'published' && (
              <Button variant="ghost" size="sm" asChild>
                {project.live_url ? (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4" />
                  </a>
                ) : (
                  <Link to={`/portfolio/${project.slug}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                )}
              </Button>
            )}
            
            {project.live_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(project)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioManagement;
