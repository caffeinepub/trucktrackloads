import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useGetTransporterStatus, useSetTransporterStatus } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function TransporterStatusCard() {
  const { data: currentStatus, isLoading: loadingStatus } = useGetTransporterStatus();
  const setStatusMutation = useSetTransporterStatus();
  
  const [statusText, setStatusText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentStatus) {
      setStatusText(currentStatus.statusText);
      setHasChanges(false);
    }
  }, [currentStatus]);

  const handleStatusChange = (value: string) => {
    setStatusText(value);
    setHasChanges(value !== (currentStatus?.statusText || ''));
  };

  const handleSave = async () => {
    if (!statusText.trim()) {
      toast.error('Please enter a status message');
      return;
    }

    try {
      await setStatusMutation.mutateAsync(statusText.trim());
      toast.success('Status updated successfully');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      
      // Handle authorization errors with user-friendly messages
      if (error?.message?.includes('Unauthorized')) {
        toast.error('You must be a registered transporter to update your status');
      } else {
        toast.error('Failed to update status. Please try again.');
      }
    }
  };

  const formatTimestamp = (timestamp: bigint | undefined): string => {
    if (!timestamp) return 'Never';
    
    try {
      const ms = Number(timestamp) / 1000000;
      const date = new Date(ms);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loadingStatus) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Operational Status</CardTitle>
          </div>
          {currentStatus && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Set
            </Badge>
          )}
        </div>
        <CardDescription>
          Update your current operational status for administrators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {setStatusMutation.isError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-700" />
            <AlertDescription className="text-red-700">
              Failed to update status. Please ensure you are a registered transporter.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status Message
          </label>
          <Textarea
            id="status"
            placeholder="e.g., Available for pickup, En route to Johannesburg, Loading cargo..."
            value={statusText}
            onChange={(e) => handleStatusChange(e.target.value)}
            rows={3}
            disabled={setStatusMutation.isPending}
            className="resize-none"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {formatTimestamp(currentStatus?.timestamp)}</span>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || setStatusMutation.isPending || !statusText.trim()}
          className="w-full"
          size="lg"
        >
          {setStatusMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              Update Status
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your status will be visible to administrators for coordination and tracking purposes.
        </p>
      </CardContent>
    </Card>
  );
}
