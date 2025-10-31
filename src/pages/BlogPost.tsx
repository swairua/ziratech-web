import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Clock, Eye, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  published_at: string;
  author_id: string;
  category_id: string;
  tags: string[];
  reading_time: number;
  view_count: number;
  meta_title: string;
  meta_description: string;
  author?: {
    full_name: string;
  };
  category?: {
    name: string;
    color: string;
  };
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      // Fetch author and category separately
      const [authorData, categoryData] = await Promise.all([
        data.author_id ? supabase.from('profiles').select('user_id, full_name').eq('user_id', data.author_id).single() : null,
        data.category_id ? supabase.from('blog_categories').select('id, name, color').eq('id', data.category_id).single() : null
      ]);

      const formattedPost = {
        ...data,
        author: authorData?.data || { full_name: 'Anonymous' },
        category: categoryData?.data
      };

      setPost(formattedPost);

      // Update view count
      await supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      // Fetch related posts
      if (data.category_id) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(3);

        if (related && related.length > 0) {
          const relatedAuthorIds = [...new Set(related.map(post => post.author_id).filter(Boolean))];
          const [relatedAuthorsData] = await Promise.all([
            relatedAuthorIds.length > 0 ? supabase.from('profiles').select('user_id, full_name').in('user_id', relatedAuthorIds) : { data: [] }
          ]);

          const relatedAuthorsMap = new Map<string, any>();
          
          relatedAuthorsData.data?.forEach(author => {
            if (author?.user_id) {
              relatedAuthorsMap.set(author.user_id, author);
            }
          });

          const formattedRelated = related.map(post => ({
            ...post,
            author: relatedAuthorsMap.get(post.author_id) || { full_name: 'Anonymous' },
            category: categoryData?.data || undefined
          }));
          setRelatedPosts(formattedRelated);
        }
      }

    } catch (error) {
      console.error(
        'Error fetching blog post:',
        JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }, null, 2)
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load blog post. Please try again.",
      });
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Blog post link has been copied to your clipboard.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-navy mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/blog')} className="bg-brand-orange hover:bg-brand-orange-dark">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <article className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-dark py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/blog')}
                className="text-white hover:bg-white/10 mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
              
              {post.category && (
                <Badge 
                  className="mb-4"
                  style={{ 
                    backgroundColor: post.category.color + '40',
                    color: 'white',
                    border: `1px solid ${post.category.color}`
                  }}
                >
                  {post.category.name}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{post.author?.full_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                {post.reading_time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.reading_time} min read</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{post.view_count + 1} views</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare}
                  className="text-white hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="w-full">
            <div className="container mx-auto px-4 -mt-8">
              <div className="max-w-4xl mx-auto">
                <div className="aspect-video overflow-hidden rounded-lg shadow-xl">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-brand-navy prose-a:text-brand-orange prose-a:no-underline hover:prose-a:underline prose-strong:text-brand-navy prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-brand-navy mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-brand-navy mb-8 text-center">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card 
                      key={relatedPost.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    >
                      {relatedPost.featured_image_url && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={relatedPost.featured_image_url}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-brand-navy mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
