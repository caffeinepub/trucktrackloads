import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginButtonProps {
  onLoginSuccess?: () => void;
}

export default function LoginButton({ onLoginSuccess }: LoginButtonProps = {}) {
  const { login, clear, loginStatus } = useInternetIdentity();
  const { isAuthenticated, userProfile } = useAuth();
  const queryClient = useQueryClient();

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
        // Call the optional post-login callback
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isLoading = loginStatus === 'logging-in' || loginStatus === 'initializing';

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoading}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loginStatus === 'initializing' ? 'Loading...' : 'Logging in...'}
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{userProfile?.name || 'Logout'}</span>
          <span className="sm:hidden">Logout</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
}
