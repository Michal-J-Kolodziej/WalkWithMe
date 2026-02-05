# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run test         # Run tests (vitest run)
npm run lint         # ESLint
npm run check        # Prettier --write + ESLint --fix
npx convex dev       # Start Convex backend (needed alongside dev server)
npx shadcn@latest add <component>  # Add new shadcn/ui component
```

## Architecture

**WalkWithMe** is a social app for dog walkers. Full-stack TypeScript using TanStack Start (React 19 meta-framework) with a Convex serverless backend.

### Frontend Stack
- **TanStack Start** with file-based routing (`src/routes/`), TanStack Query for data fetching, TanStack Store for client state
- **Convex client** provides real-time subscriptions — `useQuery(api.module.fn)` auto-updates when backend data changes, `useMutation(api.module.fn)` for writes
- **Tailwind CSS 4** with **shadcn/ui** (new-york style, zinc base color, lucide icons). Dark-mode glassmorphism theme throughout
- **i18next** for internationalization (English `src/locales/en.json`, Polish `src/locales/pl.json`)
- **Leaflet** for maps (spots map, meeting location picker)
- Path alias: `@/` maps to `src/`

### Backend (Convex)
All server logic lives in `convex/`. Functions are queries (real-time, read-only) or mutations (writes). Auth uses `@convex-dev/auth` with email/password. Every authenticated function calls `getAuthUserId(ctx)` to get the current user.

Key modules: `users.ts`, `dogs.ts`, `friendRequests.ts`, `friendships.ts`, `meetings.ts`, `meetingInvitations.ts`, `conversations.ts`, `messages.ts`, `beacon.ts`, `spots.ts`, `reviews.ts`

Schema is in `convex/schema.ts`. Convention: friendship/conversation pairs normalize IDs so `user1Id < user2Id` to prevent duplicates.

### Provider Hierarchy
`__root.tsx` → `ConvexProvider` (wraps ConvexAuthProvider + QueryClient) → `ProfileGuard` (redirects incomplete profiles to `/complete-profile`) → route content

### Route Structure
- `/` — Landing page
- `/login`, `/register`, `/forgot-password` — Auth pages
- `/complete-profile` — Mandatory after first login
- `/dashboard/*` — All authenticated features (dogs, friends, discover, meetings, chat, map, settings, profile)
- Chat uses dynamic route: `/dashboard/chat/$conversationId`
- Meetings use: `/dashboard/meetings/$meetingId`

### Key Patterns
- **ProfileGuard** (`src/components/ProfileGuard.tsx`) — wraps all routes, enforces profile completion before accessing dashboard
- **Location tracking** — `useLocationTracker` hook throttles geolocation updates to Convex (60s intervals)
- **Beacon ("Walking Now")** — toggle on user record with privacy levels (friends/public/none), auto-expires via heartbeat
- **Haversine distance** — `src/lib/geo.ts` calculates distance between users for discovery/nearby features
- Forms use **react-hook-form** + **zod** for validation

## Convex Conventions

From `.cursorrules`: Convex documents have automatic `_id` and `_creationTime` system fields — don't define them in schema. Use `v` validators from `convex/values`. Index on fields you query by. Generated types/API live in `convex/_generated/` (never edit).

## Code Style

- **Prettier**: no semicolons, single quotes, trailing commas
- **ESLint**: TanStack config (`@tanstack/eslint-config`)
- **TypeScript**: strict mode, no unused locals/parameters
