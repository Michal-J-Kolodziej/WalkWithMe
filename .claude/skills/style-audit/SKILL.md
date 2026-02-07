---
name: style-audit
description: Audit and enforce consistent styling, spacing, typography, and glassmorphism across the entire app
argument-hint: "[scope: full | spacing | typography | colors | glass | component-name]"
---

# Style Consistency Audit & Fix

Systematic process for detecting and fixing styling inconsistencies across the WalkWithMe app. Covers spacing, typography, colors, borders, shadows, animations, glassmorphism, and component-level patterns. The deliverable is a codebase where every component looks like it was written by the same person following the same design system.

## When to Use This Skill

- After implementing a new feature (run as a post-implementation pass)
- When the user reports something "looks off" or "doesn't match"
- Periodically as a maintenance audit (monthly or after several features land)
- When onboarding a new visual pattern that should be applied everywhere
- When the user passes a specific scope argument (e.g., `/style-audit spacing`)

## Scope Boundaries

- Does NOT change functionality or business logic
- Does NOT modify files in `convex/` (backend has no styling)
- Does NOT modify `src/components/ui/` (shadcn/ui primitives are upstream-managed)
- Does NOT redesign or rethink the visual language — only enforces the existing one
- Does NOT touch `src/styles.css` design tokens unless a token is clearly wrong

---

## Canonical Design Standards

These are the ground-truth values derived from `src/styles.css` and the dominant patterns across 40+ components. Every audit check compares against these values.

### Spacing Scale

| Context | Canonical Value | Notes |
|---|---|---|
| Page section spacing | `space-y-8` | Between major sections on dashboard pages |
| Card internal padding | `p-5` (content cards), `p-6` (stat/summary cards), `p-8` (forms/modals) | Three tiers, not interchangeable |
| Card grid gap | `gap-4` (2-col), `gap-6` (3-col) | Wider gap for wider grids |
| Form field spacing | `space-y-6` | Within form sections (standardize on 6) |
| Input group (label + input) | `space-y-2` | Label-to-input spacing |
| Button gap (icon + text) | `gap-2` | Inside buttons with icons |
| Flex row item gap | `gap-3` or `gap-4` | Between inline items |

### Typography Scale

| Element | Classes | Notes |
|---|---|---|
| Page title (H1) | `text-3xl font-bold tracking-tight` | Always with icon (`w-8 h-8 text-primary`) |
| Page subtitle | `text-muted-foreground mt-1` | Below H1 |
| Section heading (H2) | `text-xl font-semibold` | Section dividers |
| Card title (H3) | `text-lg font-semibold` | Card headers |
| Body text | `text-sm` or `text-base` | Default content |
| Small/meta text | `text-xs text-muted-foreground` | Timestamps, counts |
| Badge text | `text-xs font-medium` | Inside badges/pills |

### Color Rules

| Usage | Canonical Pattern | Anti-Pattern |
|---|---|---|
| Primary actions | `bg-primary text-primary-foreground` | Hard-coded `bg-orange-500` |
| Secondary text | `text-muted-foreground` | `text-gray-500`, `text-zinc-400` |
| Borders | `border-border` or `border-border/50` | `border-gray-200`, `border-white/10` |
| Hover backgrounds | `hover:bg-primary/10` or `hover:bg-muted` | `hover:bg-gray-100` |
| Active/selected state | `bg-primary/10 text-primary` | Hard-coded color pairs |
| Destructive actions | `text-destructive`, `bg-destructive/10` | `text-red-500`, `bg-red-100` |
| Status: success | `text-green-600`, `bg-green-500/10` | Acceptable (no semantic token exists) |
| Status: warning | `text-amber-500`, `bg-amber-500/10` | Acceptable (no semantic token exists) |
| Gradient pairs | `from-primary/20 to-secondary/20` | Arbitrary color pairs |

### Border Radius

| Element | Canonical Value | Notes |
|---|---|---|
| Cards | `rounded-2xl` | Via `glass-card` class or explicit |
| Buttons | `rounded-xl` | Via Button component |
| Inputs | `rounded-xl` | All form inputs |
| Modals | `rounded-2xl` | Modal containers |
| Badges/pills | `rounded-full` | Status indicators |
| Tab containers | `rounded-xl` | Tab bar wrapper |
| Avatar/image | `rounded-2xl` | Profile images |

### Glassmorphism Classes

