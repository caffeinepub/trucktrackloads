import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useTransporterLiveLocation } from '@/hooks/useTransporterLiveLocation';

export default function LiveLocationToggleCard() {
  const { isActive, lastUpdate, error, start, stop, isUpdating } = useTransporterLiveLocation();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    return date.toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Live Location Sharing</CardTitle>
          </div>
          {isActive && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          Share your real-time location with administrators for load tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-700" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {isActive && !error && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-700" />
            <AlertDescription className="text-green-700">
              Your location is being shared with administrators. Updates are sent every 30 seconds.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last update: {formatLastUpdate(lastUpdate)}</span>
          </div>
          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </div>

        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={start} className="w-full" size="lg">
              <MapPin className="mr-2 h-4 w-4" />
              Start Sharing Location
            </Button>
          ) : (
            <Button onClick={stop} variant="destructive" className="w-full" size="lg">
              Stop Sharing Location
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Location sharing requires browser permission and will continue until you stop it or log out.
        </p>
      </CardContent>
    </Card>
  );
}
