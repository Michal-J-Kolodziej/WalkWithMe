---
description: A comprehensive, step-by-step guide for implementing new features, ensuring high quality, verification, and documentation.
---

# Feature Implementation Workflow

Follow this rigorous process when asked to implement a complex feature.

## Phase 1: Planning & Definition 📝
**Goal:** deeply understand requirements and create a roadmap.

1.  **Analyze & Clarify:**
    *   Understand the user's core objective.
    *   Ask clarifying questions if requirements are vague.
2.  **Create Feature Document:**
    *   Create a file named `FEATURE_[NAME].md` (e.g., `FEATURE_BEACON.md`).
    *   Include:
        *   **Description:** High-level summary.
        *   **Progress:** Tracking percentage (Start at 0%).
        *   **Tasks Status:** Breakdown of specific tasks (Total/Completed/In Progress).
        *   **Implementation Plan:** Detailed technical steps (Backend, Frontend, Integration).
3.  **Create Artifacts:**
    *   Initialize `implementation_plan.md` (Artifact) for the specific technical approach.
    *   Update `task.md` (Artifact) with the checklist from your feature document.
4.  **User Approval:**
    *   Present the plan to the user and await approval before writing code.
5.  **Double-Check Logic (Critical):**
    *   Review your plan for logical holes, edge cases, or race conditions.
    *   *Ask yourself:* "What happens if the user is offline? What if this field is null? Is this secure?"
    *   Ensure the data flow makes sense before writing a single line of code.

## Phase 2: Backend Implementation (Convex/DB) 🛠️
**Goal:** Build the data foundation first.

1.  **Schema Design:**
    *   Modify `convex/schema.ts` to add necessary tables or fields.
    *   Ensure data types are strict and correct.
2.  **API Logic:**
    *   Create or update files in `convex/` (e.g., `convex/myVariable.ts`).
    *   Implement necessary **Mutations** (create, update, delete) and **Queries** (read).
    *   *Self-Correction:* Check for missing exports or logic errors immediately.

## Phase 3: Frontend Implementation 🧩
**Goal:** Create a polished, responsive user interface.

1.  **State Management:**
    *   Create custom hooks (e.g., `hooks/useMyFeature.ts`) to bridge backend queries/mutations with UI.
2.  **Component Creation:**
    *   Create isolated UI components in `src/components/`.
    *   **Design Rule:** Use "Pro Max" aesthetics—Tailwind, glassmorphism, smooth animations. No basic designs.
    *   *Check:* Do imports exist? (e.g., icons, UI primitives like `Avatar`). Install dependencies if missing.
3.  **Integration:**
    *   Add components to the relevant pages or layouts (e.g., `DashboardLayout`, `Settings`).

## Phase 4: Polish & Localization 🌍
**Goal:** Ensure the feature feels native and complete.

1.  **Translations:**
    *   Add keys to `src/locales/en.json`.
    *   Add matching keys to other languages (e.g., `src/locales/pl.json`).
    *   Use `useTranslation` hook in components.
2.  **Settings & Privacy:**
    *   If applicable, add configuration options to the Settings page.

## Phase 5: Verification & Documentation ✅
**Goal:** Prove it works and document the result.

1.  **Fix Build Errors:**
    *   Run or check the dev server (`npm run dev`).
    *   Resolve any missing dependencies (e.g., `npm install date-fns`) or syntax errors.
2.  **Browser Verification (Crucial):**
    *   Use the **Browser Subagent** to test the feature.
    *   Steps:
        *   Navigate to the page.
        *   Interact with the feature (Click buttons, toggle switches).
        *   Verify state changes in the UI.
        *   **Capture a Screenshot** of the success state.
3.  **Update Documentation:**
    *   Update `FEATURE_[NAME].md` progress to 100%.
    *   Create or update `walkthrough.md` (Artifact).
    *   Embed the verification screenshot in the walkthrough.

## Phase 6: Handoff 👋
1.  **Notify User:**
    *   Inform the user of completion.
    *   Link to the `walkthrough.md` and `FEATURE_[NAME].md`.
    *   Provide a brief summary of what was built and verified.
