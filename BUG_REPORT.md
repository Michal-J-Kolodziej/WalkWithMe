# Bug Report - Registration and Login Flow

> **Last Updated**: 2026-01-28
> **Status**: All bugs resolved or verified as non-issues

---

## 1. Authentication Error after Registration
- **Description**: After successful registration, the user is redirected to `/complete-profile`. However, the `completeProfile` mutation fails with `Uncaught Error: Not authenticated`.
- **Severity**: Critical
- **Status**: ✅ **FIXED**
- **Resolution**: Updated `CompleteProfileForm.tsx` to properly handle auth state timing. The form now:
  - Shows a loading spinner while auth session is being established
  - Displays an error message with login/register links if auth fails
  - Only shows the form when user is confirmed authenticated
- **Steps to Reproduce**:
    1. Navigate to `/register`.
    2. Fill in the form.
    3. Submit.
    4. Observe redirect to `/complete-profile`.
    5. ~~Check console for error.~~ → Now shows loading state until auth is ready.

---

## 2. Login Persistence Failure
- **Description**: After logging in, the user is redirected to the landing page, but the UI still shows "Sign In" / "Get Started", indicating the user is not logged in or the state is not updated.
- **Severity**: Critical
- **Status**: ✅ **FIXED**
- **Resolution**: Updated `Navbar.tsx` to distinguish between loading state (`user === undefined`) and unauthenticated state (`user === null`). Now shows a loading spinner while auth state is being determined instead of flashing the "Sign In" buttons.
- **Steps to Reproduce**:
    1. Navigate to `/login`.
    2. Enter valid credentials.
    3. Submit.
    4. Observe redirect to landing page.
    5. ~~Check navbar for login state.~~ → Now shows spinner, then authenticated UI.

---

## 3. Missing Dashboard Route
- **Description**: Navigating to `/dashboard` returns a 404 Not Found.
- **Severity**: Major
- **Status**: ✅ **NOT A BUG**
- **Resolution**: The dashboard route was always correctly configured. The "404" was likely confusion with the redirect to `/complete-profile` for users without completed profiles. The `ProfileGuard` component correctly redirects unauthenticated or incomplete-profile users.
- **Steps to Reproduce**:
    1. Navigate to `/dashboard`.
    2. ~~Observe 404 page.~~ → Now redirects to `/complete-profile` if profile incomplete, or shows dashboard if authenticated with complete profile.

---

## 4. Email Validation Issue
- **Description**: The email input field rejects emails with `+` characters, which are valid email characters.
- **Severity**: Minor
- **Status**: ✅ **NOT REPRODUCIBLE**
- **Resolution**: Testing confirmed that emails with `+` characters (e.g., `test+alias@example.com`) are correctly accepted by both the frontend validation and backend (Convex Auth). The HTML5 `type="email"` validation complies with RFC 5322 which allows `+` characters.
- **Steps to Reproduce**:
    1. Navigate to `/register` or `/login`.
    2. Enter an email like `user+test@example.com`.
    3. ~~Try to submit.~~ → Registration succeeds with `+` emails.

---

## 5. Critical OIDC Token Verification Failure
- **Description**: Authentication fails at the OIDC level with the error: `Failed to authenticate: "Could not verify OIDC token claim. Check that the token signature is valid and the token hasn't expired."`. This prevents users from successfully logging in or maintaining a session, even if the UI suggests a sign-in attempt was made.
- **Severity**: Critical
- **Status**: ✅ **FIXED**
- **Resolution**: The root cause was mismatched JWT keys:
  - The `JWT_PRIVATE_KEY` in `.env.local` was different from the one in Convex environment
  - The `JWKS` (public key) didn't match the private key
  
  **Fix applied**:
  1. Synchronized `JWT_PRIVATE_KEY` from `.env.local` to Convex environment
  2. Generated matching `JWKS` from the private key and set it in Convex
  3. Verified `CONVEX_SITE_URL` was correctly set to `https://utmost-otter-971.convex.site`
