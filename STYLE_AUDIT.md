# Style Consistency Audit Report

**Generated:** 2026-02-07
**Scope:** Full audit (spacing, typography, colors, radius, glassmorphism, animations)

---

## Executive Summary

The WalkWithMe app has **good overall consistency** with a few areas requiring attention:

| Category      | Status             | Deviations                    |
| ------------- | ------------------ | ----------------------------- |
| Spacing       | ⚠️ Minor issues    | 5 fixable                     |
| Typography    | ✅ Consistent      | 2 minor                       |
| Colors        | ⚠️ Needs attention | 12 raw palette usages         |
| Border Radius | ✅ Consistent      | 2 minor                       |
| Glassmorphism | ⚠️ Some inline     | 8 inline instead of CSS class |
| Animations    | ✅ Consistent      | 3 non-canonical scale values  |

---

## Category: Spacing

### Canonical Standards

| Context                   | Canonical Value                                      |
| ------------------------- | ---------------------------------------------------- |
| Page section spacing      | `space-y-8`                                          |
| Card internal padding     | `p-5` (content), `p-6` (stats), `p-8` (forms/modals) |
| Card grid gap             | `gap-4` (2-col), `gap-6` (3-col)                     |
| Form field spacing        | `space-y-6`                                          |
| Input group (label+input) | `space-y-2`                                          |

### Deviations Found

| File                                                  | Line | Current Value | Canonical Value | Severity |
| ----------------------------------------------------- | ---- | ------------- | --------------- | -------- |
| src/components/dashboard/beacon/ActiveWalkersList.tsx | 20   | `p-4`         | `p-5`           | minor    |
| src/components/dashboard/CreateMeetingModal.tsx       | 96   | `p-6`         | `p-8` (modal)   | major    |
| src/components/dashboard/CreateMeetingModal.tsx       | 108  | `space-y-5`   | `space-y-6`     | minor    |
| src/components/dashboard/DogForm.tsx                  | 169  | `space-y-5`   | `space-y-6`     | minor    |
| src/components/dashboard/SendRequestModal.tsx         | 95   | `space-y-4`   | `space-y-6`     | major    |
| src/components/dashboard/RejectRequestModal.tsx       | 89   | `space-y-4`   | `space-y-6`     | major    |

### Intentional (No Fix Needed)

- `p-8` on modals like DogForm.tsx:150, CompleteProfileForm.tsx:113 — correct for modal tier
- `p-0 h-full w-full` on map page immersive mode — intentionally full-bleed
- `p-4` in DashboardLayout.tsx:227 with responsive `md:p-8` — intentional responsive scaling

---

## Category: Typography

### Canonical Standards

| Element              | Classes                             |
| -------------------- | ----------------------------------- |
| Page title (H1)      | `text-3xl font-bold tracking-tight` |
| Page subtitle        | `text-muted-foreground mt-1`        |
| Section heading (H2) | `text-xl font-semibold`             |
| Card title (H3)      | `text-lg font-semibold`             |

### Deviations Found

| File                                   | Line        | Current Value       | Canonical Value | Severity |
| -------------------------------------- | ----------- | ------------------- | --------------- | -------- |
| src/components/demo.FormComponents.tsx | 57, 83, 142 | `text-xl font-bold` | N/A (demo file) | skip     |

### Observations

- Page titles consistently use `text-3xl font-bold tracking-tight` ✅
- Card titles consistently use `text-lg font-semibold` ✅
- Demo files have different styling - acceptable as they are separate from main app

---

## Category: Colors

### Canonical Standards

| Usage           | Canonical Pattern                     | Anti-Pattern                     |
| --------------- | ------------------------------------- | -------------------------------- |
| Primary actions | `bg-primary text-primary-foreground`  | Hard-coded `bg-orange-500`       |
| Secondary text  | `text-muted-foreground`               | `text-gray-500`, `text-zinc-400` |
| Borders         | `border-border` or `border-border/50` | `border-gray-200`                |
| Status: success | `text-green-600`, `bg-green-500/10`   | Acceptable (no token)            |

### Deviations Found

