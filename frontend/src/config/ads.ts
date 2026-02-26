// Ad configuration for TruckTrackLoads
export const AD_CONFIG = {
  admob: {
    appId: 'ca-app-pub-1142092266888748~1123479863',
    bottomAdUnitId: 'ca-app-pub-1142092266888748/3770766456',
  },
  defaultBottomAdSnippet: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-app-pub-1142092266888748" crossorigin="anonymous"></script>
    </head>
    <body style="margin:0;padding:8px;background:#f9fafb;">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-app-pub-1142092266888748"
           data-ad-slot="3770766456"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </body>
    </html>
  `.trim(),
};

export interface AdSettings {
  enabled: boolean;
  snippet: string;
}

const STORAGE_KEY = 'trucktrack_bottom_ad_settings';

export function getAdSettings(): AdSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load ad settings:', e);
  }
  return {
    enabled: false,
    snippet: AD_CONFIG.defaultBottomAdSnippet,
  };
}

export function saveAdSettings(settings: AdSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save ad settings:', e);
  }
}
