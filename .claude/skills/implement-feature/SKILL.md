---
name: implement-feature
description: Guide through rigorous feature implementation with planning, backend, frontend, polish, and verification phases
argument-hint: "[feature description]"
---

# Feature Implementation Workflow

A rigorous, multi-phase process for implementing new features in the WalkWithMe codebase. Enforces triple-verified planning, codebase-consistent code style, systematic bug tracking, and mandatory post-implementation review. The deliverable is a fully working, tested feature with clean code that matches existing patterns.

## When to Use This Skill

- User asks to implement a new feature or add functionality
- User asks to build a significant UI component with backend support
- Any task that touches both `convex/` and `src/` directories
- Any change requiring new schema tables, queries, mutations, components, or routes

## Scope Boundaries

- Does NOT cover pure bug fixes (no planning phase needed)
- Does NOT cover pure UI restyling (use `/ui-ux` skill instead)
- Does NOT cover refactoring without new functionality
- Does NOT cover deployment or CI/CD changes

---

## Phase 1: Discovery & Requirements

**Goal:** Deeply understand what needs to be built and how it fits into the existing codebase before writing any plan.

1. **Clarify the feature request** — Ask the user clarifying questions if the requirements are vague. Do not proceed with ambiguous requirements.
2. **Study related existing code** — Read files in the areas the feature will touch:
   - `convex/schema.ts` for the current data model
   - Existing `convex/*.ts` modules that the feature relates to
   - Existing components in `src/components/` that the feature extends or resembles
   - Existing hooks in `src/hooks/` for patterns to follow
   - Route files in `src/routes/` where the feature will be accessed
3. **Identify the code style** — Before writing any code, internalize these patterns from the codebase:
   - No semicolons, single quotes, trailing commas (Prettier config)
   - Convex functions: `getAuthUserId(ctx)` at top of every authenticated handler, throw `'Unauthorized'` if null
   - Convex queries use `.withIndex()` for filtered reads, indexes defined in `convex/schema.ts`
   - Frontend components: named exports, `@/` path alias for imports, `cn()` for conditional classes
   - Forms: `react-hook-form` + `zod` validation schemas
   - Translations: keys in both `src/locales/en.json` and `src/locales/pl.json`
   - Icons: `lucide-react` only
   - UI primitives: `shadcn/ui` components from `@/components/ui/`
4. **Map the feature surface** — List every file that will be created or modified. Group them:
   - Schema changes (`convex/schema.ts`)
   - Backend functions (new or modified `convex/*.ts` files)
   - Hooks (`src/hooks/use*.ts`)
   - Components (`src/components/**/*.tsx`)
   - Routes (`src/routes/**/*.tsx`)
   - Translations (`src/locales/en.json`, `src/locales/pl.json`)

*Ask yourself: "Can I describe exactly what data flows from the database to the UI for this feature? If not, I need to study the codebase more."*

## Phase 2: Implementation Plan (Triple-Verified)

**Goal:** Create a detailed implementation plan, then verify it against the codebase three times, editing after each pass.

### Step 1: Write the Initial Plan

1. **Create the plan file** — Write a file named `PLAN_[FEATURE_NAME].md` in the project root (e.g., `PLAN_WALK_TRACKER.md`).
2. **Plan structure** — The plan MUST include these sections:
   - **Feature Summary** — One paragraph describing what the feature does from the user's perspective
   - **Data Model** — Exact schema changes: table names, field names, field types, indexes
   - **Backend Functions** — Each query/mutation: name, file, args, return value, logic summary
   - **Frontend Components** — Each component: name, file path, props, what it renders, which hooks it uses
   - **Hooks** — Each custom hook: name, file path, what Convex queries/mutations it wraps, what state it manages
   - **Route Changes** — Any new or modified route files
   - **Translation Keys** — List of new i18n keys needed (both `en` and `pl`)
   - **Implementation Order** — Numbered sequence: schema first, then backend, then hooks, then components, then routes, then translations
3. **Be concrete** — Every entry must reference exact file paths, function names, and field names. No vague language like "add appropriate fields" or "create necessary components."

### Step 2: First Verification Pass

