import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Edit, Eye, Trash } from 'lucide-react';

const roles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    color: 'bg-red-100 text-red-800',
    permissions: ['manage_users', 'manage_roles', 'view_analytics', 'manage_content', 'system_settings']
  },
  {
    id: 'hr',
    name: 'HR Manager',
    description: 'Human resources and user management',
    color: 'bg-blue-100 text-blue-800',
    permissions: ['manage_users', 'view_analytics', 'manage_forms']
  },
  {
    id: 'editor',
    name: 'Content Editor',
    description: 'Content creation and management',
    color: 'bg-green-100 text-green-800',
    permissions: ['manage_content', 'manage_blog', 'view_analytics']
  },
  {
    id: 'support_agent',
    name: 'Support Agent',
    description: 'Customer support and form management',
    color: 'bg-yellow-100 text-yellow-800',
    permissions: ['manage_forms', 'view_analytics']
  },
  {
    id: 'user',
    name: 'Standard User',
    description: 'Basic access with limited permissions',
    color: 'bg-gray-100 text-gray-800',
    permissions: ['view_dashboard']
  }
];

const permissionLabels = {
  manage_users: 'User Management',
  manage_roles: 'Role Management',
  view_analytics: 'View Analytics',
  manage_content: 'Content Management',
  system_settings: 'System Settings',
  manage_forms: 'Form Management',
  manage_blog: 'Blog Management',
  view_dashboard: 'Dashboard Access'
};

export const RoleManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Manage user roles and their associated permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <Badge className={role.color}>
                        {role.name}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions</h4>
                      <div className="space-y-1">
                        {role.permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">
                              {permissionLabels[permission as keyof typeof permissionLabels]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Detailed view of permissions for each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Permission</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center py-3 px-4 font-medium">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionLabels).map(([permission, label]) => (
                  <tr key={permission} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm font-medium">{label}</td>
                    {roles.map((role) => (
                      <td key={role.id} className="text-center py-3 px-4">
                        {role.permissions.includes(permission) ? (
                          <div className="w-5 h-5 bg-green-500 rounded-full mx-auto"></div>
                        ) : (
                          <div className="w-5 h-5 bg-gray-200 rounded-full mx-auto"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};