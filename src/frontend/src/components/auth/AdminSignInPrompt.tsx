import { ShieldAlert } from 'lucide-react';
import LoginButton from './LoginButton';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function AdminSignInPrompt() {
  const navigate = useNavigate();

  // Store the current path to return to after login
  useEffect(() => {
    sessionStorage.setItem('adminLoginRedirect', '/admin');
  }, []);

  const handleLoginSuccess = () => {
    // Navigate back to /admin after successful login
    const redirectPath = sessionStorage.getItem('adminLoginRedirect') || '/admin';
    sessionStorage.removeItem('adminLoginRedirect');
    // Small delay to allow identity to be set
    setTimeout(() => {
      navigate({ to: redirectPath });
    }, 100);
  };

  return (
    <div className="container flex items-center justify-center min-h-[60vh] py-12">
      <div className="text-center max-w-md">
        <ShieldAlert className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground mb-6">
          You need to sign in with an authorized account to access the admin dashboard.
          Admin access is restricted to authorized accounts only.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Please sign in using Internet Identity to continue.
        </p>
        <div className="flex justify-center">
          <LoginButton onLoginSuccess={handleLoginSuccess} />
        </div>
        <p className="text-xs text-muted-foreground mt-8">
          Need admin access? Contact{' '}
          <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline">
            moleleholdings101@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
