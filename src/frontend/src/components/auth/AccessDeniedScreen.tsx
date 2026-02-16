import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export default function AccessDeniedScreen() {
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
          <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline">
            moleleholdings101@gmail.com
          </a>
        </p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
