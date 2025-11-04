import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Search, Activity, Clock, User } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
  created_at: string;
}

export const ActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchActivityLogs();
  }, [searchQuery]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);

      const response = await api.activityLogs.list({ limit: 50 });

      if (response.error) {
        throw new Error(response.error);
      }

      let logs = response.data || [];

      // Apply search filter on client side
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        logs = logs.filter((log: any) =>
          log.action?.toLowerCase().includes(query) ||
          log.resource_type?.toLowerCase().includes(query)
        );
      }

      // Sort by created_at descending
      logs.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setLogs(logs);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch activity logs: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors = {
      'user_created': 'bg-green-100 text-green-800',
      'user_updated': 'bg-blue-100 text-blue-800',
      'user_deleted': 'bg-red-100 text-red-800',
      'role_assigned': 'bg-purple-100 text-purple-800',
      'login': 'bg-gray-100 text-gray-800',
      'logout': 'bg-gray-100 text-gray-800'
    } as const;

    return (
      <Badge className={actionColors[action as keyof typeof actionColors] || 'bg-gray-100 text-gray-800'}>
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDetails = (details: any) => {
    if (!details) return null;
    
    // Format JSON details for display
    return Object.entries(details).map(([key, value]) => (
      <div key={key} className="text-xs text-gray-500">
        <span className="font-medium">{key}:</span> {String(value)}
      </div>
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activity logs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Activity Logs</span>
          </CardTitle>
          <CardDescription>
            Track user actions and system events for security and auditing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Activity Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">No activity logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">
                              {log.user_id ? `User ${log.user_id.slice(0, 8)}...` : 'System'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Activity Log
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        {log.resource_type ? (
                          <div className="text-sm">
                            <div className="font-medium">{log.resource_type}</div>
                            {log.resource_id && (
                              <div className="text-xs text-gray-500 font-mono">
                                {log.resource_id.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48">
                          {formatDetails(log.details)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <div>
                            <div>{new Date(log.created_at).toLocaleDateString()}</div>
                            <div className="text-xs">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
