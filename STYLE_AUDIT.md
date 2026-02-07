# Style Audit Report

**Date:** 2026-02-07
**Scope:** Full audit — all categories

## Category: Colors (Hard-coded bypassing semantic tokens)

### Deviations Found

| File                 | Line | Current Value                               | Canonical Value                              | Severity |
| -------------------- | ---- | ------------------------------------------- | -------------------------------------------- | -------- |
| BeaconMarker.tsx     | 64   | `text-gray-900`                             | `text-foreground`                            | critical |
| BeaconMarker.tsx     | 69   | `text-gray-500`                             | `text-muted-foreground`                      | critical |
| SpotsMap.tsx         | 170  | `bg-white hover:bg-gray-50 border-gray-200` | `bg-background hover:bg-muted border-border` | critical |
| SpotsMap.tsx         | 174  | `text-gray-700`                             | `text-foreground`                            | critical |
| DashboardWidgets.tsx | 57   | `text-red-500` (negative trend)             | `text-destructive`                           | critical |
| DashboardWidgets.tsx | 76   | `bg-gray-400` (offline status)              | `bg-muted-foreground`                        | major    |

### Intentional (Status colors — no semantic tokens exist)

- `text-green-600`, `bg-green-500` — success/active states (settings, beacon, walk)
- `text-blue-500`, `bg-blue-500/10` — informational icons (settings, weather, location)
- `text-amber-500`, `bg-amber-500/10` — warning/pending states
- `text-orange-600` — beacon/walk accent (brand-adjacent)
- `bg-green-500/10`, `border-green-500/20` — status alert in settings
- Map floating buttons (`from-orange-500 to-amber-500`) — intentional brand accent
- `demo/` and `lib/demo-*` files — demo pages, out of scope

## Category: Hover Scale

### Deviations Found

| File                  | Line | Current Value        | Canonical Value          | Severity    |
| --------------------- | ---- | -------------------- | ------------------------ | ----------- |
| SentRequestCard.tsx   | 49   | `hover:scale-[1.01]` | `hover:scale-[1.02]`     | minor       |
| FriendRequestCard.tsx | 50   | `hover:scale-[1.01]` | `hover:scale-[1.02]`     | minor       |
| SpotsMap.tsx          | 170  | `hover:scale-110`    | intentional (FAB button) | intentional |
| SpotsMap.tsx          | 189  | `hover:scale-110`    | intentional (FAB button) | intentional |

### Intentional

- Auth form buttons: `hover:scale-[1.02] active:scale-[0.98]` — correct
- Dashboard cards: `hover:scale-[1.02]` — correct
- Map FABs: `hover:scale-110` — intentionally larger for touch targets

## Category: Modal Backdrop

### Deviations Found

| File                   | Line | Current Value | Canonical Value | Severity |
| ---------------------- | ---- | ------------- | --------------- | -------- |
| CreateMeetingModal.tsx | 93   | `bg-black/50` | `bg-black/40`   | major    |
| InviteFriendsModal.tsx | 58   | `bg-black/50` | `bg-black/40`   | major    |

### Correct (bg-black/40)

- RejectRequestModal.tsx:62 — `bg-black/40` ✓
- DogForm.tsx:145 — `bg-black/40` ✓
- SendRequestModal.tsx:68 — `bg-black/40` ✓

## Category: Arbitrary Border Radius

### Deviations Found

| File                    | Line | Current Value      | Canonical Value | Severity |
| ----------------------- | ---- | ------------------ | --------------- | -------- |
| CompleteProfileForm.tsx | 113  | `rounded-[2.5rem]` | `rounded-2xl`   | major    |
| DogForm.tsx             | 150  | `rounded-[2rem]`   | `rounded-2xl`   | major    |

## Category: Inline Backdrop-blur (Should use CSS classes)

### Deviations Found

Most backdrop-blur usages are appropriate (modal backdrops, tooltips, map elements). The following could use CSS classes but are context-specific enough to be intentional:

- Auth forms (RegisterForm, LoginForm, ForgotPasswordForm) — `backdrop-blur-sm` on card — minor inline glass
- WeatherWidget — `bg-white/10 backdrop-blur-md` — custom dark-mode widget context, intentional

No critical inline glass violations found.

## Category: Duration Consistency

### Analysis

- Dashboard nav items: `duration-200` — correct for micro-interactions
- Tab transitions: `duration-200` — correct
- Card hover: `duration-300` — canonical ✓
- Modal animate-in: `duration-300` — canonical ✓
- Map elements: `duration-300` — canonical ✓
- Beacon toggle: `duration-500` — intentional (longer for beacon animation)

No deviations requiring fixes.

---

## Fix Plan

### Batch 1: Critical (Theme-Breaking — hard-coded colors)

- [x] BeaconMarker.tsx:64 — Change `text-gray-900` to `text-foreground`
- [x] BeaconMarker.tsx:69 — Change `text-gray-500` to `text-muted-foreground`
- [x] SpotsMap.tsx:170 — Change `bg-white hover:bg-gray-50 border-gray-200` to `bg-background hover:bg-muted border-border`
- [x] SpotsMap.tsx:174 — Change `text-gray-700` to `text-foreground`
- [x] DashboardWidgets.tsx:57 — Change `text-red-500` to `text-destructive`
- [x] DashboardWidgets.tsx:76 — Change `bg-gray-400` to `bg-muted-foreground`

### Batch 2: Major (Visual Inconsistency)

- [x] CreateMeetingModal.tsx:93 — Change `bg-black/50` to `bg-black/40`
- [x] InviteFriendsModal.tsx:58 — Change `bg-black/50` to `bg-black/40`
- [x] CompleteProfileForm.tsx:113 — Change `rounded-[2.5rem]` to `rounded-2xl`
- [x] DogForm.tsx:150 — Change `rounded-[2rem]` to `rounded-2xl`

### Batch 3: Minor (Polish)

- [x] SentRequestCard.tsx:49 — Change `hover:scale-[1.01]` to `hover:scale-[1.02]`
- [x] FriendRequestCard.tsx:50 — Change `hover:scale-[1.01]` to `hover:scale-[1.02]`
