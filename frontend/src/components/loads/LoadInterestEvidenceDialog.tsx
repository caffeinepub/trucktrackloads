import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, MapPin, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useAddLocationEvidence } from '@/hooks/useQueries';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';

interface LoadInterestEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadDescription: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function LoadInterestEvidenceDialog({
  open,
  onOpenChange,
  loadDescription,
}: LoadInterestEvidenceDialogProps) {
  const [screenshot, setScreenshot] = useState<ExternalBlob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const addEvidence = useAddLocationEvidence();

  const handleCaptureLocation = () => {
    setLocationError(null);
    setLocationCaptured(false);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationCaptured(true);
        toast.success('Location captured successfully');
      },
      (error) => {
        let errorMessage = 'Unable to access location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Please upload a valid image file (JPG, JPEG, or PNG)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size must be less than 10MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      setScreenshot(blob);
      toast.success('Screenshot uploaded successfully');
    } catch (error) {
      setFileError('Failed to upload screenshot. Please try again.');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      toast.error('Please upload a location screenshot');
      return;
    }

    if (!currentLocation) {
      toast.error('Please capture your current location');
      return;
    }

    try {
      await addEvidence.mutateAsync({
        location: {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          locationName: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
          timestamp: BigInt(Date.now() * 1000000),
        },
        screenshot,
      });

      toast.success('Interest registered successfully! Admin will review your evidence.');
      onOpenChange(false);
      
      // Reset form
      setScreenshot(null);
      setCurrentLocation(null);
      setLocationCaptured(false);
      setUploadProgress(0);
      setLocationError(null);
      setFileError(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit evidence. Please try again.');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Express Interest in Load</DialogTitle>
          <DialogDescription>
            {loadDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Location</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCaptureLocation}
              disabled={locationCaptured}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {locationCaptured ? 'Location Captured' : 'Capture Current Location'}
            </Button>
            
            {locationCaptured && currentLocation && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-700" />
                <AlertDescription className="text-green-700 text-sm">
                  Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </AlertDescription>
              </Alert>
            )}

            {locationError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <AlertDescription className="text-red-700 text-sm">
                  {locationError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Location Screenshot *</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              Upload a screenshot showing your current location (JPG, JPEG, or PNG, max 10MB)
            </p>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} className="h-1" />
            )}

            {screenshot && uploadProgress === 100 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-700" />
                <AlertDescription className="text-green-700 text-sm">
                  Screenshot uploaded successfully
                </AlertDescription>
              </Alert>
            )}

            {fileError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <AlertDescription className="text-red-700 text-sm">
                  {fileError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!screenshot || !currentLocation || addEvidence.isPending}
          >
            {addEvidence.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Submit Interest
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
