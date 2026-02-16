import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setAdminToken } from '@/utils/urlParams';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPasswordLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const { actor } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRetryVerification = async () => {
    setVerificationError(null);
    setIsLoading(true);
    
    try {
      // Invalidate and refetch admin verification
      await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      await queryClient.refetchQueries({ queryKey: ['isCallerAdmin'] });
      
      // Check if verification succeeded by reading the query data
      const isAdmin = queryClient.getQueryData<boolean>(['isCallerAdmin']);
      
      if (isAdmin === true) {
        navigate({ to: '/admin', replace: true });
      } else {
        setVerificationError('Admin verification failed. Please try logging in again.');
      }
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to verify admin access. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerificationError(null);
    setIsLoading(true);

    try {
      if (!actor) {
        throw new Error('System not ready. Please refresh and try again.');
      }

      // Attempt login
      const token = await actor.adminLogin(username, password);
      
      if (!token) {
        throw new Error('Login failed: No token received');
      }

      // Store token in sessionStorage and broadcast change
      setAdminToken(token);

      // Wait for actor to be recreated with the new token
      // The actor query key includes the token, so it will automatically recreate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Invalidate actor to force recreation with new token
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      
      // Wait for actor to be ready
      await queryClient.refetchQueries({ queryKey: ['actor'] });

      // Now invalidate and refetch admin verification
      await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      await queryClient.refetchQueries({ queryKey: ['isCallerAdmin'] });

      // Check verification result by reading the query data
      const isAdmin = queryClient.getQueryData<boolean>(['isCallerAdmin']);
      
      if (isAdmin === true) {
        // Success - navigate to admin dashboard
        navigate({ to: '/admin', replace: true });
      } else {
        // Verification failed - show error with retry option
        setVerificationError('Login succeeded but admin verification failed. Please retry verification.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <span>{verificationError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryVerification}
                  disabled={isLoading}
                  className="w-fit"
                >
                  {isLoading ? 'Retrying...' : 'Retry Verification'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