| Context | Class to Use | Do NOT Use |
|---|---|---|
| Content cards | `glass-card` (CSS class) or `<GlassCard>` component | Inline `backdrop-blur-sm bg-white/90` |
| Sidebar | `glass-sidebar` | Inline blur + bg |
| Modal backdrop | `bg-black/40 backdrop-blur-sm` | `bg-black/50`, `bg-black/60` |
| Modal container | `glass-card` or `bg-card/95 backdrop-blur-xl` | Inline bg + blur combos |

### Animation Standards

| Pattern | Canonical Value | Notes |
|---|---|---|
| Card hover lift | `hover:scale-[1.02]` | NOT `hover:scale-105` or `hover:scale-110` |
| Button press | `active:scale-[0.98]` | Subtle press feedback |
| Transition timing | `transition-all duration-300` | Standard interaction speed |
| Color-only transition | `transition-colors` | No duration needed (uses default) |
| Loading spinner | `animate-spin` on `Loader2` icon | `w-4 h-4` (inline), `w-12 h-12` (page) |
| Focus ring | `focus:ring-2 focus:ring-primary/50` | Consistent across all inputs |

### Icon Sizing

| Context | Size | Example |
|---|---|---|
| Page title icon | `w-8 h-8` | Next to H1 heading |
| Card stat icon | `w-6 h-6` | Inside icon wrapper |
| Button inline icon | `w-4 h-4` | Inside `<Button>` |
| Navigation icon | `w-5 h-5` | Sidebar nav items |
| Small badge icon | `w-3 h-3` | Status dots |

---

## Phase 1: Inventory Scan

**Goal:** Programmatically catalog every styling value currently used, grouped by category, to identify deviations from canonical standards.

1. **Run the spacing scan** — Search for all padding, gap, margin, and space-y values in `src/components/` and `src/routes/`:
   - Search for `\bp-[0-9]+` to find all padding values
   - Search for `\bgap-[0-9]+` to find all gap values
   - Search for `\bspace-y-[0-9]+` to find all vertical rhythm values
   - Search for `\b(mt|mb|ml|mr|mx|my)-[0-9]+` to find all margin values
2. **Run the typography scan** — Search for text sizes, font weights, and tracking:
   - Search for `\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl)` across all TSX files
   - Search for `\bfont-(medium|semibold|bold)` to find weight usage
   - Search for `\btracking-` for letter-spacing usage
3. **Run the color scan** — Search for hard-coded colors that bypass semantic tokens:
   - Search for `\b(bg|text|border)-(red|blue|green|gray|zinc|slate|stone|neutral)-\d` to find raw palette usage
   - Search for `rgba\(` and `#[0-9a-fA-F]{3,8}` in component files for hard-coded values
   - Search for `text-white` and `text-black` outside of `glass-dark` contexts
4. **Run the border-radius scan** — Search for `rounded-` variants:
   - Search for `\brounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?` to catalog all radius values
   - Search for `rounded-\[` for arbitrary radius values
5. **Run the glassmorphism scan** — Check for inline glass styling that should use CSS classes:
   - Search for `backdrop-blur` in TSX files (should be in CSS classes, not inline)
   - Search for `bg-(white|card|background)/([\d]+)` to find opacity patterns
6. **Run the animation scan** — Search for transition and scale values:
   - Search for `duration-\d+` for timing values
   - Search for `hover:scale-` for lift effects
   - Search for `transition-` for transition property usage

*Ask yourself: "Did I search both `src/components/` and `src/routes/`? Inconsistencies often hide in route files that get less attention than shared components."*

## Phase 2: Deviation Analysis

**Goal:** Compare the inventory results against the Canonical Design Standards and produce a categorized list of deviations.

1. **Create the audit report** — Write a file named `STYLE_AUDIT.md` in the project root.
2. **Report structure** — For each category, list:

   ```markdown
   ## Category: [Spacing | Typography | Colors | etc.]

   ### Deviations Found

   | File | Line | Current Value | Canonical Value | Severity |
   |---|---|---|---|---|
   | src/components/X.tsx | 45 | p-4 | p-5 | minor |
   ```

3. **Classify severity**:
   - **Critical** — Hard-coded colors bypassing theme tokens (breaks theming/dark mode)
   - **Major** — Wrong spacing tier (p-8 on a content card that should be p-5), wrong heading size, inline glassmorphism instead of CSS class
   - **Minor** — Slightly different gap value, inconsistent border-radius where both values are close
   - **Intentional** — Differences that are correct by design (modals ARE larger padding, page loading spinners ARE bigger icons). Mark these as intentional and skip.