1. **Read the plan file** you just wrote.
2. **Cross-check against `convex/schema.ts`** — Do the proposed tables/fields conflict with existing ones? Are the field types compatible with how Convex validators work (`v.string()`, `v.number()`, `v.optional()`, etc.)?
3. **Cross-check against existing modules** — Do the proposed function names conflict with exports in existing `convex/*.ts` files? Do the proposed component names conflict with existing components?
4. **Check data flow** — Trace the data from schema → query → hook → component. Does every field the component needs actually exist in the query return value?
5. **Edit the plan** if any issues found. Save the updated plan file.

### Step 3: Second Verification Pass

1. **Read the updated plan file** again.
2. **Check for missing indexes** — Every `.withIndex()` call in the planned queries must have a matching index in the schema changes.
3. **Check for missing auth guards** — Every mutation and query that accesses user data must include `getAuthUserId(ctx)` check.
4. **Check component hierarchy** — Are the proposed components placed correctly in the component tree? Do they have access to the data they need?
5. **Check for edge cases** — What happens with empty states? What if the user has no data yet? What if a referenced record is deleted?
6. **Edit the plan** if any issues found. Save the updated plan file.

### Step 4: Third Verification Pass

1. **Read the updated plan file** one final time.
2. **Run the "new agent" test** — Could someone unfamiliar with this codebase follow this plan and produce correct code? If any step is ambiguous, clarify it.
3. **Check implementation order** — Are there any circular dependencies? Can each step be completed without forward references?
4. **Check for scope creep** — Is the plan doing more than what was requested? Remove anything unnecessary.
5. **Final edit** if any issues found. Save the final plan file.

*Ask yourself: "Have I actually edited the plan file three times, or did I skip a pass because it 'looked fine'? Every pass must produce a re-read and explicit confirmation."*

### Step 5: User Approval

1. **Present the plan** to the user with a summary of:
   - What will be built
   - Which files will be created or modified
   - The implementation order
2. **Wait for approval** before writing any implementation code.

## Phase 3: Backend Implementation

**Goal:** Build the data layer — schema, queries, and mutations — matching existing code style exactly.

1. **Update the schema** — Edit `convex/schema.ts` to add new tables or fields. Follow existing patterns:
   - Use `v` validators from `convex/values`
   - Do NOT define `_id` or `_creationTime` (these are automatic)
   - Add indexes for every field you will query by
   - Normalize ID pairs (`user1Id < user2Id`) for bidirectional relationships
2. **Create backend functions** — Create or modify files in `convex/`. For each function:
   - Import `getAuthUserId` from `@convex-dev/auth/server`
   - Import `v` from `convex/values` and `query`/`mutation` from `./_generated/server`
   - Start every handler with `const userId = await getAuthUserId(ctx)` and throw/return if null
   - Use `.withIndex()` for filtered queries, never `.filter()` on large datasets
   - Match the code style: no semicolons, single quotes, trailing commas, arrow functions
3. **Verify backend compiles** — Run `npx convex dev` (or check the running dev process) to confirm no type errors in `convex/` files.

*Ask yourself: "Does every new query have a matching index in the schema? Does every mutation check auth?"*

## Phase 4: Frontend Implementation

**Goal:** Build hooks, components, routes, and translations that match the existing codebase style.

1. **Create custom hooks** — In `src/hooks/`:
   - Wrap Convex `useQuery(api.module.fn)` and `useMutation(api.module.fn)` calls
   - Follow naming convention: `useFeatureName.ts` (e.g., `useBeacon.ts`, `useWalkTracker.ts`)
   - Export a single hook function that returns the data and actions the components need
2. **Create components** — In `src/components/`:
   - Use named exports (not default exports)
   - Import UI primitives from `@/components/ui/` (Button, Card, Dialog, etc.)
   - Import icons from `lucide-react`
   - Use `cn()` from `@/lib/utils` for conditional class merging
   - Use Tailwind classes matching the glassmorphism dark-mode theme (`bg-card/80 backdrop-blur-sm border-white/10`)
   - Use `react-hook-form` + `zod` for any forms
   - Use `useTranslation()` for all user-facing text
3. **Add or update routes** — In `src/routes/`:
   - Follow TanStack Start file-based routing conventions
   - Dashboard routes go under `src/routes/dashboard/`
