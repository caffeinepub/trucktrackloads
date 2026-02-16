import { useEffect, useState } from 'react';
import { getSessionParameter } from '@/utils/urlParams';

const ADMIN_TOKEN_KEY = 'caffeineAdminToken';
const ADMIN_TOKEN_CHANGE_EVENT = 'caffeineAdminTokenChange';

/**
 * Reactive hook that tracks the current admin token from sessionStorage
 * Automatically updates when the token changes via custom events
 */
export function useAdminToken() {
  const [token, setToken] = useState<string | null>(() => 
    getSessionParameter(ADMIN_TOKEN_KEY)
  );

  useEffect(() => {
    const handleTokenChange = () => {
      setToken(getSessionParameter(ADMIN_TOKEN_KEY));
    };

    // Listen for token change events
    window.addEventListener(ADMIN_TOKEN_CHANGE_EVENT, handleTokenChange);

    return () => {
      window.removeEventListener(ADMIN_TOKEN_CHANGE_EVENT, handleTokenChange);
    };
  }, []);

  return token;
}
