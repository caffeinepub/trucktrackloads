import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetLocationEvidence } from '@/hooks/useQueries';
import { Loader2, MapPin, Clock, Download, Eye, AlertCircle } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface LocationEvidenceViewerProps {
  transporterId: Principal;
  transporterName: string;
}

export default function LocationEvidenceViewer({ transporterId, transporterName }: LocationEvidenceViewerProps) {
  const { data: evidence = [], isLoading, error } = useGetLocationEvidence(transporterId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatTimestamp = (timestamp: bigint): string => {
    try {
      const ms = Number(timestamp) / 1000000;
      const date = new Date(ms);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-700" />
        <AlertDescription className="text-red-700">
          Failed to load location evidence. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (evidence.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No location evidence has been submitted by this transporter yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Location Evidence</CardTitle>
          <CardDescription>
            Evidence submitted by {transporterName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evidence.map((item, index) => (
              <Card key={index} className="shadow-xs">
                <CardContent className="py-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Evidence #{index + 1}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(item.uploadedAt)}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">
                          {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
                        </p>
                        {item.location.locationName && (
                          <p className="text-muted-foreground">{item.location.locationName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedImage(item.screenshot.getDirectURL())}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Screenshot
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = item.screenshot.getDirectURL();
                          window.open(url, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Location Screenshot</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="mt-4">
              <img
                src={selectedImage}
                alt="Location evidence"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
