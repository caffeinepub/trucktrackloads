import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import AdminRouteErrorState from './AdminRouteErrorState';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { isAdmin, isLoading, error, hasPasswordAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleRetry = () => {
    // Refetch all admin verification queries without full reload
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
  };

  // Use effect for navigation to avoid render-time navigation
  useEffect(() => {
    // Only redirect after verification has completed (not loading)
    // and we have a definitive result (not admin)
    if (!isLoading && !isAdmin && hasPasswordAdmin) {
      // User has password admin session but verification failed/returned false
      // Redirect to login page
      navigate({ to: '/admin/login', replace: true });
    }
  }, [isLoading, isAdmin, hasPasswordAdmin, navigate]);

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {hasPasswordAdmin ? 'Verifying admin access...' : 'Checking authorization...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if there was an error during verification
  if (error) {
    return <AdminRouteErrorState onRetry={handleRetry} />;
  }

  // If not admin and not loading, don't render anything
  // (navigation will happen via useEffect)
  if (!isAdmin) {
    return null;
  }

  // User is admin, render children
  return <>{children}</>;
}
