# Specification

## Summary
**Goal:** Ensure the `/admin` route always renders a visible admin access gate (loading, sign-in prompt, access denied, dashboard, or error) and that all navigation paths to Admin work reliably with hash-based routing.

**Planned changes:**
- Fix the `/admin` route rendering so it never shows a blank/non-rendering screen and consistently displays the correct gate UI state based on auth/admin role.
- Add route-level error handling for the admin page so any runtime error during access checks or dashboard rendering shows a clear English error state with a retry action.
- Verify and adjust Admin navigation entry points (header Admin link, footer Admin quick link, direct `/#/admin` URL) to consistently navigate and load the admin gate UI under hash routing.

**User-visible outcome:** Visiting `/#/admin` (or clicking Admin links) reliably shows the appropriate admin gate screen (sign-in prompt, access denied, dashboard, or a recoverable error with retry) instead of a blank page.
