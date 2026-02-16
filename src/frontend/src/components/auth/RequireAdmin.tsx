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
    queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
  };

  // Use effect for navigation to avoid render-time navigation
  useEffect(() => {
    // Only redirect after loading is complete and we know the user is not authorized
    if (!isLoading && !hasPasswordAdmin) {
      navigate({ to: '/admin/login' });
    }
  }, [isLoading, hasPasswordAdmin, navigate]);

  useEffect(() => {
    // Redirect non-admin users after verification completes
    if (!isLoading && hasPasswordAdmin && !isAdmin && !error) {
      navigate({ to: '/admin/login' });
    }
  }, [isLoading, hasPasswordAdmin, isAdmin, error, navigate]);

  // No password admin session - show loading while redirect happens
  if (!hasPasswordAdmin) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Loading state - persist until all verification is complete
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
          <p className="text-xs text-muted-foreground mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Error state - show error with retry
  if (error) {
    return <AdminRouteErrorState error={error} onRetry={handleRetry} />;
  }

  // Not admin - show loading while redirect happens
  if (!isAdmin) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Admin - render dashboard
  return <>{children}</>;
}
