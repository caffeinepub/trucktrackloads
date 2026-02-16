# Specification

## Summary
**Goal:** Fix the password-based admin login/session flow so authenticated admins can reliably access and stay on the `/admin` dashboard after logging in, without redirect loops or timing issues.

**Planned changes:**
- Update `/admin/login` handling to store the admin token, then explicitly refetch/verify admin authorization before navigating to `/admin` (no fixed delays).
- Adjust `/admin` route guarding to rely on clear state transitions (token present + verification result) so it does not redirect back to `/admin/login` after a successful password-admin login.
- Ensure admin verification uses an actor initialized with `_initializeAccessControlWithSecret(token)` whenever `sessionStorage.caffeineAdminToken` is present, even when the user is anonymous (not logged in via Internet Identity), without editing immutable hook paths.
- Add a clear English error state when post-login admin verification fails, including a working Retry action that re-attempts verification.
- Verify and, if needed, fix backend admin verification so `adminLogin` tokens correctly cause `isCallerAdmin()` to return `true` after `_initializeAccessControlWithSecret(token)`, while keeping admin-only methods protected without valid verification.

**User-visible outcome:** After entering correct admin credentials on `/admin/login`, the user is taken to `/admin` and the dashboard renders reliably; refreshing `/admin` stays authorized for the browser session, and logging out/clearing the token redirects back to `/admin/login` without infinite loops.