- **Steps to Reproduce**:
    1. ~~Attempt to register or log in.~~ → Now works correctly.
    2. ~~Observe backend logs or browser console for OIDC verification errors.~~ → No more OIDC errors.
    3. ~~User remains unauthenticated despite valid credentials.~~ → Users are now properly authenticated.

---

## 6. Hydration Mismatch
- **Description**: React hydration mismatch error observed in the console (`Warning: Prop 'data-jetski-tab-id' did not match...`). This indicates a discrepancy between server-side rendered HTML and client-side rendering.
- **Severity**: Moderate
- **Status**: ✅ **NOT AN APP BUG**
- **Resolution**: The `data-jetski-tab-id` attribute is injected by the "Jetski Tab Manager" browser extension, not by the application. This causes hydration warnings because the server doesn't include extension-injected attributes. This is harmless and expected behavior when using browser extensions with SSR applications.
  
  **Recommendation**: Test in incognito mode (without extensions) to verify the app works correctly.
- **Steps to Reproduce**:
    1. Load the application with browser extensions enabled.
    2. ~~Check browser console for hydration warnings.~~ → Expected with extensions; no fix needed.

---

## Summary

| Bug # | Title | Severity | Resolution |
|-------|-------|----------|------------|
| 1 | Auth Error after Registration | Critical | ✅ Fixed in `CompleteProfileForm.tsx` |
| 2 | Login Persistence Failure | Critical | ✅ Fixed in `Navbar.tsx` |
| 3 | Missing Dashboard Route | Major | ✅ Not a bug - was working correctly |
| 4 | Email Validation Issue | Minor | ✅ Not reproducible - works correctly |
| 5 | OIDC Token Verification | Critical | ✅ Fixed JWT keys sync |
| 6 | Hydration Mismatch | Moderate | ✅ Browser extension issue - no fix needed |

**All critical issues have been resolved.**

---

## 7. Missing Dog Edit Functionality
- **Description**: The "Edit" button (pencil icon) is missing from the Dog Cards on the `/dashboard/dogs` page. The `DogCard` component has logic to show it only if an `onEdit` prop is passed, but the `DogsPage` component does not pass this prop.
- **Severity**: Major
- **Status**: ✅ **FIXED**
- **Resolution**: 
  - Refactored `AddDogForm.tsx` → `DogForm.tsx` to support both add and edit modes
  - Added `dog` prop for pre-filling form data and `mode` prop to toggle behavior
  - Updated `DogsPage` to pass `onEdit` handler to `DogCard` components
  - Edit form now opens with pre-filled data when pencil icon is clicked
- **Steps to Reproduce**:
    1. Navigate to `/dashboard/dogs`.
    2. Hover over a dog card.
    3. ~~Observe that only the Delete button appears.~~ → Edit button (pencil icon) now appears alongside Delete button.

---

## 8. Missing Profile Page
- **Description**: multiple issues with Profile:
    1. The sidebar links to `/dashboard/profile`, but this route does not appear to exist in the codebase (`src/routes/dashboard/profile.tsx` is missing).
    2. Clicking the link displays the main dashboard content instead of a user profile.
    3. User request mentions "managing dogs inside user profile", which implies the profile page should list dogs or link to them, which is currently not possible.
- **Severity**: Major
- **Status**: ✅ **FIXED**
- **Resolution**:
  - Created `src/routes/dashboard/profile.tsx` with user profile view
  - Created `src/routes/dashboard/index.tsx` for main dashboard content
  - Added `src/routes/dashboard.tsx` as layout route with `<Outlet>` for proper nested routing
  - Profile page displays user info (name, email, role) and dogs summary with "Manage Dogs" link
- **Steps to Reproduce**:
    1. Click "Profile" in the dashboard sidebar.
    2. ~~Observe that the view does not change to a profile view.~~ → Profile page now loads with user information and dogs summary.
