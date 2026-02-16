import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface AdminRouteErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
}

export default function AdminRouteErrorState({ error, onRetry }: AdminRouteErrorStateProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Clear all queries and retry
    queryClient.invalidateQueries();
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
    window.location.href = '/#/admin';
  };

  return (
    <div className="container flex items-center justify-center min-h-[60vh] py-12">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-2xl">Admin Access Error</CardTitle>
          </div>
          <CardDescription>
            We encountered a problem while verifying your admin access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-mono text-muted-foreground break-words">
                {error.message || 'An unknown error occurred'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This could be due to a temporary connection issue or a problem with the backend service.
            </p>
            <p className="text-sm text-muted-foreground">
              Try the following steps:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Click "Retry" to attempt verification again</li>
              <li>If that doesn't work, try signing out and signing back in</li>
              <li>Check your internet connection</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Verification
            </Button>
            {identity && (
              <Button onClick={handleSignOut} variant="outline" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out & Retry
              </Button>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Still having issues? Contact support at{' '}
              <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline">
                moleleholdings101@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
