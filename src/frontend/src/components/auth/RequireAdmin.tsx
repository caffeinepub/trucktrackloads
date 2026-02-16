import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AccessDeniedScreen from './AccessDeniedScreen';
import AdminSignInPrompt from './AdminSignInPrompt';
import AdminRouteErrorState from './AdminRouteErrorState';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { isAdmin, isLoading, isAuthenticated, error } = useAuth();

  // Error state - show error with retry
  if (error) {
    return <AdminRouteErrorState error={error} />;
  }

  // Loading state - persist until role verification is complete
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

  // Not authenticated - show sign-in prompt
  if (!isAuthenticated) {
    return <AdminSignInPrompt />;
  }

  // Authenticated but not admin - show access denied
  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  // Admin - render dashboard
  return <>{children}</>;
}