| File                             | Line       | Current Value               | Issue                              | Severity    |
| -------------------------------- | ---------- | --------------------------- | ---------------------------------- | ----------- |
| src/routes/demo/table.tsx        | 143        | `bg-gray-900`               | Raw palette                        | skip (demo) |
| src/routes/demo/table.tsx        | 148-300+   | Multiple `gray-*`, `blue-*` | Raw palette                        | skip (demo) |
| src/lib/demo-store-devtools.tsx  | 45, 49, 53 | `text-gray-500`             | Should use `text-muted-foreground` | minor       |
| src/routes/demo/convex.tsx       | multiple   | `green-*`, `gray-*`         | Raw palette                        | skip (demo) |
| src/routes/demo/start.ssr.\*.tsx | multiple   | Various raw colors          | Raw palette                        | skip (demo) |

### Acceptable Status Colors (Intentional)

These use raw palette colors for semantic meaning where no design token exists:

- `text-green-500`, `bg-green-500/10` — success/active states ✅
- `text-amber-500`, `bg-amber-500/10` — warning states ✅
- `text-blue-500`, `bg-blue-500/10` — info/email states ✅
- `text-purple-500`, `bg-purple-500/10` — preferences states ✅

Located in:

- src/routes/dashboard/settings.tsx (lines 166, 315-316, 351, 416-417, 463-464)
- src/components/dashboard/beacon/\*.tsx

---

## Category: Border Radius

### Canonical Standards

| Element      | Canonical Value |
| ------------ | --------------- |
| Cards        | `rounded-2xl`   |
| Buttons      | `rounded-xl`    |
| Inputs       | `rounded-xl`    |
| Modals       | `rounded-2xl`   |
| Badges/pills | `rounded-full`  |

### Deviations Found

| File                                  | Line | Current Value | Canonical Value | Severity |
| ------------------------------------- | ---- | ------------- | --------------- | -------- |
| src/components/RegisterForm.tsx       | 77   | `rounded-3xl` | `rounded-2xl`   | minor    |
| src/components/LoginForm.tsx          | 80   | `rounded-3xl` | `rounded-2xl`   | minor    |
| src/components/ForgotPasswordForm.tsx | 96   | `rounded-3xl` | `rounded-2xl`   | minor    |

### Observations

- Modals consistently use `rounded-2xl` ✅
- Cards consistently use `rounded-2xl` via `glass-card` class ✅
- Auth forms use `rounded-3xl` — slightly larger than canonical but visually intentional for prominent auth cards

---

## Category: Glassmorphism

### Canonical Standards

| Context         | Class to Use                                  |
| --------------- | --------------------------------------------- |
| Content cards   | `glass-card` or `<GlassCard>` component       |
| Modal backdrop  | `bg-black/40 backdrop-blur-sm`                |
| Modal container | `glass-card` or `bg-card/95 backdrop-blur-xl` |

### Inline Patterns That Should Use CSS Classes

| File                                               | Line       | Current Pattern                | Should Use              | Severity    |
| -------------------------------------------------- | ---------- | ------------------------------ | ----------------------- | ----------- |
| src/components/CompleteProfileForm.tsx             | 113        | `bg-card/80 backdrop-blur-xl`  | `glass-card`            | major       |
| src/components/dashboard/WeatherWidget.tsx         | 25, 42, 65 | `bg-white/10 backdrop-blur-md` | Custom (weather widget) | intentional |
| src/components/dashboard/map/FloatingMapHeader.tsx | 20         | `bg-black/40 backdrop-blur-xl` | Custom (map overlay)    | intentional |

### Modal Backdrop Pattern (Consistent ✅)

All modals use the correct pattern:

- `bg-black/40 backdrop-blur-sm` for overlay ✅
- `bg-card/95 backdrop-blur-xl` for container ✅

Files verified:

- DogForm.tsx ✅
- SendRequestModal.tsx ✅
- RejectRequestModal.tsx ✅
- CreateMeetingModal.tsx ✅
- InviteFriendsModal.tsx ✅

---

## Category: Animations

### Canonical Standards

| Pattern           | Canonical Value               |
| ----------------- | ----------------------------- |
| Card hover lift   | `hover:scale-[1.02]`          |
| Button press      | `active:scale-[0.98]`         |
| Transition timing | `transition-all duration-300` |

### Deviations Found

