# Specification

## Summary
**Goal:** Add an Admin entry to site navigation, enable working admin login, and ensure admin dashboard actions operate on the correct backend records.

**Planned changes:**
- Add an “Admin” link/button to both desktop navigation and the mobile menu that routes to `/admin/login`.
- Ensure the `/admin/login` form authenticates via the existing backend admin login flow using username `Gushna` and password `Gushgesh#9`, stores the returned admin token in session storage using the existing mechanism, verifies admin status, then navigates to `/admin` on success.
- Keep `/admin` access-controlled: redirect unauthenticated/failed-verification users to `/admin/login`, and support sign-out that clears the admin session and returns to `/admin/login`.
- Fix admin dashboard actions so approve/reject/verify buttons target the correct underlying records (no placeholder/index IDs or incorrect identifiers).
- Extend backend admin queries to return required identifiers (loadId for loads, Principal for clients/transporters) and update frontend React Query hooks/UI to consume them, with proper query invalidation/refetch after mutations.

**User-visible outcome:** Users can access an Admin login from the main menu, sign in successfully to reach `/admin`, and use the admin dashboard tabs to approve/reject loads and verify/reject clients and transporters with actions applying to the correct records and updating the UI accordingly.
