import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogStats {
  totalPosts: number;
  totalViews: number;
  publishedPosts: number;
  avgReadingTime: number;
}

export const BlogAnalytics = () => {
  const [stats, setStats] = useState<BlogStats>({
    totalPosts: 0,
    totalViews: 0,
    publishedPosts: 0,
    avgReadingTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogStats();
  }, []);

  const fetchBlogStats = async () => {
    try {
      setLoading(true);

      // Get all posts with view counts and reading times
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('status, view_count, reading_time');

      if (error) throw error;

      if (posts) {
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(post => post.status === 'published').length;
        const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);
        const readingTimes = posts.filter(post => post.reading_time).map(post => post.reading_time);
        const avgReadingTime = readingTimes.length > 0 
          ? Math.round(readingTimes.reduce((sum, time) => sum + time, 0) / readingTimes.length)
          : 0;

        setStats({
          totalPosts,
          totalViews,
          publishedPosts,
          avgReadingTime
        });
      }
    } catch (error) {
      console.error('Error fetching blog stats:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
            <div className="text-xs text-gray-500">all time posts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
            <div className="text-xs text-gray-500">total page views</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Published Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</div>
            <div className="text-xs text-gray-500">currently published</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Reading Time
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.avgReadingTime} min</div>
            <div className="text-xs text-gray-500">average reading time</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Views Over Time</CardTitle>
            <CardDescription>Track blog engagement by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart coming soon...</p>
                <p className="text-sm">Need more posts and views to display trends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
            <CardDescription>Most viewed post categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>Chart coming soon...</p>
                <p className="text-sm">Need more categorized posts to display data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Most viewed blog posts this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts with views yet</p>
            <p className="text-sm text-gray-400">Publish some posts to see performance data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
