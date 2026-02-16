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
    // Only redirect after loading is complete and we know the user is not authorized
    if (!isLoading && !hasPasswordAdmin) {
      navigate({ to: '/admin/login', replace: true });
    }
  }, [isLoading, hasPasswordAdmin, navigate]);

  useEffect(() => {
    // Redirect non-admin users after verification completes
    // Only redirect if we have a definitive unauthorized state (not loading, not error)
    if (!isLoading && hasPasswordAdmin && isAdmin === false && !error) {
      navigate({ to: '/admin/login', replace: true });
    }
  }, [isLoading, hasPasswordAdmin, isAdmin, error, navigate]);

  // No password admin session - show loading while redirect happens
  if (!hasPasswordAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Show error state if verification failed
  if (error) {
    return <AdminRouteErrorState onRetry={handleRetry} />;
  }

  // Show loading while verification is in progress
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Only render children if admin verification passed
  if (isAdmin) {
    return <>{children}</>;
  }

  // Fallback: show loading while redirect is processing
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