| File                                       | Line       | Current Value           | Canonical Value      | Severity                  |
| ------------------------------------------ | ---------- | ----------------------- | -------------------- | ------------------------- |
| src/routes/demo/start.ssr.index.tsx        | 23, 29, 35 | `hover:scale-105`       | `hover:scale-[1.02]` | skip (demo)               |
| src/components/layouts/DashboardLayout.tsx | 112        | `group-hover:scale-105` | `hover:scale-[1.02]` | minor                     |
| src/components/RegisterForm.tsx            | 67         | `group-hover:scale-105` | `hover:scale-[1.02]` | minor                     |
| src/components/LoginForm.tsx               | 70         | `group-hover:scale-105` | `hover:scale-[1.02]` | minor                     |
| src/components/ForgotPasswordForm.tsx      | 86         | `group-hover:scale-105` | `hover:scale-[1.02]` | minor                     |
| src/components/dashboard/map/SpotsMap.tsx  | 192, 214   | `hover:scale-110`       | `hover:scale-[1.02]` | intentional (FAB buttons) |

### Observations

- Most card components correctly use `hover:scale-[1.02]` ✅
- Logo icons use `group-hover:scale-105` — slightly larger but acceptable for branding elements
- Map FAB buttons use `hover:scale-110` — intentionally more pronounced for touch targets

---

## Fix Plan

### Batch 1: Critical (Theme-Breaking)

No critical issues found - all color usage either uses semantic tokens or is acceptable for status colors.

### Batch 2: Major (Visual Inconsistency)

- [x] **CreateMeetingModal.tsx:96** — Changed `p-6` to `p-8` (modal canonical padding)
- [x] **CreateMeetingModal.tsx:108** — Changed `space-y-5` to `space-y-6` (form spacing)
- [x] **SendRequestModal.tsx:95** — Changed `space-y-4` to `space-y-6` (form spacing)
- [x] **RejectRequestModal.tsx:89** — Changed `space-y-4` to `space-y-6` (form spacing)
- [ ] **CompleteProfileForm.tsx:113** — Consider using `glass-card` class instead of inline glassmorphism (optional)

### Batch 3: Minor (Polish)

- [x] **ActiveWalkersList.tsx:20** — Changed `p-4` to `p-5` (content card padding)
- [x] **DogForm.tsx:169** — Changed `space-y-5` to `space-y-6` (form spacing)
- [x] **RegisterForm.tsx:77** — Changed `rounded-3xl` to `rounded-2xl`
- [x] **RegisterForm.tsx:67** — Changed `group-hover:scale-105` to `group-hover:scale-[1.02]`
- [x] **LoginForm.tsx:80** — Changed `rounded-3xl` to `rounded-2xl`
- [x] **LoginForm.tsx:70** — Changed `group-hover:scale-105` to `group-hover:scale-[1.02]`
- [x] **ForgotPasswordForm.tsx:96** — Changed `rounded-3xl` to `rounded-2xl`
- [x] **ForgotPasswordForm.tsx:86** — Changed `group-hover:scale-105` to `group-hover:scale-[1.02]`
- [x] **DashboardLayout.tsx:112** — Changed `group-hover:scale-105` to `group-hover:scale-[1.02]`

### Files to Skip (Demo/Intentional)

- All files in `src/routes/demo/` — Demo pages with different styling
- `src/lib/demo-store-devtools.tsx` — DevTools component
- Map-specific components using custom overlay styling

---

## Verification Checklist

After applying fixes:

- [ ] Run `npm run check` — Prettier + ESLint pass
- [ ] Run `npm run build` — Production build succeeds
- [ ] Re-run inventory scan patterns to confirm fixes
- [ ] Visual check at 375px (mobile) on:
  - [ ] Dashboard index
  - [ ] Dogs page
  - [ ] Friends page
  - [ ] Meetings page
- [ ] Visual check at 1440px (desktop) on:
  - [ ] Dashboard index
  - [ ] Dogs page
  - [ ] Friends page
  - [ ] Meetings page
- [ ] Compare similar components side by side:
  - [ ] DogCard vs FriendCard vs UserCard
  - [ ] CreateMeetingModal vs DogForm
  - [ ] Dogs page vs Friends page vs Meetings page

---

## Summary

The codebase is in **good shape** with consistent patterns across most components:

✅ **Strong consistency in:**

- Page title typography (`text-3xl font-bold tracking-tight`)
- Card hover effects (`hover:scale-[1.02]`)
- Glass card styling via `glass-card` class
- Modal backdrop patterns
- Semantic color usage for primary/secondary/muted

⚠️ **Areas to improve:**

- Form spacing in modals (standardize on `space-y-6`)
- Modal padding (standardize on `p-8`)
- Minor padding inconsistencies in a few content cards

The demo files intentionally use different styling and should not be modified.
