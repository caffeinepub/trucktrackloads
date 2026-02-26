// Admin bootstrap configuration
// This module provides the build-time requesting user Principal for one-time admin bootstrap

export function getBootstrapPrincipal(): string | null {
  // In a production environment, this would be set via Vite env variable
  // For now, return null to indicate no bootstrap principal is configured
  // To enable bootstrap for a specific principal, set VITE_BOOTSTRAP_PRINCIPAL env var
  const envPrincipal = import.meta.env.VITE_BOOTSTRAP_PRINCIPAL;
  
  // Normalize: trim whitespace and handle empty strings
  if (!envPrincipal || typeof envPrincipal !== 'string') {
    return null;
  }
  
  const trimmed = envPrincipal.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isBootstrapPrincipal(currentPrincipal: string | null): boolean {
  if (!currentPrincipal) return false;
  const bootstrapPrincipal = getBootstrapPrincipal();
  if (!bootstrapPrincipal) return false;
  
  // Normalize both for comparison
  return currentPrincipal.trim() === bootstrapPrincipal.trim();
}
