/**
 * Download configuration for Android APK fallback URL
 * 
 * This module provides a fallback APK download URL when the backend
 * setting is not configured. Set VITE_FALLBACK_ANDROID_APK_URL in
 * your environment to provide a default download link.
 */

/**
 * Get the fallback Android APK URL from environment variables
 * @returns The fallback URL or null if not configured
 */
export function getFallbackApkUrl(): string | null {
  const url = import.meta.env.VITE_FALLBACK_ANDROID_APK_URL;
  
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}
