import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAndroidApkLink, useSetAndroidApkLink } from '@/hooks/useQueries';
import { getAdSettings, saveAdSettings, type AdSettings } from '@/config/ads';
import AdSnippetPreviewFrame from '@/components/ads/AdSnippetPreviewFrame';

export default function AppConfigurationSection() {
  const { data: apkLink, isLoading: apkLinkLoading } = useGetAndroidApkLink();
  const setApkLinkMutation = useSetAndroidApkLink();

  const [apkLinkValue, setApkLinkValue] = useState('');
  const [adSettings, setAdSettings] = useState<AdSettings>({ enabled: false, snippet: '' });

  useEffect(() => {
    if (apkLink) {
      setApkLinkValue(apkLink);
    }
  }, [apkLink]);

  useEffect(() => {
    const settings = getAdSettings();
    setAdSettings(settings);
  }, []);

  const handleSaveApkLink = async () => {
    try {
      await setApkLinkMutation.mutateAsync(apkLinkValue);
      toast.success('Android APK link updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update APK link');
    }
  };

  const handleSaveAdSettings = () => {
    try {
      saveAdSettings(adSettings);
      // Dispatch custom event for same-window updates
      window.dispatchEvent(new Event('ad-settings-updated'));
      toast.success('Ad settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save ad settings');
    }
  };

  return (
    <div className="space-y-8">
      {/* Android APK Link */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Android APK Download Link</h3>
          <p className="text-sm text-muted-foreground">
            Configure the download link for the Android application
          </p>
        </div>
        
        {apkLinkLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="apk-link">APK Download URL</Label>
              <Input
                id="apk-link"
                type="url"
                placeholder="https://example.com/app.apk"
                value={apkLinkValue}
                onChange={(e) => setApkLinkValue(e.target.value)}
              />
            </div>
            
            {apkLinkValue && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <a 
                  href={apkLinkValue} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary underline"
                >
                  Test link
                </a>
              </div>
            )}
            
            <Button
              onClick={handleSaveApkLink}
              disabled={setApkLinkMutation.isPending || !apkLinkValue.trim()}
            >
              {setApkLinkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save APK Link
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Bottom Ad Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Bottom Advertisement</h3>
          <p className="text-sm text-muted-foreground">
            Configure the advertisement displayed at the bottom of pages
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ad-enabled">Enable Bottom Ad</Label>
              <p className="text-sm text-muted-foreground">
                Show advertisement at the bottom of pages
              </p>
            </div>
            <Switch
              id="ad-enabled"
              checked={adSettings.enabled}
              onCheckedChange={(checked) => 
                setAdSettings({ ...adSettings, enabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad-snippet">Ad Snippet (HTML)</Label>
            <Textarea
              id="ad-snippet"
              placeholder="Paste your ad HTML snippet here..."
              value={adSettings.snippet}
              onChange={(e) => 
                setAdSettings({ ...adSettings, snippet: e.target.value })
              }
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Paste the complete HTML snippet provided by your ad network (e.g., Google AdSense, AdMob)
            </p>
          </div>

          {adSettings.snippet && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-md overflow-hidden bg-muted/20">
                <AdSnippetPreviewFrame
                  snippet={adSettings.snippet}
                  style={{ 
                    minHeight: '90px',
                    height: '120px',
                    maxHeight: '200px'
                  }}
                  showDiagnostics={true}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSaveAdSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Ad Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
