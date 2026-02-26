import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminToken } from './useAdminToken';

/**
 * Deterministic admin verification helper
 * Returns a boolean indicating admin status without relying on refetchQueries return values
 */
export async function verifyAdminAccess(
  actor: any,
  adminToken: string | null,
  queryClient: any
): Promise<boolean> {
  if (!actor) {
    throw new Error('Actor not available');
  }

  if (!adminToken) {
    throw new Error('Admin token not found in session');
  }

  try {
    // Initialize actor with admin token
    await actor._initializeAccessControlWithSecret(adminToken);
    
    // Call backend to verify admin status
    const isAdmin = await actor.isCallerAdmin();
    
    // Update the cache with the verified result
    queryClient.setQueryData(['isCallerAdmin', adminToken], isAdmin);
    
    return isAdmin === true;
  } catch (error) {
    console.error('Admin verification error:', error);
    throw error;
  }
}

/**
 * Hook to perform admin verification with proper error handling
 */
export function useAdminVerification() {
  const { actor } = useActor();
  const adminToken = useAdminToken();
  const queryClient = useQueryClient();

  const verify = async (): Promise<boolean> => {
    return verifyAdminAccess(actor, adminToken, queryClient);
  };

  return { verify, actor, adminToken };
}
