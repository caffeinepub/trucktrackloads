import { useState, useEffect, useCallback, useRef } from 'react';
import { useUpdateTransporterLocation } from './useQueries';
import { useInternetIdentity } from './useInternetIdentity';
import type { LiveLocation } from '../backend';

interface GeolocationError {
  code: number;
  message: string;
}

interface UseTransporterLiveLocationReturn {
  isActive: boolean;
  lastUpdate: Date | null;
  error: string | null;
  start: () => void;
  stop: () => void;
  isUpdating: boolean;
}

const UPDATE_INTERVAL = 30000; // 30 seconds

export function useTransporterLiveLocation(): UseTransporterLiveLocationReturn {
  const [isActive, setIsActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateLocation = useUpdateTransporterLocation();
  const { identity } = useInternetIdentity();
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleGeolocationError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Unable to access location';
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable. Please check your device settings.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.';
        break;
      default:
        errorMessage = 'An unknown error occurred while accessing location.';
    }
    
    setError(errorMessage);
    setIsActive(false);
  }, []);

  const sendLocationUpdate = useCallback(async (position: GeolocationPosition) => {
    if (!identity) {
      setError('You must be signed in to share your location');
      setIsActive(false);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const location: LiveLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        locationName: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        timestamp: BigInt(Date.now() * 1000000), // Convert to nanoseconds
      };

      await updateLocation.mutateAsync(location);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to update location:', err);
      setError(err?.message || 'Failed to update location. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [identity, updateLocation]);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (!identity) {
      setError('You must be signed in to share your location');
      return;
    }

    setError(null);
    setIsActive(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      sendLocationUpdate,
      handleGeolocationError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Set up periodic updates
    intervalIdRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        sendLocationUpdate,
        handleGeolocationError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }, UPDATE_INTERVAL);
  }, [identity, sendLocationUpdate, handleGeolocationError]);

  const stop = useCallback(() => {
    setIsActive(false);
    setError(null);
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  // Cleanup on unmount or auth change
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  // Stop tracking when user logs out
  useEffect(() => {
    if (!identity && isActive) {
      stop();
    }
  }, [identity, isActive, stop]);

  return {
    isActive,
    lastUpdate,
    error,
    start,
    stop,
    isUpdating,
  };
}
