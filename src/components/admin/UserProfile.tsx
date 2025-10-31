import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Mail, Calendar, LogOut } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_email: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: string;
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserRole();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error(
          'Error fetching profile:',
          JSON.stringify({
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }, null, 2)
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data.",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error(
        'Error fetching profile:',
        JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }, null, 2)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
    }
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('full_name') as string;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        fetchProfile();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "An error occurred while signing out.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences.</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-lg">
                {profile?.full_name ? getInitials(profile.full_name) : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{profile?.full_name || 'No name set'}</h3>
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {user?.email}
              </div>
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Edit your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name || ''}
                placeholder="Enter your full name"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed from this interface</p>
            </div>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSignOut} 
            variant="destructive" 
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