4. **Add translations** — Add keys to both:
   - `src/locales/en.json` — English text
   - `src/locales/pl.json` — Polish translations
5. **Check imports** — Verify every import resolves. If a `shadcn/ui` component is needed but not yet installed, run `npx shadcn@latest add <component>`.
6. **Run lint and format** — Execute `npm run check` to auto-fix formatting and lint issues.

*Ask yourself: "If I put my new component next to an existing one, would they look like they were written by the same person? If not, adjust the style."*

## Phase 5: Bug Tracking & Resolution

**Goal:** Systematically find, document, and fix every bug before declaring the feature complete.

1. **Create the bug file** — Create `BUGS_[FEATURE_NAME].md` in the project root (e.g., `BUGS_WALK_TRACKER.md`).
2. **Bug file format** — Each entry must include:

   ```markdown
   ### BUG-001: [Short description]
   - **File:** [exact file path]
   - **Line:** [approximate line number]
   - **Severity:** critical | major | minor
   - **Description:** [what goes wrong]
   - **Status:** open | fixed
   ```

3. **During implementation** — Every time you encounter or create a bug, immediately add it to the bug file. Do NOT stop to fix it mid-flow unless it blocks the next step.
4. **After implementation is complete** — Read the bug file. Fix every bug in order of severity (critical first, then major, then minor).
5. **Update status** — Mark each bug as `fixed` in the bug file after resolving it.
6. **Verify fixes** — After all bugs are fixed, run:
   - `npm run check` — formatting and lint
   - `npm run build` — production build succeeds
   - `npm run test` — all tests pass (if tests exist for the feature)

*Ask yourself: "Did I actually write bugs down as I found them, or did I try to fix them inline and lose track?"*

## Phase 6: Final Review & Browser Verification

**Goal:** Prove the feature works correctly, matches codebase style, and does not break existing functionality.

### Step 1: Comprehensive Code Review

1. **Read every file you created or modified** — Read them in full, not just the changed lines.
2. **Style consistency check** — Compare your code side-by-side with existing code in the same directory. Verify:
   - Same formatting (no semicolons, single quotes, trailing commas)
   - Same import ordering patterns
   - Same naming conventions (camelCase for functions/variables, PascalCase for components)
   - Same error handling patterns (`throw new Error('Unauthorized')` vs `return null`)
   - Same component structure (hooks at top, early returns, then JSX)
3. **Logic review** — Trace the complete data flow one more time: user action → component → hook → mutation → database → query → hook → component. Confirm it works end-to-end.
4. **Check for regressions** — Did any of your changes to existing files break other features? Search for other components that import from files you modified.
5. **Run the full check suite**:
   - `npm run check` — formatting and lint pass
   - `npm run build` — production build succeeds
   - `npm run test` — all tests pass

### Step 2: Browser Verification

1. **Ensure dev servers are running** — `npm run dev` and `npx convex dev` must both be active.
2. **Navigate to the feature** — Open the page where the feature lives in the browser.
3. **Test the happy path** — Perform the primary action the feature enables. Verify the UI updates correctly.
4. **Test edge cases** — Test with:
   - Empty state (no data yet)
   - Error state (disconnect network, invalid input)
   - Rapid interactions (double-click, fast navigation)
5. **Verify responsive layout** — Check the feature looks correct on mobile (375px) and desktop (1440px).
6. **Report results** — Inform the user what was tested and the outcome.

### Step 3: Cleanup

1. **Delete temporary files** — Remove `PLAN_[FEATURE_NAME].md` and `BUGS_[FEATURE_NAME].md` from the project root, or ask the user if they want to keep them.
2. **Summarize** — Provide the user with:
   - What was built (one paragraph)
   - Files created/modified (list)
   - How to use the feature (brief instructions)
   - Any known limitations or future improvements

---

## Code Style Reference

Code you write MUST match these patterns found in the existing codebase.

### Backend (Convex) Pattern

```typescript
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const myMutation = mutation({
  args: {
    fieldName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')

    const user = await ctx.db.get(userId)
    if (!user) throw new Error('User not found')

    // Business logic here
    await ctx.db.insert('tableName', {
      userId,
      fieldName: args.fieldName,
      createdAt: Date.now(),
    })
  },
})

export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query('tableName')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()
  },
})
```

