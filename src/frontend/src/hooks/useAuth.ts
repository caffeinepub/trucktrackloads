import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile, useGetCallerUserRole } from './useUserProfile';

export function useAuth() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userRole, isLoading: roleLoading, isFetched: roleFetched } = useGetCallerUserRole();

  const isAuthenticated = !!identity;
  
  // Treat role/profile checks as loading until queries are actually fetched for an authenticated user
  const isLoading = loginStatus === 'initializing' || 
    (isAuthenticated && (!profileFetched || !roleFetched)) ||
    profileLoading || 
    roleLoading;
  
  // Compute isAdmin from confirmed role result
  const isAdmin = isAuthenticated && roleFetched && userRole === 'admin';

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  return {
    identity,
    isAuthenticated,
    isLoading,
    isAdmin,
    userProfile,
    userRole,
    showProfileSetup,
  };
}