4. **Separate intentional deviations** — Not every difference is a bug. These are intentional:
   - `p-8` on forms and modals (they are different from content cards)
   - `w-12 h-12` on page-level loading spinners (intentionally larger)
   - Status colors (`green-600`, `amber-500`) for success/warning states (no semantic token exists)
   - `max-w-3xl` on profile/settings pages (intentionally narrower)
   - `rounded-full` on badges and avatars (intentionally pill-shaped)
   - Map page `immersive` mode removing all padding (intentionally full-bleed)
   - Chat page `h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]` (intentionally custom height for chat layout)
   - `rounded-[2rem]` on DogForm modal — technically equivalent to `rounded-3xl` but written differently; normalize to `rounded-2xl` if touched

*Ask yourself: "Am I marking something as a deviation that is actually correct for its context? Check the Canonical Standards table for context-specific values before flagging."*

## Phase 3: Fix Planning

**Goal:** Prioritize deviations and plan the fix order to minimize risk.

1. **Group fixes by file** — Multiple deviations in the same file should be fixed together.
2. **Order by severity** — Fix critical (theme-breaking) first, then major (visual inconsistency), then minor (polish).
3. **Order by dependency** — Fix shared components before page-specific ones. Fix order:
   1. `src/components/ui/` — Do NOT modify (shadcn upstream)
   2. `src/styles.css` — Only if tokens need correction
   3. `src/components/common/` — Shared utilities
   4. `src/components/dashboard/` — Feature components
   5. `src/components/layouts/` — Layout wrappers
   6. `src/routes/` — Page-level styling
4. **Estimate blast radius** — For each fix, note which other components might be affected. A change to a shared component affects all consumers.
5. **Write the fix plan** — Add a "Fix Plan" section to `STYLE_AUDIT.md`:

   ```markdown
   ## Fix Plan

   ### Batch 1: Critical (Theme-Breaking)
   - [ ] File: path — Change X to Y (reason)

   ### Batch 2: Major (Visual Inconsistency)
   - [ ] File: path — Change X to Y (reason)

   ### Batch 3: Minor (Polish)
   - [ ] File: path — Change X to Y (reason)
   ```

*Ask yourself: "Will fixing this value in a shared component cascade to places where the current value is actually correct? If yes, use `cn()` overrides at the call site instead."*

## Phase 4: Apply Fixes

**Goal:** Implement the fixes batch by batch, verifying after each batch.

1. **Fix Batch 1 (Critical)** — Apply all critical fixes:
   - Replace hard-coded colors with semantic tokens (`text-gray-500` → `text-muted-foreground`)
   - Replace inline glass styling with CSS classes (`backdrop-blur-sm bg-white/90` → `glass-card`)
   - Fix missing focus rings on interactive elements
2. **Verify Batch 1** — Run `npm run check` to ensure no syntax/lint issues. Visually spot-check affected components.
3. **Fix Batch 2 (Major)** — Apply major fixes:
   - Standardize card padding to correct tier (`p-5` for content, `p-6` for stats, `p-8` for forms)
   - Standardize heading sizes to match typography scale
   - Standardize `hover:scale-[1.02]` across all hoverable cards
   - Standardize border-radius values
4. **Verify Batch 2** — Run `npm run check`. Check affected pages in the browser.
5. **Fix Batch 3 (Minor)** — Apply polish fixes:
   - Normalize gap values in similar contexts
   - Normalize transition durations
   - Normalize icon sizes within the same context
6. **Verify Batch 3** — Run `npm run check`. Final visual pass.

### Fix Rules

| Rule | Do | Don't |
|---|---|---|
| Changing padding on cards | Change the specific card's classes | Change the `glass-card` CSS class (affects everything) |
| Replacing colors | Use semantic tokens from `styles.css` | Introduce new hard-coded values |
| Standardizing radius | Use the canonical value from the table | Use `rounded-[2rem]` or other arbitrary values |
| Fixing glass patterns | Switch to the appropriate CSS class | Add more inline Tailwind blur/opacity |
| Fixing animations | Use `hover:scale-[1.02]` | Use `hover:scale-105` or `hover:scale-110` |
| Changing shared components | Check all consumers first | Blindly change without checking imports |

*Ask yourself: "After this change, does the component still look correct in both its normal and hover/focus/active states?"*

## Phase 5: Verification

**Goal:** Confirm all fixes are correct and no regressions were introduced.

1. **Run automated checks**:
   - `npm run check` — Prettier + ESLint pass
   - `npm run build` — Production build succeeds
