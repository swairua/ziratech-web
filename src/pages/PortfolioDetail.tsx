
import { useParams, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Github, Calendar, MapPin, User, BarChart3 } from "lucide-react";
import { portfolioService } from "@/lib/portfolioService";
import { useQuery } from "@tanstack/react-query";

const PortfolioDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['portfolio-project', slug],
    queryFn: () => portfolioService.getProjectBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-orange mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return <Navigate to="/portfolio" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/portfolio">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Project Header */}
            <div className="text-center mb-12">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge variant="outline" className="text-brand-orange border-brand-orange/30 bg-brand-orange/10">
                  {project.industry || 'Technology'}
                </Badge>
                {project.year && (
                  <Badge variant="secondary">
                    <Calendar className="h-3 w-3 mr-1" />
                    {project.year}
                  </Badge>
                )}
                {project.country && (
                  <Badge variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {project.country}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
                {project.title}
              </h1>

              {project.client && (
                <p className="text-xl text-brand-orange font-semibold mb-4">
                  Client: {project.client}
                </p>
              )}

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {project.short_description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                {project.live_url && (
                  <Button size="lg" asChild className="bg-brand-orange hover:bg-brand-orange-dark text-white">
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-5 w-5" />
                      View Live Project
                    </a>
                  </Button>
                )}
                
                {project.repo_url && (
                  <Button variant="outline" size="lg" asChild>
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-5 w-5" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {project.cover_image_url && (
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl mb-12">
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                {project.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-brand-navy">Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-lg max-w-none">
                        {project.description.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results Summary */}
                {project.results_summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-brand-navy flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Results & Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.results_summary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Metrics */}
                {project.metrics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-brand-navy">Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(project.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-brand-orange mb-1">
                              {value as string}
                            </div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Gallery */}
                {project.gallery_urls && project.gallery_urls.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-brand-navy">Project Gallery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.gallery_urls.map((url, index) => (
                          <div key={index} className="aspect-video rounded-lg overflow-hidden">
                            <img
                              src={url}
                              alt={`${project.title} screenshot ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-brand-navy">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.client && (
                      <div>
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <User className="h-4 w-4 mr-2" />
                          Client
                        </div>
                        <div className="text-brand-navy font-semibold">{project.client}</div>
                      </div>
                    )}

                    {project.year && (
                      <div>
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          Year
                        </div>
                        <div className="text-brand-navy font-semibold">{project.year}</div>
                      </div>
                    )}

                    {project.country && (
                      <div>
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          Location
                        </div>
                        <div className="text-brand-navy font-semibold">{project.country}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-brand-navy">Technologies Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-brand-navy">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h3>
            <p className="text-xl text-gray-300 mb-8">
              Let's discuss how we can help transform your business with innovative technology solutions.
            </p>
            <Button 
              size="lg"
              asChild
              className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-6 rounded-xl font-semibold text-lg"
            >
              <Link to="/#contact">
                Get Started Today
                <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortfolioDetail;
