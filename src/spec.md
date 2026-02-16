# Specification

## Summary
**Goal:** Expand coverage messaging to include the DRC, enhance admin visibility/export of registered clients and transporters (including contract details), add an admin-configurable APK download link, and standardize load weights to tons.

**Planned changes:**
- Add “Democratic Republic of Congo” to all public-facing coverage area/country lists (About, Services, Footer) without changing existing layout or removing/renaming other countries.
- Extend Client and Transporter profiles to store “Contract Details” captured during registration, and add admin-only backend queries to return spreadsheet-ready listings of all clients and all transporters including contract details.
- Update Client Registration and Transporter Registration forms to include a multi-line “Contract Details” field, persist it, and show previously saved values when revisiting.
- Update Admin Dashboard to show spreadsheet-style tables for Clients and Transporters (including Contract Details), with loading/empty states and CSV export for each table.
- Add backend storage and admin-only get/set methods for an Android APK download URL, and add an Admin Dashboard section to view and update the clickable APK download link.
- Update Load Board and Admin Dashboard weight labels/placeholder text and displayed units to tons/tonnage (instead of kg) while keeping numeric/positive validation.

**User-visible outcome:** Public pages list the DRC in coverage areas; registrants can enter contract details; admins can view/export client and transporter lists (with contract details), set and access an APK download link from the admin dashboard, and users/admins see load weights in tons across the app.