### Frontend Component Pattern

```tsx
import { Button } from '@/components/ui/button'
import { useMyFeature } from '@/hooks/useMyFeature'
import { cn } from '@/lib/utils'
import { SomeIcon } from 'lucide-react'

export function MyComponent() {
  const { data, doAction } = useMyFeature()

  if (!data) return null

  return (
    <div className={cn(
      'rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm p-4',
    )}>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => doAction()}
      >
        <SomeIcon className="w-4 h-4" />
        Action Label
      </Button>
    </div>
  )
}
```

### Hook Pattern

```typescript
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useMyFeature() {
  const data = useQuery(api.module.myQuery)
  const doAction = useMutation(api.module.myMutation)

  return {
    data,
    doAction,
  }
}
```

---

## Example Walkthrough: Implementing a "Walk Notes" Feature

**User request:** "Add a way for users to add notes to their walks — like what they saw, how the dog behaved, etc."

### Phase 1: Discovery

- Read `convex/schema.ts` — found `walks` table exists with `userId`, `startTime`, `endTime`, `route`, `distance`, `duration` fields
- Read `convex/walks.ts` — found `startWalk`, `endWalk`, `getWalkHistory` functions
- Read `src/hooks/useWalkTracker.ts` — found it wraps walk mutations/queries
- Read `src/components/dashboard/walk/WalkDetailsSheet.tsx` — this is where notes would display
- Identified style patterns: no semicolons, single quotes, `getAuthUserId` at top, `cn()` for classes

### Phase 2: Plan (Triple-Verified)

**Written to `PLAN_WALK_NOTES.md`:**

- Schema: add `notes: v.optional(v.string())` to walks table
- Backend: add `updateWalkNotes` mutation in `convex/walks.ts`
- Hook: add `updateNotes` to `useWalkTracker` return value
- Component: add notes textarea to `WalkDetailsSheet.tsx`
- Translations: add `walk.notes`, `walk.notesPlaceholder` to both locale files

**Pass 1:** Checked schema — `notes` field does not conflict. Mutation uses `getAuthUserId`. Index exists on `by_userId`. No edits needed.

**Pass 2:** Checked that `WalkDetailsSheet` has access to `walkId` (it does, via props). Checked edge case — what if notes is empty string? Decided to treat empty string same as undefined. Edited plan to add this clarification.

**Pass 3:** Checked implementation order — schema → mutation → hook → component → translations. No circular deps. Plan is minimal and focused. No edits needed.

### Phase 3: Backend

- Added `notes: v.optional(v.string())` to walks table in schema
- Added `updateWalkNotes` mutation to `convex/walks.ts` — checks auth, patches the walk document
- Verified `npx convex dev` shows no errors

### Phase 4: Frontend

- Added `updateNotes` to `useWalkTracker` hook
- Added textarea with save button to `WalkDetailsSheet.tsx`
- Added translation keys: `walk.notes` = "Walk Notes" / "Notatki z spaceru", `walk.notesPlaceholder` = "What happened on this walk?" / "Co wydarzylo sie na spacerze?"
- Ran `npm run check` — clean

### Phase 5: Bug Tracking

Created `BUGS_WALK_NOTES.md`:

```
### BUG-001: Notes don't persist on page refresh
- File: src/hooks/useWalkTracker.ts
- Line: 45
- Severity: critical
- Description: Used local state instead of Convex query for notes display
- Status: fixed (switched to useQuery)

### BUG-002: Save button enabled when notes unchanged
- File: src/components/dashboard/walk/WalkDetailsSheet.tsx
- Line: 72
- Severity: minor
- Description: Button should be disabled when content matches saved value
- Status: fixed (added dirty check)
```

### Phase 6: Final Review

