import { useState, useMemo } from 'react';
import { useGetAllTransportersWithLocations, useGetTruckTypeOptions, useGetAllTransporterStatuses } from '@/hooks/useQueries';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TransporterLocationsFilters from './TransporterLocationsFilters';
import TransporterLocationsMapView from './TransporterLocationsMapView';
import TransporterLocationList from './TransporterLocationList';
import type { TruckType, TransporterStatus } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';

export default function TransporterLocationsTab() {
  const { data: transportersData = [], isLoading, error } = useGetAllTransportersWithLocations();
  const { data: truckTypeOptions = [] } = useGetTruckTypeOptions();
  const { data: statusesData = [], isLoading: statusesLoading, error: statusesError } = useGetAllTransporterStatuses();
  
  const [hideWithoutLocation, setHideWithoutLocation] = useState(false);
  const [selectedTruckType, setSelectedTruckType] = useState<string>('all');
  const [showMapFallback, setShowMapFallback] = useState(false);

  // Build status lookup map
  const statusLookup = useMemo(() => {
    const map = new Map<string, TransporterStatus>();
    statusesData.forEach(([principal, status]) => {
      map.set(principal.toString(), status);
    });
    return map;
  }, [statusesData]);

  const filteredTransporters = useMemo(() => {
    let filtered = transportersData;

    // Filter by location availability
    if (hideWithoutLocation) {
      filtered = filtered.filter(([_, __, location]) => location !== null);
    }

    // Filter by truck type
    if (selectedTruckType !== 'all') {
      filtered = filtered.filter(([_, details]) => details.truckType === selectedTruckType);
    }

    return filtered;
  }, [transportersData, hideWithoutLocation, selectedTruckType]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading transporter locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-700" />
        <AlertDescription className="text-red-700">
          Failed to load transporter locations. This feature is admin-only. Please ensure you have the correct permissions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Transporter Locations</h2>
        <p className="text-muted-foreground">
          View real-time locations of transporters who are sharing their location data.
        </p>
      </div>

      <TransporterLocationsFilters
        hideWithoutLocation={hideWithoutLocation}
        onHideWithoutLocationChange={setHideWithoutLocation}
        selectedTruckType={selectedTruckType}
        onTruckTypeChange={setSelectedTruckType}
        truckTypeOptions={truckTypeOptions}
      />

      {!showMapFallback ? (
        <TransporterLocationsMapView
          transporters={filteredTransporters}
          truckTypeOptions={truckTypeOptions}
          onMapError={() => setShowMapFallback(true)}
        />
      ) : (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Map view is unavailable. Showing list view instead.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">
          All Transporters ({filteredTransporters.length})
        </h3>
        <TransporterLocationList
          transporters={filteredTransporters}
          truckTypeOptions={truckTypeOptions}
          statusLookup={statusLookup}
          statusesLoading={statusesLoading}
          statusesError={statusesError}
        />
      </div>
    </div>
  );
}
