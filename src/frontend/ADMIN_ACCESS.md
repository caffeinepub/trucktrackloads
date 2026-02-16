# Admin Access Control

This document describes how admin access works in the TruckTrackAfrica application.

## Overview

Admin access is granted exclusively through credential-based login. The admin dashboard is protected and only accessible to users who have successfully authenticated using the admin username and password.

## Admin Login Flow

### 1. Credential-Based Login

Admins must use the dedicated admin login page at `/admin/login` to access the dashboard:

1. Navigate to `/admin/login`
2. Enter the admin username and password
3. Upon successful authentication, a session token is stored in `sessionStorage` under the key `caffeineAdminToken`
4. The application automatically redirects to `/admin` where the dashboard is rendered

### 2. Session Management

- The admin session token is stored in `sessionStorage` (key: `caffeineAdminToken`)
- The token persists for the duration of the browser session
- Closing the browser tab/window will clear the session
- The token is automatically included in all backend calls to verify admin privileges

### 3. Access Verification

When accessing admin routes:

1. The app checks for the presence of `caffeineAdminToken` in `sessionStorage`
2. If no token exists, the user is redirected to `/admin/login`
3. If a token exists, the backend verifies admin privileges via `isCallerAdmin()`
4. Only users with valid admin credentials can access the dashboard

## Admin Credentials

Admin credentials are configured in the backend (`backend/main.mo`):

