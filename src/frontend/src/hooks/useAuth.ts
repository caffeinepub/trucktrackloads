import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from './useUserProfile';
import { useIsCallerAdmin } from './useQueries';
import { useAdminToken } from './useAdminToken';

export function useAuth() {
  const { identity, loginStatus } = useInternetIdentity();
  const adminToken = useAdminToken();
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    isFetched: profileFetched,
    error: profileError 
  } = useGetCallerUserProfile();
  const { 
    data: userRole, 
    isLoading: roleLoading, 
    isFetched: roleFetched,
    error: roleError 
  } = useGetCallerUserRole();
  const {
    data: isCallerAdmin,
    isLoading: adminCheckLoading,
    isFetched: adminCheckFetched,
    error: adminCheckError
  } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const hasPasswordAdmin = !!adminToken;
  
  // Get current principal as string for comparison
  const currentPrincipal = identity?.getPrincipal().toString() || null;
  
  // Only surface errors when authenticated or has password admin (ignore errors from anonymous state)
  const error = (isAuthenticated || hasPasswordAdmin) ? (profileError || roleError || adminCheckError) : null;
  
  // Loading logic:
  // - Always loading during initialization
  // - If authenticated, wait for role/profile to complete (but not admin check for II users)
  // - If password admin session exists, wait for admin verification
  // - If not authenticated and no password admin, not loading (no verification needed)
  const isLoading = loginStatus === 'initializing' || 
    (isAuthenticated && (profileLoading || roleLoading)) ||
    (hasPasswordAdmin && adminCheckLoading);
  
  // Compute isAdmin:
  // - For password admin sessions: ONLY check isCallerAdmin (ignore II completely)
  // - For Internet Identity: never grant admin access (admin must use password login)
  const isAdmin = hasPasswordAdmin 
    ? (adminCheckFetched && isCallerAdmin === true)
    : false;

  // Show profile setup only when authenticated and profile is confirmed null
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  return {
    identity,
    isAuthenticated,
    isLoading,
    isAdmin,
    userProfile,
    userRole,
    showProfileSetup,
    error: error as Error | null,
    currentPrincipal,
    hasPasswordAdmin,
  };
}
