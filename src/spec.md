# Specification

## Summary
**Goal:** Fix the admin login verification crash on `/admin/login` and ensure navigation to `/admin` only happens after a successful, deterministic admin verification result.

**Planned changes:**
- Update the post-login admin verification step to use a React Query flow that returns a clear boolean outcome (no indexing into undefined/void values).
- Ensure successful verification navigates to `/admin`, and unsuccessful/errored verification keeps the user on `/admin/login` with an English error message.
- Update the "Retry Verification" action to use the same corrected verification mechanism and recover without a full page refresh.
- Add defensive checks and diagnostic logging so missing prerequisites (e.g., token/actor/query result unavailable) show a clear English error and never crash the page.

**User-visible outcome:** Admins can log in without seeing the “Cannot read properties of undefined (reading '0')” error; verification either completes and opens `/admin`, or shows a clear English failure message with a working “Retry Verification” option.
