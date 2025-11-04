import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, refreshSession } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/admin/dashboard');
    }
  }, [loading, user, navigate]);

  const API_URL = (import.meta.env.VITE_API_URL as string) || 'https://zira-tech.com/api.php';

  async function hashPasswordLocal(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const password = formData.get('password') as string || '';

    try {
      if (!email || !password) throw new Error('Please enter email and password');

      const passwordHash = await hashPasswordLocal(password);

      // Fetch user by email
      const url = new URL(API_URL);
      url.searchParams.set('table', 'users');
      url.searchParams.set('email', email);

      const resp = await fetch(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        console.error('API GET users failed:', resp.status, txt);
        throw new Error('Login failed. Please try again.');
      }

      const json = await resp.json().catch((err) => {
        console.error('Failed to parse users response:', err);
        throw new Error('Login failed. Please try again.');
      });

      const users = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      if (!users || users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];
      if (!user || (user.password_hash || '') !== passwordHash) {
        throw new Error('Invalid email or password');
      }

      // Get role
      const roleUrl = new URL(API_URL);
      roleUrl.searchParams.set('table', 'user_roles');
      roleUrl.searchParams.set('user_id', String(user.id));
      const roleResp = await fetch(roleUrl.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      const roleJson = await roleResp.json().catch(() => null);
      const roleRows = Array.isArray(roleJson?.data) ? roleJson.data : Array.isArray(roleJson) ? roleJson : [];
      const userRole = roleRows[0]?.role || 'user';

      // Update last login (best-effort)
      fetch(`${API_URL}?table=users&id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_login_at: new Date().toISOString() }),
      }).catch(err => console.warn('Failed to update last login:', err));

      // Audit log (best-effort)
      fetch(`${API_URL}?table=activity_logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          action: 'login',
          table_name: 'users',
          record_id: user.id,
          description: JSON.stringify({ email: user.email })
        }),
      }).catch(err => console.warn('Failed to write login log:', err));

      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const session = {
        user: {
          id: Number(user.id),
          email: user.email,
          full_name: user.full_name,
          status: user.status,
          role: (userRole || 'user').toLowerCase(),
        },
        token,
      };

      localStorage.setItem('auth_session', JSON.stringify(session));
      localStorage.setItem('auth_token', token);

      await refreshSession();

      toast({ title: 'Welcome back!', description: 'You have been successfully logged in.' });
      navigate('/admin/dashboard');
    } catch (error) {
      const technical = error instanceof Error ? error : new Error(String(error));
      console.error('Login error:', technical);
      const userMessage = /response body|API Error|Invalid JSON/i.test(technical.message)
        ? 'Login failed. Please try again.'
        : technical.message || 'Login failed. Please try again.';

      toast({ variant: 'destructive', title: 'Login Failed', description: userMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('reset-email') as string;

    try {
      const result = await authApi.resetPassword(email);

      if (result.success) {
        toast({
          title: "Reset Email Sent",
          description: "Please check your email for password reset instructions.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: "Password reset is not yet implemented. Please contact support.",
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "Password reset failed. Please contact support.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;
    const fullName = formData.get('full-name') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const session = await authApi.signup(email, password, fullName);
      await refreshSession();

      toast({
        title: "Account Created!",
        description: "You have been automatically logged in.",
      });
      navigate('/admin/dashboard');
    } catch (error) {
      const technical = error instanceof Error ? error : new Error(String(error));
      console.error('Signup error:', technical);
      const userMessage = /response body|API Error|Invalid JSON/i.test(technical.message)
        ? 'Signup failed. Please try again.'
        : technical.message || 'Signup failed. Please try again.';

      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: userMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Zira Technologies</CardTitle>
          <CardDescription>Access your company dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    name="full-name"
                    type="text"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    placeholder="your@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    placeholder="your@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset email...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
