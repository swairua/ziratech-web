import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FeaturedProductsInit } from './FeaturedProductsInit';
import {
  Users,
  FileText,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  Mail,
  Calendar,
  DollarSign,
  Loader2,
  Plus
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  formSubmissions: number;
  blogPosts: number;
  recentActivity: any[];
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: any;
  created_at: string;
}

export const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    formSubmissions: 0,
    blogPosts: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch form submissions count
      const { count: formsCount } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact', head: true });

      // Fetch blog posts count
      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      // Fetch recent form submissions for activity
      const { data: recentForms } = await supabase
        .from('form_submissions')
        .select('id, name, email, form_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent blog posts for activity
      const { data: recentBlogs } = await supabase
        .from('blog_posts')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      setStats({
        totalUsers: usersCount || 0,
        formSubmissions: formsCount || 0,
        blogPosts: blogCount || 0,
        recentActivity: []
      });

      // Format recent activity
      const activity: ActivityItem[] = [];
      
      if (recentForms) {
        recentForms.forEach((form) => {
          activity.push({
            id: form.id,
            type: 'form_submission',
            message: `New ${form.form_type} submission from ${form.name}`,
            time: formatTimeAgo(form.created_at),
            icon: Mail,
            created_at: form.created_at
          });
        });
      }

      if (recentBlogs) {
        recentBlogs.forEach((blog) => {
          activity.push({
            id: blog.id,
            type: 'blog_post',
            message: `Blog post "${blog.title}" ${blog.status === 'published' ? 'published' : 'updated'}`,
            time: formatTimeAgo(blog.created_at),
            icon: FileText,
            created_at: blog.created_at
          });
        });
      }

      // Sort by most recent and limit to 5
      activity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activity.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const quickActions = [
    {
      title: 'Add User',
      description: 'Create new user account',
      icon: Users,
      action: () => navigate('/admin/users'),
      color: 'text-blue-600'
    },
    {
      title: 'New Blog Post',
      description: 'Create content',
      icon: FileText,
      action: () => navigate('/admin/blog'),
      color: 'text-green-600'
    },
    {
      title: 'View Forms',
      description: 'Manage submissions',
      icon: Mail,
      action: () => navigate('/admin/forms'),
      color: 'text-purple-600'
    },
    {
      title: 'View Reports',
      description: 'Analytics & insights',
      icon: BarChart3,
      action: () => navigate('/admin/reports'),
      color: 'text-orange-600'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-orange" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const welcomeName = user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {welcomeName}! Here's what's happening with your business today.</p>
      </div>

      {/* Featured Products Setup */}
      <FeaturedProductsInit />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-gray-500">Registered users</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Form Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.formSubmissions.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-gray-500">Total submissions</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Blog Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.blogPosts.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-gray-500">Published content</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              System Status
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-gray-500">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <activity.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No recent activity to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <action.icon className={`h-6 w-6 ${action.color} mb-2 group-hover:scale-110 transition-transform`} />
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-sm">API Status</div>
                <div className="text-xs text-gray-600">All systems operational</div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-sm">Database</div>
                <div className="text-xs text-gray-600">Response time: 45ms</div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Optimal
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium text-sm">Storage</div>
                <div className="text-xs text-gray-600">78% capacity used</div>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Warning
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
