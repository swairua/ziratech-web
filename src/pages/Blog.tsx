import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/apiClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, User, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  category_id: string;
  tags: string[];
  reading_time: number;
  view_count: number;
  author?: {
    full_name: string;
  };
  category?: {
    name: string;
    color: string;
  };
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 6;
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogPosts();
  }, [currentPage, searchQuery]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);

      const response = await api.blogPosts.list({ status: 'published' });

      if (response.error) {
        throw new Error(response.error);
      }

      let data = response.data || [];

      // Filter by search query on client side
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter((post: any) =>
          post.title?.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query)
        );
      }

      // Sort by published_at descending
      data.sort((a: any, b: any) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );

      // Pagination on client side
      const from = (currentPage - 1) * postsPerPage;
      const to = from + postsPerPage;
      const paginatedPosts = data.slice(from, to);

      // Fetch authors and categories separately
      const authorIds = [...new Set(paginatedPosts?.map((post: any) => post.author_id).filter(Boolean))];
      const categoryIds = [...new Set(paginatedPosts?.map((post: any) => post.category_id).filter(Boolean))];

      let authorsData: any[] = [];
      let categoriesData: any[] = [];

      if (authorIds.length > 0) {
        const authResponse = await api.profiles.list();
        if (!authResponse.error) {
          authorsData = authResponse.data || [];
        }
      }

      if (categoryIds.length > 0) {
        const catResponse = await api.blogCategories.list();
        if (!catResponse.error) {
          categoriesData = catResponse.data || [];
        }
      }

      const authorsMap = new Map<string, any>();
      const categoriesMap = new Map<string, any>();

      authorsData?.forEach(author => {
        if (author?.user_id) {
          authorsMap.set(author.user_id, author);
        }
      });

      categoriesData?.forEach(cat => {
        if (cat?.id) {
          categoriesMap.set(cat.id, cat);
        }
      });

      const formattedPosts = paginatedPosts?.map((post: any) => ({
        ...post,
        author: authorsMap.get(post.author_id) || { full_name: 'Anonymous' },
        category: categoriesMap.get(post.category_id) || undefined
      })) || [];

      setPosts(formattedPosts);
      setTotalPages(Math.ceil((data.length || 0) / postsPerPage));
    } catch (error) {
      console.error(
        'Error fetching blog posts:',
        JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }, null, 2)
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load blog posts. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-brand-navy via-brand-navy-dark to-brand-navy">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Zira Technologies Blog
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Insights, innovations, and industry knowledge from our team of experts
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-brand-navy mb-4">
                {searchQuery ? 'No posts found' : 'No blog posts yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search terms.' 
                  : 'Check back soon for new content!'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                    onClick={() => handlePostClick(post.slug)}
                  >
                    {post.featured_image_url && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      {post.category && (
                        <Badge 
                          className="w-fit mb-2"
                          style={{ 
                            backgroundColor: post.category.color + '20',
                            color: post.category.color,
                            border: `1px solid ${post.category.color}40`
                          }}
                        >
                          {post.category.name}
                        </Badge>
                      )}
                      <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-orange transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{post.author?.full_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-brand-orange group-hover:text-brand-orange-dark">
                          <span className="text-sm font-medium">Read more</span>
                          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                      
                      {post.reading_time && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {post.reading_time} min read
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-brand-orange hover:bg-brand-orange-dark" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
