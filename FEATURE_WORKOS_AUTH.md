# Feature: WorkOS AuthKit Integration

## Description

Replace the current `@convex-dev/auth` Password-based authentication with WorkOS AuthKit. This migration provides enterprise-grade authentication with support for Google, Microsoft, Apple, and GitHub OAuth providers through WorkOS's hosted AuthKit UI.

## Progress: 0%

## Tasks Status

| Category      | Total  | Completed | In Progress |
| ------------- | ------ | --------- | ----------- |
| Backend       | 4      | 0         | 0           |
| Frontend      | 6      | 0         | 0           |
| Configuration | 3      | 0         | 0           |
| **Total**     | **13** | **0**     | **0**       |

## Current Authentication Stack (To Be Replaced)

- **Package**: `@convex-dev/auth` with `Password` provider
- **Frontend Provider**: `ConvexAuthProvider`
- **Auth Actions**: `useAuthActions()` hook for `signIn`, `signOut`
- **Auth State**: `useConvexAuth()` for `isAuthenticated`, `isLoading`
- **User Data**: `getAuthUserId()` in Convex functions

## New Authentication Stack (WorkOS AuthKit)

- **Packages**: `@workos-inc/authkit-react`, `@convex-dev/workos`
- **Frontend Providers**: `AuthKitProvider` + `ConvexProviderWithAuthKit`
- **Auth Actions**: `useAuth()` hook from `@workos-inc/authkit-react`
- **Auth State**: Continue using `useConvexAuth()` (unchanged)
- **User Data**: `ctx.auth.getUserIdentity()` in Convex functions

## Implementation Plan

### Phase 1: Backend Configuration

1. **Update `convex/auth.config.ts`**: Configure WorkOS JWT validation
2. **Update environment variables**: Add WorkOS credentials to Convex
3. **Modify `convex/http.ts`**: Remove old auth HTTP routes
4. **Update user queries**: Adapt `getAuthUserId` → `ctx.auth.getUserIdentity()`

### Phase 2: Frontend Configuration

1. **Install new packages**: `@workos-inc/authkit-react`, `@convex-dev/workos`
2. **Remove old packages**: `@convex-dev/auth`, `@auth/core`
3. **Update Convex provider**: Replace `ConvexAuthProvider` with `AuthKitProvider` + `ConvexProviderWithAuthKit`
4. **Update auth components**: Replace custom login/register forms with AuthKit `signIn()`/`signOut()`
5. **Update Navbar**: Use `useAuth()` from AuthKit for user info

### Phase 3: Route Cleanup

1. **Remove `/login` route**: AuthKit handles login UI
2. **Remove `/register` route**: AuthKit handles registration UI
3. **Remove `/forgot-password` route**: AuthKit handles password reset
4. **Add `/callback` route**: Handle OAuth callback from WorkOS

### Phase 4: User Data Migration (Optional Future)

- Consider using `@convex-dev/workos-authkit` component for webhook-based user syncing
- Map WorkOS user fields to existing Convex user schema

## Environment Variables Required

```env
# Local (.env.local)
VITE_WORKOS_CLIENT_ID=<your-workos-client-id>
VITE_WORKOS_REDIRECT_URI=http://localhost:3000/callback

# Convex Dashboard
WORKOS_CLIENT_ID=<your-workos-client-id>
WORKOS_API_KEY=<your-workos-api-key>
```

## WorkOS Dashboard Configuration Required

1. **Redirect URI**: `http://localhost:3000/callback`
2. **CORS**: Add `http://localhost:3000`
3. **Auth Methods**: Enable Google, Microsoft, Apple, GitHub
4. **Sign-out Redirect**: `http://localhost:3000`

## Key Files to Modify

| File                                    | Action | Description         |
| --------------------------------------- | ------ | ------------------- |
| `convex/auth.config.ts`                 | MODIFY | WorkOS JWT config   |
| `convex/auth.ts`                        | DELETE | No longer needed    |
| `convex/http.ts`                        | MODIFY | Remove auth routes  |
| `convex/users.ts`                       | MODIFY | Update auth helpers |
| `src/integrations/convex/provider.tsx`  | MODIFY | New providers       |
| `src/components/LoginForm.tsx`          | DELETE | Using AuthKit UI    |
| `src/components/RegisterForm.tsx`       | DELETE | Using AuthKit UI    |
| `src/components/ForgotPasswordForm.tsx` | DELETE | Using AuthKit UI    |
| `src/components/Navbar.tsx`             | MODIFY | Update auth hooks   |
| `src/routes/login.tsx`                  | DELETE | Not needed          |
| `src/routes/register.tsx`               | DELETE | Not needed          |
| `src/routes/forgot-password.tsx`        | DELETE | Not needed          |
| `src/routes/callback.tsx`               | NEW    | OAuth callback      |
| `.env.local`                            | MODIFY | Add WorkOS vars     |
| `package.json`                          | MODIFY | Update dependencies |

## Verification Plan

1. [ ] Test OAuth login with Google
2. [ ] Test OAuth login with GitHub
3. [ ] Verify user session persists across page refresh
4. [ ] Verify sign-out works correctly
5. [ ] Verify protected routes redirect to login
6. [ ] Test callback route handling
