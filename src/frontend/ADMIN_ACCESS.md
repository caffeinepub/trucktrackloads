# Admin Access Documentation

## Overview
This application uses a password-based admin authentication system. Admin access is completely independent from Internet Identity and requires specific credentials.

## Admin Login Flow

### 1. Login Process
- Navigate to `/admin/login`
- Enter admin username and password
- On successful authentication, the backend returns a session token
- The token is stored in `sessionStorage` under the key `caffeineAdminToken`

### 2. Deterministic Post-Login Sequence
After successful login, the system performs the following steps in order:

1. **Store Token**: Save the admin token to `sessionStorage` and broadcast a change event
2. **Invalidate Actor**: Force the actor to be recreated with the new token
3. **Refetch Actor**: Wait for the actor to be fully initialized with the token
4. **Initialize Access Control**: The actor automatically calls `_initializeAccessControlWithSecret(token)` when the token is present
5. **Verify Admin Status**: Call `isCallerAdmin()` to verify admin access
6. **Navigate**: Only navigate to `/admin` when verification returns `true`

### 3. Token Management
- **Storage**: `sessionStorage.getItem('caffeineAdminToken')`
- **Setting**: `setAdminToken(token)` - stores and broadcasts change event
- **Clearing**: `clearAdminToken()` - removes and broadcasts change event
- **Event**: `admin-token-changed` - window event for reactive updates

### 4. Admin Route Protection
The `/admin` route is protected by `RequireAdmin` component which:
- Checks for the presence of `caffeineAdminToken` in sessionStorage
- Redirects to `/admin/login` if no token exists
- Shows loading state while verifying admin access
- Shows error state with retry option if verification fails
- Only renders admin content when `isCallerAdmin()` returns `true`

### 5. Error Handling
- **Login Errors**: Display actionable English error messages on the login page
- **Verification Errors**: Show retry option without requiring re-login
- **Network Errors**: Display recoverable error UI with retry functionality
- **No Redirect Loops**: The system stays on `/admin/login` when verification fails

## Anonymous User Support
The password-admin system works independently of Internet Identity:
- Users do NOT need to log in with Internet Identity to access admin features
- Admin token initialization happens for anonymous callers
- The backend treats the session as admin after `_initializeAccessControlWithSecret(token)` is called

## Backend Integration
The backend provides:
- `adminLogin(username, password)`: Returns session token on success, traps on failure
- `isCallerAdmin()`: Returns `true` if the caller has admin access
- `_initializeAccessControlWithSecret(token)`: Initializes access control with the admin token

## Security Notes
- Admin credentials are hardcoded in the backend: username "Gushna", password "Gushgesh#9"
- The session token is stored in `sessionStorage` (cleared on tab close)
- Admin access is session-based and does not persist across browser restarts
- Internet Identity login does NOT grant admin access
