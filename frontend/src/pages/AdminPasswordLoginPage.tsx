import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';
import { ADMIN_TOKEN_KEY, ADMIN_TOKEN_CHANGE_EVENT } from '@/constants/adminToken';
import { useActor } from '@/hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, LogIn } from 'lucide-react';
import { verifyAdminAccess } from '@/hooks/useAdminVerification';

export default function AdminPasswordLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    if (!actor) {
      setError('System not ready. Please refresh the page and try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[AdminLogin] Starting login process...');
      
      // Step 1: Call adminLogin to get the token
      const token = await actor.adminLogin(username.trim(), password.trim());
      console.log('[AdminLogin] Token received from backend');

      // Step 2: Store token in sessionStorage
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      
      // Step 3: Broadcast token change event
      window.dispatchEvent(new Event(ADMIN_TOKEN_CHANGE_EVENT));
      console.log('[AdminLogin] Token stored and event dispatched');

      // Step 4: Invalidate actor to force recreation with new token
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      console.log('[AdminLogin] Actor invalidated');

      // Step 5: Wait a moment for actor to reinitialize
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 6: Get the new actor instance
      const actorState = queryClient.getQueryData(['actor']);
      if (!actorState) {
        console.error('[AdminLogin] Actor not available after invalidation');
        setError('Failed to initialize admin session. Please try again.');
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        window.dispatchEvent(new Event(ADMIN_TOKEN_CHANGE_EVENT));
        setIsLoading(false);
        return;
      }

      // Step 7: Verify admin access with the new token
      console.log('[AdminLogin] Verifying admin access...');
      const isAdmin = await verifyAdminAccess(actor, token, queryClient);
      
      if (!isAdmin) {
        console.error('[AdminLogin] Verification failed: not admin');
        setError('Login successful but admin verification failed. Please try again.');
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        window.dispatchEvent(new Event(ADMIN_TOKEN_CHANGE_EVENT));
        setIsLoading(false);
        return;
      }

      console.log('[AdminLogin] Admin access verified successfully');
      
      // Step 8: Navigate to admin dashboard
      navigate({ to: '/admin' });
    } catch (err: any) {
      console.error('[AdminLogin] Login error:', err);
      
      // Clear any stored token on error
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      window.dispatchEvent(new Event(ADMIN_TOKEN_CHANGE_EVENT));
      
      if (err?.message?.includes('Incorrect username or password')) {
        setError('Incorrect username or password. Please try again.');
      } else if (err?.message?.includes('restricted to admin')) {
        setError('Access denied. This area is restricted to administrators only.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-primary" />
            <CardTitle>Admin Login</CardTitle>
          </div>
          <CardDescription>
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
              {error && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isLoading}
                >
                  Retry
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
