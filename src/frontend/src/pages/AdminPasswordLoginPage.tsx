import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '@/hooks/useActor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setAdminToken } from '@/utils/urlParams';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type DiagnosticStage = 'credential-validation' | 'token-storage' | 'actor-recreation' | 'admin-verification' | 'navigation';

interface DiagnosticInfo {
  stage: DiagnosticStage;
  success: boolean;
  message: string;
  timestamp: number;
}

export default function AdminPasswordLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo[]>([]);
  
  const { actor } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addDiagnostic = (stage: DiagnosticStage, success: boolean, message: string) => {
    setDiagnostics(prev => [...prev, { stage, success, message, timestamp: Date.now() }]);
  };

  const handleRetryVerification = async () => {
    setVerificationError(null);
    setIsLoading(true);
    setDiagnostics([]);
    
    try {
      addDiagnostic('actor-recreation', true, 'Invalidating actor to force recreation with stored token...');
      
      // Invalidate actor first to ensure it's recreated with the token
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      
      // Wait for actor to be ready
      await queryClient.refetchQueries({ queryKey: ['actor'] });
      
      addDiagnostic('actor-recreation', true, 'Actor recreated successfully');
      addDiagnostic('admin-verification', true, 'Attempting admin verification...');
      
      // Now invalidate and refetch admin verification - this returns the query results
      await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      const results = await queryClient.refetchQueries({ queryKey: ['isCallerAdmin'] });
      
      // Check the actual refetch result
      const verificationResult = results[0];
      if (verificationResult?.state?.data === true) {
        addDiagnostic('admin-verification', true, 'Admin verification succeeded');
        addDiagnostic('navigation', true, 'Navigating to admin dashboard...');
        navigate({ to: '/admin', replace: true });
      } else {
        addDiagnostic('admin-verification', false, 'Admin verification returned false or undefined');
        setVerificationError('Admin verification failed. The backend did not confirm admin access. Please try logging in again or contact support.');
      }
    } catch (err: any) {
      console.error('Verification retry error:', err);
      addDiagnostic('admin-verification', false, `Verification error: ${err.message || 'Unknown error'}`);
      setVerificationError(err.message || 'Failed to verify admin access. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerificationError(null);
    setDiagnostics([]);
    setIsLoading(true);

    try {
      if (!actor) {
        throw new Error('System not ready. Please refresh the page and try again.');
      }

      // Trim whitespace from inputs to handle accidental spaces
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      // Validate inputs
      if (!trimmedUsername || !trimmedPassword) {
        throw new Error('Username and password cannot be empty or contain only whitespace');
      }

      addDiagnostic('credential-validation', true, 'Attempting login with provided credentials...');

      // Step 1: Attempt login to get token
      const token = await actor.adminLogin(trimmedUsername, trimmedPassword);
      
      if (!token) {
        addDiagnostic('credential-validation', false, 'Login failed: No token received from backend');
        throw new Error('Login failed: No authentication token received');
      }

      addDiagnostic('credential-validation', true, 'Credentials validated successfully, token received');
      addDiagnostic('token-storage', true, 'Storing token in sessionStorage...');

      // Step 2: Store token in sessionStorage and broadcast change
      setAdminToken(token);
      
      addDiagnostic('token-storage', true, 'Token stored successfully');
      addDiagnostic('actor-recreation', true, 'Invalidating actor to force recreation with new token...');

      // Step 3: Invalidate actor to force recreation with new token
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      
      // Step 4: Wait for actor to be recreated
      await queryClient.refetchQueries({ queryKey: ['actor'] });

      addDiagnostic('actor-recreation', true, 'Actor recreated successfully');
      addDiagnostic('admin-verification', true, 'Attempting admin verification...');

      // Step 5: Invalidate and refetch admin verification with the new actor
      await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      const results = await queryClient.refetchQueries({ queryKey: ['isCallerAdmin'] });

      // Step 6: Check the actual refetch result (not cached data)
      const verificationResult = results[0];
      
      if (verificationResult?.state?.data === true) {
        // Success - navigate to admin dashboard
        addDiagnostic('admin-verification', true, 'Admin verification succeeded');
        addDiagnostic('navigation', true, 'Navigating to admin dashboard...');
        navigate({ to: '/admin', replace: true });
      } else if (verificationResult?.state?.error) {
        // Verification query errored
        const errorMsg = verificationResult.state.error instanceof Error 
          ? verificationResult.state.error.message 
          : 'Verification failed';
        addDiagnostic('admin-verification', false, `Verification error: ${errorMsg}`);
        setVerificationError(`Login succeeded but verification failed: ${errorMsg}. Please retry.`);
      } else {
        // Verification returned false or undefined
        addDiagnostic('admin-verification', false, 'Verification returned false or undefined');
        setVerificationError('Login succeeded but admin verification returned false. Please retry verification or contact support.');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      
      // Parse error message for better user feedback
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      let diagnosticMessage = err.message || 'Unknown error';
      
      if (err.message) {
        if (err.message.includes('Incorrect username or password')) {
          errorMessage = 'Incorrect username or password. Please try again.';
          diagnosticMessage = 'Backend rejected credentials';
        } else if (err.message.includes('not ready')) {
          errorMessage = 'System is initializing. Please wait a moment and try again.';
        } else if (err.message.includes('empty') || err.message.includes('whitespace')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }
      
      addDiagnostic('credential-validation', false, diagnosticMessage);
      setError(errorMessage);
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
              <AlertDescription>
                <div className="font-semibold mb-1">Credential Validation Failed</div>
                <div>{error}</div>
              </AlertDescription>
            </Alert>
          )}

          {verificationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <div className="font-semibold">Admin Verification Failed</div>
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

          {diagnostics.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-md text-xs space-y-1 max-h-48 overflow-y-auto">
              <div className="font-semibold mb-2">Diagnostic Log:</div>
              {diagnostics.map((diag, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {diag.success ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <span className="font-medium capitalize">{diag.stage.replace(/-/g, ' ')}:</span>{' '}
                    <span className={diag.success ? 'text-muted-foreground' : 'text-destructive'}>
                      {diag.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
