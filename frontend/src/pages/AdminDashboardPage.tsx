import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import RequireAdmin from '@/components/auth/RequireAdmin';
import AdminRouteErrorBoundary from '@/components/auth/AdminRouteErrorBoundary';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import AdminOperationsTabs from '@/components/admin/AdminOperationsTabs';
import { ADMIN_TOKEN_KEY, ADMIN_TOKEN_CHANGE_EVENT } from '@/constants/adminToken';

function AdminDashboardContent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const hasPasswordAdmin = !!sessionStorage.getItem(ADMIN_TOKEN_KEY);

  const handlePasswordAdminSignOut = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    window.dispatchEvent(new Event(ADMIN_TOKEN_CHANGE_EVENT));
    queryClient.clear();
    toast.success('Signed out successfully');
    navigate({ to: '/admin/login' });
  };

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all platform operations, users, and content
          </p>
        </div>
        {hasPasswordAdmin && (
          <Button onClick={handlePasswordAdminSignOut} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Operations</CardTitle>
          <CardDescription>
            Manage users, loads, contracts, and other platform data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AdminOperationsTabs />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  return (
    <AdminRouteErrorBoundary queryClient={queryClient}>
      <RequireAdmin>
        <AdminDashboardContent />
      </RequireAdmin>
    </AdminRouteErrorBoundary>
  );
}
