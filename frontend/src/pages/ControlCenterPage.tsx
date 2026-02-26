import RequireAdmin from '@/components/auth/RequireAdmin';
import AdminRouteErrorBoundary from '@/components/auth/AdminRouteErrorBoundary';
import AdminOperationsTabs from '@/components/admin/AdminOperationsTabs';
import AppConfigurationSection from '@/components/control-center/AppConfigurationSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function ControlCenterContent() {
  return (
    <div className="container py-8 md:py-12 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">Control Center</h1>
        </div>
        <p className="text-muted-foreground">
          Manage all platform operations, settings, and configurations
        </p>
      </div>

      {/* App Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>App Configuration</CardTitle>
          <CardDescription>
            Manage Android APK download link and advertisement settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppConfigurationSection />
        </CardContent>
      </Card>

      {/* Admin Operations */}
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

export default function ControlCenterPage() {
  const queryClient = useQueryClient();

  return (
    <AdminRouteErrorBoundary queryClient={queryClient}>
      <RequireAdmin>
        <ControlCenterContent />
      </RequireAdmin>
    </AdminRouteErrorBoundary>
  );
}
