import { useEffect, useState } from 'react';
import { getAdSettings, type AdSettings } from '@/config/ads';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdSnippetPreviewFrame from './AdSnippetPreviewFrame';

const SESSION_STORAGE_KEY = 'trucktrack_ad_dismissed';

export default function BottomAd() {
  const [settings, setSettings] = useState<AdSettings>({ enabled: false, snippet: '' });
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if ad was dismissed in this session
    const dismissed = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    setIsDismissed(dismissed);

    const loadSettings = () => {
      setSettings(getAdSettings());
    };

    loadSettings();

    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'trucktrack_bottom_ad_settings') {
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-window updates
    const handleCustomUpdate = () => {
      loadSettings();
    };
    window.addEventListener('ad-settings-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ad-settings-updated', handleCustomUpdate);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
  };

  // Don't render if disabled or dismissed
  if (!settings.enabled || isDismissed) {
    return null;
  }

  const isEmpty = !settings.snippet || settings.snippet.trim().length === 0;

  return (
    <div className="border-t bg-muted/20">
      <div className="container py-3 sm:py-4">
        <div className="max-w-4xl mx-auto relative">
          {/* Advertisement label */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Advertisement
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2"
              onClick={handleDismiss}
              aria-label="Close advertisement"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Ad iframe with diagnostics */}
          <div className="relative w-full overflow-hidden rounded-md border bg-background">
            {isEmpty ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <p>Ad configuration is empty. Please configure in Admin Dashboard.</p>
              </div>
            ) : (
              <AdSnippetPreviewFrame
                snippet={settings.snippet}
                style={{ 
                  minHeight: '90px',
                  height: '120px',
                  maxHeight: '200px'
                }}
                showDiagnostics={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
