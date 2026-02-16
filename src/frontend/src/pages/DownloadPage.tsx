import { useGetAndroidApkLink } from '@/hooks/useQueries';
import { Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getFallbackApkUrl } from '@/config/download';

export default function DownloadPage() {
  const { data: backendApkLink, isLoading } = useGetAndroidApkLink();
  
  // Compute effective APK URL: backend first, then fallback
  const effectiveApkUrl = backendApkLink || getFallbackApkUrl();

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Download TruckTrack Africa</h1>
          <p className="text-lg text-muted-foreground">
            Get the Android app to access TruckTrack Africa on your mobile device
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Android App
            </CardTitle>
            <CardDescription>
              Download the latest version of our Android application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : effectiveApkUrl ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Click the button below to download the Android APK file. You may need to enable installation from unknown sources in your device settings.
                  </AlertDescription>
                </Alert>
                <Button asChild size="lg" className="w-full">
                  <a
                    href={effectiveApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download APK
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  The download link is not currently available. Please check back later or contact support for assistance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Need help installing the app? Contact us at{' '}
            <a href="mailto:moleleholdings101@gmail.com" className="text-primary hover:underline">
              moleleholdings101@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