- Re-read all modified files — style matches existing code
- Traced data flow: user types → textarea onChange → save button → `updateWalkNotes` mutation → Convex DB → `useQuery` auto-updates → textarea displays saved notes
- Ran `npm run check`, `npm run build` — both pass
- Tested in browser: added notes, refreshed, notes persisted
- Tested empty state: no notes shown, placeholder text visible
- Cleaned up plan and bug files

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Do This Instead |
|---|---|---|
| **Skipping plan verification passes** ("Plan looks fine, moving on") | Bugs that could be caught in planning slip into implementation, costing 10x more time to fix | Actually re-read the plan file three times. Each pass catches different categories of issues |
| **Fixing bugs inline during implementation** | Loses track of what was fixed, may introduce new bugs while fixing old ones, disrupts implementation flow | Write bugs to the bug file immediately, fix them all after implementation is complete |
| **Writing code in a different style** (semicolons, default exports, different naming) | Creates inconsistency that makes the codebase harder to maintain and review | Read 2-3 existing files in the same directory before writing. Match their patterns exactly |
| **Skipping the final code review** ("I just wrote it, I know it works") | Fresh eyes (even your own) catch issues that flow state misses — wrong variable names, missing error handling, dead code | Read every file you touched in full after all bugs are fixed |
| **Not testing in the browser** ("It compiles, ship it") | Compilation proves syntax, not behavior. Real bugs appear in user interaction — wrong layout, missing data, broken state transitions | Navigate to the feature and test the happy path, empty state, and edge cases |
| **Vague plan entries** ("Create the component") | Cannot verify if the plan is correct or complete without concrete details | Specify exact file paths, function names, props, and data flow |
| **Starting to code without user approval** | Risk building the wrong thing entirely. Rework costs more than waiting for confirmation | Always present the plan and wait for explicit approval |
| **Forgetting translations** | Feature works in English but Polish users see raw translation keys | Add entries to both `en.json` and `pl.json` as part of implementation, not as an afterthought |
| **Missing Convex indexes** | Queries work in dev with small data but time out in production | Every `.withIndex()` call must have a matching index in `convex/schema.ts` |
| **Skipping auth checks in mutations** | Security vulnerability — any user can modify any other user's data | Every Convex mutation starts with `getAuthUserId(ctx)` and throws if null |

---

## Pre-Delivery Checklist

### Planning

- [ ] `PLAN_[FEATURE_NAME].md` was created with all required sections
- [ ] Plan was verified against codebase three separate times
- [ ] Plan was edited after at least one verification pass
- [ ] User approved the plan before implementation began

### Backend

- [ ] Schema changes use correct `v` validators
- [ ] No `_id` or `_creationTime` defined in schema (they are automatic)
- [ ] Every queried field has an index in `convex/schema.ts`
- [ ] Every mutation calls `getAuthUserId(ctx)` and handles null
- [ ] `npx convex dev` shows no type errors

### Frontend

- [ ] Components use named exports
- [ ] Imports use `@/` path alias
- [ ] Icons from `lucide-react` only
- [ ] UI primitives from `@/components/ui/`
- [ ] `cn()` used for conditional classes
- [ ] Forms use `react-hook-form` + `zod`
- [ ] All user-facing text uses `useTranslation()`

### Code Style

- [ ] No semicolons
- [ ] Single quotes
- [ ] Trailing commas
- [ ] Code matches style of neighboring files in the same directory
- [ ] `npm run check` passes with no errors

### Bug Tracking

- [ ] `BUGS_[FEATURE_NAME].md` was created during implementation
- [ ] All bugs marked as `fixed`
- [ ] No open bugs remain

### Verification

- [ ] Every created/modified file re-read in full after bugs fixed
- [ ] `npm run check` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes (if tests exist)
- [ ] Feature tested in the browser
- [ ] Happy path works
- [ ] Empty state handled
- [ ] Edge cases tested

---

## Tips

1. **Read before you write** — Before creating any file, read 2-3 existing files in the same directory. Your code should be indistinguishable from the existing code.
2. **Plan on paper, code in editor** — The triple verification catches bugs that are 10x cheaper to fix in a plan than in code. Do not rush through it.
3. **One bug, one entry** — Every bug gets its own entry in the bug file with severity. This prevents "I'll remember to fix that" amnesia.
4. **Schema first, always** — The data model dictates everything downstream. Get it right before touching any other file.
5. **Test the sad path** — Empty states, missing data, and error conditions are where features break. Test them explicitly.
6. **Keep the plan file lean** — The plan should contain what you need to implement, not a design document. If a section grows beyond 10 lines, you are over-explaining.
