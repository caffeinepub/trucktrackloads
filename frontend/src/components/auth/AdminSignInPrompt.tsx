import { ShieldAlert } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function AdminSignInPrompt() {
  const navigate = useNavigate();

  const handlePasswordLogin = () => {
    navigate({ to: '/admin/login' });
  };

  return (
    <div className="container flex items-center justify-center min-h-[60vh] py-12">
      <div className="text-center max-w-md">
        <ShieldAlert className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground mb-8">
          You need to sign in with admin credentials to access the admin dashboard.
          Admin access is restricted to authorized accounts only.
        </p>
        
        <Button onClick={handlePasswordLogin} size="lg" className="w-full">
          Sign In with Admin Credentials
        </Button>

        <p className="text-xs text-muted-foreground mt-8">
          Need admin access? Contact{' '}
          <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline font-medium">
            moleleholdings101@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
