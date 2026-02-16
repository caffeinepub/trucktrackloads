# Admin Access Documentation

This document describes the frontend implementation of the `/admin` route and its access control flow.

## Overview

The admin dashboard is protected by a multi-stage access gate that ensures only authenticated users with admin privileges can access the dashboard. The gate handles three distinct states: loading, unauthenticated, and authenticated non-admin.

## Key Files

### Route Definition
**Path:** `frontend/src/routeTree.tsx`

Defines all application routes including the `/admin` route. The admin route is wrapped with the `RequireAdmin` component to enforce access control.

### Admin Gate Wrapper
**Path:** `frontend/src/components/auth/RequireAdmin.tsx`

The main access control component that wraps the admin dashboard. It ensures exactly three states are handled:
1. **Loading state**: Shows a loading spinner while verifying authentication and role
2. **Unauthenticated state**: Renders `AdminSignInPrompt` for users who are not logged in
3. **Authenticated non-admin state**: Renders `AccessDeniedScreen` for logged-in users without admin privileges

The component uses the `useAuth` hook to determine the current user's authentication and authorization status, and only renders the admin dashboard when the user is confirmed to be an admin.

### Unauthenticated Prompt
**Path:** `frontend/src/components/auth/AdminSignInPrompt.tsx`

Displayed when an unauthenticated user attempts to access `/admin`. This screen:
- Explains that admin access requires authorized Internet Identity sign-in
- Stores the redirect path (`/admin`) in sessionStorage
- Provides a login button that navigates back to `/admin` after successful authentication
- Includes support contact information (moleleholdings101@gmail.com)

### Access Denied Screen
**Path:** `frontend/src/components/auth/AccessDeniedScreen.tsx`

Displayed when an authenticated user without admin privileges attempts to access `/admin`. This screen:
- Shows a clear message that admin access is restricted
- Explains that only authorized administrators can access this area
- Provides a mailto link to the support email: **moleleholdings101@gmail.com**
- Offers a button to return to the home page

### Admin Dashboard UI
**Path:** `frontend/src/pages/AdminDashboardPage.tsx`

The main admin dashboard interface with tabbed sections for:
- Load management (approve/assign loads, view purchase orders and confirmation documents)
- Transporter list and details
- Contact messages from users
- Ad settings configuration

This component is only rendered after the user has passed all access control checks in `RequireAdmin`.

## Authentication Flow

1. User navigates to `/admin`
2. `RequireAdmin` component checks authentication status via `useAuth` hook
3. If not authenticated → `AdminSignInPrompt` is shown
4. User clicks login → Internet Identity authentication flow
5. After successful login → user is redirected back to `/admin`
6. `RequireAdmin` checks user role
7. If admin → `AdminDashboardPage` is rendered
8. If not admin → `AccessDeniedScreen` is shown

## Support Contact

For access requests or issues, users are directed to contact: **moleleholdings101@gmail.com**

## Related Hooks

- `frontend/src/hooks/useAuth.ts`: Combines Internet Identity state with user profile and role queries
- `frontend/src/hooks/useUserProfile.ts`: React Query hooks for fetching user profiles and roles
- `frontend/src/hooks/useInternetIdentity.ts`: Internet Identity authentication provider (auto-generated)

---

## Developer Docs

### Android Build & Deployment

For instructions on building Android APK/AAB files and publishing to Google Play Store, see:

**[ANDROID_BUILD.md](./ANDROID_BUILD.md)**

This guide covers:
- Prerequisites and setup
- Building debug APK for testing
- Building signed release APK
- Building signed AAB for Play Store
- Versioning and Play Store readiness checklist