2. **Re-run the inventory scan** — Repeat the grep patterns from Phase 1. Compare results against canonical values. All deviations should now be either fixed or marked as intentional.
3. **Visual verification** — Check these pages in the browser at 375px (mobile) and 1440px (desktop):
   - Dashboard index (stat cards, widgets)
   - Dogs page (card grid, empty state, add modal)
   - Friends page (tabs, card grid, stats)
   - Meetings page (tabs, card grid, create modal)
   - Chat page (conversation list, chat window)
   - Map page (full-bleed map, floating controls)
   - Profile page (constrained width, info cards)
   - Settings page (form sections, toggles)
4. **Cross-component comparison** — Open two similar components side by side:
   - DogCard vs FriendCard vs UserCard — padding, typography, avatar size, badge styling should match
   - CreateMeetingModal vs DogForm — modal structure, padding, header styling should match
   - Dogs page vs Friends page vs Meetings page — page header, grid layout, empty state should match
5. **Update the audit report** — Mark all fixes as complete in `STYLE_AUDIT.md`. Note any remaining intentional deviations.
6. **Clean up** — Ask the user if they want to keep `STYLE_AUDIT.md` or delete it.

*Ask yourself: "If I screenshot each page and put them side by side, do they feel like they belong to the same app?"*

---

## Grep Reference Card

Quick-reference patterns for the inventory scan. Run these against `src/components/` and `src/routes/`.

| What to Find | Pattern | Output Mode |
|---|---|---|
| Padding values | `\bp-[0-9]+` | content (with file + line) |
| Gap values | `\bgap-[0-9]+` | content |
| Vertical rhythm | `\bspace-y-[0-9]+` | content |
| Text sizes | `text-(xs\|sm\|base\|lg\|xl\|2xl\|3xl\|4xl)` | content |
| Font weights | `font-(medium\|semibold\|bold)` | content |
| Raw palette colors | `(bg\|text\|border)-(red\|blue\|green\|gray\|zinc\|slate)-\d` | content |
| Hard-coded hex/rgba | `rgba\(\|#[0-9a-fA-F]{3,8}` | content |
| Border radius variants | `rounded(-none\|-sm\|-md\|-lg\|-xl\|-2xl\|-3xl\|-full)?` | count |
| Arbitrary radius | `rounded-\[` | content |
| Inline backdrop-blur | `backdrop-blur` | files_with_matches |
| Glass class usage | `glass(-dark\|-sidebar\|-card)?` | files_with_matches |
| Transition durations | `duration-\d+` | content |
| Hover scale values | `hover:scale-` | content |
| Shadow variants | `shadow(-sm\|-md\|-lg\|-xl\|-2xl)?` | count |
| Arbitrary shadows | `shadow-\[` | content |
| Icon sizes (w-N h-N) | `[wh]-[3-8]\b` | content |
| Dark mode overrides | `dark:` | content |
| Arbitrary values | `-\[\d` | content |

---

## Example Walkthrough: Auditing After Adding Walk Tracker Feature

**Context:** The walk tracker feature was just implemented. Several new components were added in `src/components/dashboard/walk/`. Need to verify they match the rest of the app.

### Phase 1: Inventory

Ran padding scan on `src/components/dashboard/walk/`:
- `WalkTrackerControls.tsx:23` — `p-4` (content card context)
- `WalkHistoryList.tsx:45` — `p-6` (list items)
- `WalkDetailsSheet.tsx:12` — `p-6` (sheet/modal)
- `ActiveWalkOverlay.tsx:8` — `p-4` (overlay)

Ran typography scan:
- `WalkHistoryList.tsx:38` — `text-xl font-bold` (section heading)
- `WalkDetailsSheet.tsx:18` — `text-lg font-semibold` (card title) — correct

Ran color scan:
- `WalkTrackerControls.tsx:56` — `bg-green-500` on start button — flagged

### Phase 2: Deviation Analysis

| File | Line | Current | Canonical | Severity |
|---|---|---|---|---|
| WalkTrackerControls.tsx | 23 | `p-4` | `p-5` | major |
| WalkHistoryList.tsx | 38 | `text-xl font-bold` | `text-xl font-semibold` | minor |
| WalkTrackerControls.tsx | 56 | `bg-green-500` | acceptable (action button, no semantic token) | intentional |

### Phase 3: Fix Plan

