import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ADMIN_TOKEN_KEY, ADMIN_TOKEN_CHANGE_EVENT } from '@/constants/adminToken';

interface AdminRouteErrorStateProps {
  onRetry?: () => void;
}

export default function AdminRouteErrorState({ onRetry }: AdminRouteErrorStateProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = () => {
    // Clear admin token from sessionStorage
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    
    // Broadcast change event
    window.dispatchEvent(new Event(ADMIN_TOKEN_CHANGE_EVENT));
    
    // Clear all cached queries
    queryClient.clear();
    
    // Navigate to login
    navigate({ to: '/admin/login', replace: true });
  };

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior: invalidate actor and admin verification
      await queryClient.invalidateQueries({ queryKey: ['actor'] });
      await queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Admin Access Error</CardTitle>
          </div>
          <CardDescription>
            There was a problem verifying your admin access. This could be due to a network issue or session expiration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleRetry} className="w-full" variant="default">
            Retry Verification
          </Button>
          <Button onClick={handleSignOut} className="w-full" variant="outline">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
