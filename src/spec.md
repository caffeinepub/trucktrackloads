# Specification

## Summary
**Goal:** Enable admins to edit additional load fields, add admin-managed year lists, and associate contracts with years, while updating the admin dashboard to use stable approved-load IDs and applying a cohesive non-blue/purple visual theme to the touched UI.

**Planned changes:**
- Extend the backend `Load` model and related APIs so admins can persist and retrieve edits to: price, client, assigned transporter, and status.
- Add a backend admin query that returns approved loads alongside their real load IDs (e.g., tuples) for reliable frontend operations.
- Implement backend Years management (persistent list) with APIs to list years and admin-only add/remove year.
- Amend the backend Contracts model and APIs to include a required year field (sourced from the managed year list) and return it in contract queries.
- Update Admin Load Details dialog to make exactly these fields editable: price, client, transporter, status; keep other load fields view-only; save via updated mutations as needed.
- Update Admin Dashboard approved loads tab to use the new “approved loads with IDs” backend API so update/delete/assign actions target the correct load.
- Add an Admin Dashboard section/tab for Years management (view/add/remove) with immediate UI refresh.
- Update Contracts page to require selecting a year when posting (from backend years), display year when browsing, and show a clear message/disable posting when no years exist.
- Add any necessary canister-state migration so existing stored loads/contracts remain readable and upgrades do not trap.
- Apply a cohesive Tailwind/Shadcn-compatible theme to the modified/new admin and contracts UI, avoiding blue/purple as the primary palette.

**User-visible outcome:** Admins can reliably open approved loads by real ID and edit price/client/transporter/status; admins can manage an official year list; users posting and viewing contracts can select and see a contract’s year; the updated areas share a consistent non-blue/purple visual theme.
