# Specification

## Summary
**Goal:** Make credential-based (password token) admin login reliably open the admin dashboard without redirect loops, and ensure routing works consistently in production.

**Planned changes:**
- Initialize the admin session from `sessionStorage.caffeineAdminToken` even when the user is not authenticated with Internet Identity by creating an actor and calling backend `_initializeAccessControlWithSecret` with the stored token.
- Make actor creation and admin verification queries reactive to `caffeineAdminToken` changes by incorporating the current token into the actor/query key so admin checks re-run after login/logout without a page refresh.
- Fix the admin route guard to avoid navigation during render and only redirect to `/admin/login` after token/auth state has been evaluated, preventing blank screens and redirect loops.
- Align routing configuration to consistently use hash-based routing so navigation to `/admin` works after login and when directly opening the admin URL in deployed builds.

**User-visible outcome:** Visiting `/admin` opens the Admin Dashboard when a valid `caffeineAdminToken` exists (or shows a clear verification error), redirects to `/admin/login` when no token is present, and post-login navigation reliably loads the dashboard in production without requiring a refresh.
