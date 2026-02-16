import { MapPin } from 'lucide-react';

interface LoadLocationsProps {
  loadingLocation?: string;
  offloadingLocation?: string;
  className?: string;
}

export default function LoadLocations({ loadingLocation, offloadingLocation, className = '' }: LoadLocationsProps) {
  const hasLocations = loadingLocation || offloadingLocation;

  if (!hasLocations) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {loadingLocation && loadingLocation !== 'unknown' && (
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-muted-foreground">Pick Up:</span>{' '}
            <span className="text-foreground">{loadingLocation}</span>
          </div>
        </div>
      )}
      {offloadingLocation && offloadingLocation !== 'unknown' && (
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-muted-foreground">Drop Off:</span>{' '}
            <span className="text-foreground">{offloadingLocation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
