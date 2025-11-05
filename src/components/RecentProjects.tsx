import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/lib/portfolioService";
import { useNavigate } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";

const RecentProjects = () => {
  const navigate = useNavigate();

  // Fetch portfolio projects
  const { data: allProjects = [], isLoading: isPortfolioLoading } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: portfolioService.getPublishedProjects,
  });

  // Filter and get top 3 website projects
  const getWebsiteProjects = () => {
    const webTags = ['web', 'website', 'web app', 'landing', 'ecommerce', 'cms'];
    const webKeywords = ['web', 'website', 'ecom', 'commerce'];
    
    const websiteProjects = allProjects.filter(project => {
      const hasWebTag = project.tags?.some(tag => 
        webTags.some(webTag => tag.toLowerCase().includes(webTag))
      );
      const hasWebIndustry = project.industry && 
        webKeywords.some(keyword => project.industry.toLowerCase().includes(keyword));
      
      return hasWebTag || hasWebIndustry;
    });

    // If we have fewer than 3, fill with featured or recent projects
    if (websiteProjects.length < 3) {
      const remaining = allProjects
        .filter(p => !websiteProjects.includes(p))
        .slice(0, 3 - websiteProjects.length);
      websiteProjects.push(...remaining);
    }

    return websiteProjects.slice(0, 3);
  };

  const topWebsiteProjects = getWebsiteProjects();

  if (!isPortfolioLoading && topWebsiteProjects.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Recent Website Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live examples from our portfolio — real projects showcasing our web development expertise
          </p>
        </div>

        {isPortfolioLoading ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {topWebsiteProjects.map((project) => (
              <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                {project.cover_image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={project.cover_image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-brand-navy/10 to-brand-orange/10 flex items-center justify-center">
                    <Globe className="h-16 w-16 text-brand-orange/60" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    {project.industry && (
                      <Badge variant="secondary" className="text-xs">
                        {project.industry}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.short_description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {project.live_url ? (
                      <Button 
                        variant="cta" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(project.live_url, '_blank')}
                      >
                        View Live
                      </Button>
                    ) : (
                      <Button 
                        variant="cta" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/portfolio/${project.slug}`)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            variant="cta" 
            size="lg"
            onClick={() => navigate("/portfolio#top")}
            className="px-8 py-4 text-lg"
          >
            See Full Portfolio
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;
