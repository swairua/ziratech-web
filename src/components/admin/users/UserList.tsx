import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Edit, Trash2, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  avatar_url: string | null;
  role: 'admin' | 'hr' | 'editor' | 'support_agent' | 'user' | null;
}

interface UserListProps {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  onEditUser: (userId: string) => void;
}

export const UserList = ({ searchQuery, roleFilter, statusFilter, onEditUser }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch current user's role to gate admin-only actions
    const fetchCurrentUserRole = async () => {
      if (!currentUser?.id) return;
      const roleResponse = await api.userRoles.get(String(currentUser.id));
      if (!roleResponse.error && roleResponse.data) {
        setIsAdmin(roleResponse.data.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };
    fetchCurrentUserRole();
  }, [currentUser?.id]);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, any> = {};
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.profiles.list(params);
      if (response.error) {
        throw new Error(response.error);
      }

      const rolesResponse = await api.userRoles.list();
      const roleMap = new Map();
      if (rolesResponse.data && Array.isArray(rolesResponse.data)) {
        rolesResponse.data.forEach((r: any) => roleMap.set(r.user_id, r.role));
      }

      let transformedUsers = (response.data as any[])?.map(u => ({
        id: u.user_id,
        email: u.company_email || '',
        full_name: u.full_name,
        status: u.status || 'active',
        last_login_at: u.last_login_at,
        created_at: u.created_at,
        avatar_url: u.avatar_url,
        role: roleMap.get(u.user_id) || null
      })) || [];

      if (roleFilter !== 'all') {
        transformedUsers = transformedUsers.filter(u => u.role === roleFilter);
      }

      setUsers(transformedUsers);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Forbidden",
        description: "Only admins can delete users.",
      });
      return;
    }

    if (currentUser?.id === userId) {
      toast({
        variant: "destructive",
        title: "Action not allowed",
        description: "You cannot delete your own account.",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await api.userRoles.delete(userId);
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user: " + (error?.message || 'Unknown error'),
      });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await api.profiles.update(userId, { status: newStatus });
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status: " + error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline">No Role</Badge>;
    
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      hr: 'bg-blue-100 text-blue-800',
      editor: 'bg-green-100 text-green-800',
      support_agent: 'bg-yellow-100 text-yellow-800',
      user: 'bg-gray-100 text-gray-800'
    } as const;

    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
        <CardDescription>Manage user accounts and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-brand-orange text-white text-xs">
                            {getInitials(user.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || 'No Name'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {user.last_login_at ? 
                          new Date(user.last_login_at).toLocaleDateString() : 
                          'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white z-50">
                          <DropdownMenuItem onClick={() => onEditUser(user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                            <Shield className="mr-2 h-4 w-4" />
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
