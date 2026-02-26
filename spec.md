# Specification

## Summary
**Goal:** Provide an in-app, admin-only “Control Center” that centralizes all existing admin-controlled functions and key app settings (including Android APK link and bottom ad configuration), without relying on navigating to `/admin`.

**Planned changes:**
- Add a new in-app navigation entry (“Control Center” or “Settings”) that routes to a dedicated Control Center screen.
- Implement admin protection for the Control Center route (non-admin users see an Access Denied state or are redirected).
- Build a responsive (mobile-friendly) Control Center layout that exposes all currently implemented admin operations by reusing existing admin components/pages where possible:
  - Clients management
  - Transporters management
  - Pending/approved loads review and approve/reject/update actions
  - Transporter assignment workflow (assign/unassign)
  - Contracts management
  - Prices management
  - Contact messages review/deletion
  - Years management
- Ensure TanStack Router supports direct navigation to the Control Center URL and that it loads reliably independent of `/admin`.
- Audit and implement any missing backend Motoko actor methods in `backend/main.mo` required by existing admin UI hooks/components so all Control Center actions work end-to-end with permission checks enforced.
- Add an “App Configuration” section inside Control Center:
  - View/update Android APK download link via existing backend setting (`getAndroidApkLink` / `setAndroidApkLink`)
  - Replace bottom ad configuration from localStorage-only to a persisted, reloadable single source of truth (enable/disable + snippet content) and ensure `BottomAd` reflects saved settings after refresh/next app open.

**User-visible outcome:** Admin users can open a Control Center from within the app to manage all existing admin functions and update key app settings; non-admin users cannot access the controls and will see an explicit access-denied state.
