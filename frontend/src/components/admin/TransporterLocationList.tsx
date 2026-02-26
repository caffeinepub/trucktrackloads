import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, Truck, AlertCircle, MessageSquare } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { TransporterDetails, LiveLocation, TruckTypeOption, TransporterStatus } from '../../backend';

interface TransporterLocationListProps {
  transporters: Array<[Principal, TransporterDetails, LiveLocation | null]>;
  truckTypeOptions: TruckTypeOption[];
  statusLookup: Map<string, TransporterStatus>;
  statusesLoading: boolean;
  statusesError: Error | null;
}

export default function TransporterLocationList({ 
  transporters, 
  truckTypeOptions, 
  statusLookup,
  statusesLoading,
  statusesError
}: TransporterLocationListProps) {
  const getTruckTypeName = (truckType: any): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === truckType);
    return option?.name || String(truckType);
  };

  const formatTimestamp = (timestamp: bigint | undefined): string => {
    if (!timestamp) return 'Never';
    
    try {
      // Convert nanoseconds to milliseconds
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

  const isStaleLocation = (timestamp: bigint | undefined): boolean => {
    if (!timestamp) return true;
    
    try {
      const ms = Number(timestamp) / 1000000;
      const date = new Date(ms);
      const now = new Date();
      const diffMins = (now.getTime() - date.getTime()) / 60000;
      return diffMins > 60; // Stale if older than 1 hour
    } catch {
      return true;
    }
  };

  const isStaleStatus = (timestamp: bigint | undefined): boolean => {
    if (!timestamp) return false;
    
    try {
      const ms = Number(timestamp) / 1000000;
      const date = new Date(ms);
      const now = new Date();
      const diffHours = (now.getTime() - date.getTime()) / 3600000;
      return diffHours > 24; // Stale if older than 24 hours
    } catch {
      return false;
    }
  };

  if (transporters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No transporters registered yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transporters.map(([principal, details, location], index) => {
        const status = statusLookup.get(principal.toString());
        
        return (
          <Card key={index}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{details.company}</h3>
                    <Badge variant="outline" className="text-xs">
                      <Truck className="h-3 w-3 mr-1" />
                      {getTruckTypeName(details.truckType)}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{details.contactPerson}</p>
                    <p>{details.email} • {details.phone}</p>
                  </div>

                  {/* Status Section */}
                  <div className="pt-2 border-t">
                    {statusesLoading ? (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ) : statusesError ? (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Status unavailable</span>
                      </div>
                    ) : status ? (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{status.statusText}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span className={isStaleStatus(status.timestamp) ? 'text-orange-600' : 'text-muted-foreground'}>
                              {formatTimestamp(status.timestamp)}
                            </span>
                            {isStaleStatus(status.timestamp) && (
                              <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                Outdated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>No status set</span>
                      </div>
                    )}
                  </div>

                  {/* Location Section */}
                  {location ? (
                    <div className="flex items-start gap-2 text-sm pt-2 border-t">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </p>
                        {location.locationName && location.locationName !== `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` && (
                          <p className="text-muted-foreground">{location.locationName}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span className={isStaleLocation(location.timestamp) ? 'text-orange-600' : 'text-green-600'}>
                            {formatTimestamp(location.timestamp)}
                          </span>
                          {isStaleLocation(location.timestamp) && (
                            <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200 text-xs">
                              Stale
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <AlertCircle className="h-4 w-4" />
                      <span>No location data available</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