```markdown
### Batch 2: Major
- [ ] WalkTrackerControls.tsx:23 — Change `p-4` to `p-5` (content card canonical padding)

### Batch 3: Minor
- [ ] WalkHistoryList.tsx:38 — Change `font-bold` to `font-semibold` (section headings use semibold)
```

### Phase 4: Apply Fixes

- Changed `p-4` → `p-5` in WalkTrackerControls.tsx
- Changed `font-bold` → `font-semibold` in WalkHistoryList.tsx
- Ran `npm run check` — clean

### Phase 5: Verification

- Opened walk tracker page at 375px and 1440px — padding matches neighboring cards
- Compared WalkHistoryList heading with Friends page heading — weights now match
- Updated STYLE_AUDIT.md — all fixes marked complete

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Do This Instead |
|---|---|---|
| **Blind find-and-replace** ("change all `p-4` to `p-5`") | Breaks components where `p-4` is correct (e.g., inside a button, nested element) | Search with file context, fix individually |
| **Changing `components/ui/` files** | These are shadcn/ui upstream components. Changes get overwritten on next `npx shadcn add` | Fix styling at the consumption site, not in the primitive |
| **Adding new design tokens** for one-off fixes | Inflates the design system without need | Use existing tokens; if none fit, the deviation may be intentional |
| **Fixing everything in one commit** | Impossible to bisect regressions | Fix by batch (critical → major → minor), commit after each |
| **Ignoring responsive variants** | A component might use `p-4 md:p-6` intentionally | Preserve responsive overrides when standardizing base values |
| **Auditing without the canonical reference** | No source of truth means fixes are arbitrary | Always check the Canonical Design Standards tables above before changing anything |
| **Not checking the browser** | Class changes can have unexpected visual effects (margin collapse, flex shrink, overflow) | Visually verify every batch of fixes at mobile and desktop widths |
| **Treating all deviations as bugs** | Some differences are intentional (modals have more padding, page spinners are larger) | Check the "Intentional Deviations" list in Phase 2 before flagging |
| **Changing glassmorphism inline to CSS class without checking dark mode** | The CSS class may have different dark-mode behavior than the inline version | Verify both light and dark mode after switching to CSS classes |
| **Skipping the re-scan after fixes** | Cannot confirm deviations were actually resolved | Re-run Phase 1 grep patterns after Phase 4 to verify |

---

## Pre-Delivery Checklist

### Audit Process

- [ ] Inventory scan completed for all categories (spacing, typography, colors, radius, glass, animations)
- [ ] Both `src/components/` and `src/routes/` were scanned
- [ ] `STYLE_AUDIT.md` created with deviations listed
- [ ] Each deviation classified by severity (critical/major/minor/intentional)
- [ ] Intentional deviations explicitly marked and justified

### Fixes

- [ ] Fixes grouped by file and ordered by severity
- [ ] Shared components checked for consumer impact before modification
- [ ] `src/components/ui/` was NOT modified
- [ ] `src/styles.css` was NOT modified (unless token was clearly wrong)
- [ ] Each fix uses values from the Canonical Design Standards tables
- [ ] `npm run check` passes after each batch

### Verification

- [ ] `npm run build` succeeds
- [ ] Re-scan shows no remaining unintentional deviations
- [ ] Visual check at 375px (mobile) on at least 4 pages
- [ ] Visual check at 1440px (desktop) on at least 4 pages
- [ ] Similar components compared side-by-side (card vs card, modal vs modal, page vs page)
- [ ] Dark mode checked (if applicable)
- [ ] `STYLE_AUDIT.md` updated with fix status

---

## Tips

1. **Scan first, judge second** — Run all the grep patterns before deciding what to fix. The data tells you where the real problems are, not intuition.
2. **The 80/20 rule applies** — Fixing card padding and heading sizes across 5 files has more visual impact than fixing 20 minor gap differences. Prioritize the changes users will actually see.
3. **Scope your audit** — Pass a scope argument (`/style-audit spacing`) to focus on one category instead of auditing everything. Full audits are for maintenance cycles, not post-feature checks.
4. **Screenshot before and after** — Take a screenshot of affected pages before fixing. After fixing, compare. If something looks worse, revert.
5. **The Canonical Standards evolve** — If the team decides cards should use `p-6` instead of `p-5`, update the Canonical Design Standards section of this skill, then re-audit. The skill is a living document.
6. **Consistency beats perfection** — It is better for all cards to have `p-5` (even if `p-6` would be "better") than to have half with `p-5` and half with `p-6`. Pick one and enforce it everywhere.
