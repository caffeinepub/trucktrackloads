import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertCircle, Clock, Truck } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { TransporterDetails, LiveLocation, TruckTypeOption } from '../../backend';

interface TransporterLocationsMapViewProps {
  transporters: Array<[Principal, TransporterDetails, LiveLocation | null]>;
  truckTypeOptions: TruckTypeOption[];
  onMapError?: () => void;
}

export default function TransporterLocationsMapView({
  transporters,
  truckTypeOptions,
  onMapError,
}: TransporterLocationsMapViewProps) {
  const [mapError, setMapError] = useState(false);
  const [selectedTransporter, setSelectedTransporter] = useState<number | null>(null);

  const getTruckTypeName = (truckType: any): string => {
    const option = truckTypeOptions.find(opt => opt.truckType === truckType);
    return option?.name || String(truckType);
  };

  const formatTimestamp = (timestamp: bigint | undefined): string => {
    if (!timestamp) return 'Never';
    
    try {
      const ms = Number(timestamp) / 1000000;
      const date = new Date(ms);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // Simple map visualization using CSS grid
  const transportersWithLocation = transporters.filter(([_, __, location]) => location !== null);

  if (mapError) {
    if (onMapError) onMapError();
    return null;
  }

  if (transportersWithLocation.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No transporters with location data available to display on the map.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Showing {transportersWithLocation.length} transporter{transportersWithLocation.length !== 1 ? 's' : ''} with active location data.
          Click on a marker below to view details.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-3">
            {transportersWithLocation.map(([principal, details, location], index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTransporter === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTransporter(selectedTransporter === index ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{details.company}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Truck className="h-3 w-3 mr-1" />
                        {getTruckTypeName(details.truckType)}
                      </Badge>
                    </div>

                    {selectedTransporter === index && location && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Contact Person</p>
                          <p className="font-medium">{details.contactPerson}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contact Info</p>
                          <p>{details.email}</p>
                          <p>{details.phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-mono text-xs">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">Last updated: {formatTimestamp(location.timestamp)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
