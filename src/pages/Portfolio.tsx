
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, ExternalLink, Github, Calendar } from "lucide-react";
import { portfolioService, PortfolioProject } from "@/lib/portfolioService";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const normalizeUrl = (url: string): string => {
  if (!url) return url;
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }
  return url;
};

const Portfolio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTechnology, setSelectedTechnology] = useState(searchParams.get('tech') || '');
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || '');

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: portfolioService.getPublishedProjects,
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedTechnology) params.set('tech', selectedTechnology);
    if (selectedIndustry) params.set('industry', selectedIndustry);
    setSearchParams(params);
  }, [searchTerm, selectedTechnology, selectedIndustry, setSearchParams]);

  // Get unique technologies and industries
  const allTechnologies = [...new Set(projects.flatMap(p => p.technologies || []))];
  const allIndustries = [...new Set(projects.map(p => p.industry).filter(Boolean))];

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = !searchTerm || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTechnology = !selectedTechnology || 
        project.technologies?.includes(selectedTechnology);

      const matchesIndustry = !selectedIndustry || 
        project.industry === selectedIndustry;

      return matchesSearch && matchesTechnology && matchesIndustry;
    })
    .sort((a, b) => {
      // Sort by featured status first
      if (a.featured !== b.featured) {
        return b.featured ? 1 : -1;
      }
      // Then by featured order if both are featured
      if (a.featured && b.featured) {
        const orderA = a.featured_order ?? 999;
        const orderB = b.featured_order ?? 999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
      }
      // Finally by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTechnology('');
    setSelectedIndustry('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-orange mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading portfolio projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">Error loading portfolio projects. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section id="top" className="py-20 bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Portfolio
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover how we've helped African businesses transform their operations with innovative technology solutions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge variant="secondary" className="bg-brand-orange text-white border-0 px-4 py-2">
                {projects.length} Projects Completed
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 px-4 py-2">
                {allIndustries.length} Industries Served
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 px-4 py-2">
                {allTechnologies.length} Technologies Used
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedTechnology}
                onChange={(e) => setSelectedTechnology(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Technologies</option>
                {allTechnologies.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>

              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Industries</option>
                {allIndustries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>

              {(searchTerm || selectedTechnology || selectedIndustry) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">No projects found matching your criteria.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

const ProjectCard = ({ project }: { project: PortfolioProject }) => {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
      {project.cover_image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-brand-orange border-brand-orange/30 bg-brand-orange/10">
              {project.industry || 'Technology'}
            </Badge>
            {project.featured && (
              <Badge className="bg-brand-orange text-white border-0">
                Featured
              </Badge>
            )}
          </div>
          {project.year && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {project.year}
            </div>
          )}
        </div>
        
        <CardTitle className="text-xl text-brand-navy group-hover:text-brand-orange transition-colors">
          {project.title}
        </CardTitle>
        
        {project.client && (
          <CardDescription className="text-brand-orange font-medium">
            Client: {project.client}
          </CardDescription>
        )}
        
        <CardDescription className="leading-relaxed">
          {project.short_description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.technologies.length - 3} more
              </Badge>
            )}
          </div>
        )}


        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            asChild
            className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white"
          >
            {project.live_url ? (
              <a href={normalizeUrl(project.live_url)} target="_blank" rel="noopener noreferrer">
                View Live
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            ) : (
              <Link to={`/portfolio/${project.slug}`}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </Button>
          
          <div className="flex gap-2">
            {project.live_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={normalizeUrl(project.live_url)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            
            {project.repo_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={normalizeUrl(project.repo_url)} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Portfolio;
