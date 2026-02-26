import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from '@tanstack/react-router';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  const handlePasswordLogin = () => {
    navigate({ to: '/admin/login' });
  };

  return (
    <div className="container flex items-center justify-center min-h-[60vh] py-12">
      <div className="text-center max-w-md">
        <ShieldAlert className="h-20 w-20 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You do not have permission to access this area. Admin access is restricted to authorized accounts only.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          If you believe you should have admin access, please contact support at{' '}
          <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline font-medium">
            moleleholdings101@gmail.com
          </a>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link to="/">Return to Home</Link>
          </Button>
          <Button onClick={handlePasswordLogin} variant="outline">
            Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
}
