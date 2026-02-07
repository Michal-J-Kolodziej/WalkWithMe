---
name: visual-audit
description: Comprehensive visual audit of the web application in the browser to identify and report UI/UX bugs.
argument-hint: '[scope: full | quick | mobile | desktop | specific-page]'
---

# Visual Audit & Quality Assurance

A systematic process for visually inspecting the running application in a browser to catch layout shifts, spacing issues, responsiveness bugs, and interactive state failures that static code analysis might miss.

## When to Use This Skill

- After significant UI changes or refactors.
- When the user reports "it looks weird" without specific details.
- Before a major release or milestone.
- To verify that implemented features match the design system visually.

## Prerequisites

1.  **App Running**: Ensure the development server is running (`npm run dev` or equivalent).
2.  **Console Check**: Check the terminal for any build errors.
3.  **Browser Tool**: You will use `open_browser_url` to inspect the app.

---

## Phase 1: Setup & Environment

**Goal:** Prepare the browser environment for a consistent audit.

1.  **Open the App**: Use `open_browser_url` to navigate to the local server (usually `http://localhost:5173` or `http://localhost:3000`).
2.  **Define Viewports**:
    -   **Mobile Integration**: 375x812 (iPhone X/12/13 mini range) - *Critical for responsiveness*
    -   **Desktop Standard**: 1440x900 (Common laptop) - *Critical for layout stability*
    -   **Tablet/Narrow**: 768x1024 (iPad vertical) - *Check for awkward wrapping*

---

## Phase 2: The Audit Workflow

**Goal:** systematically traverse the application and identify issues.

### 1. Global Layout Scan (The "Squint Test")
*Check these on every page you visit.*

-   **Horizontal Scroll**: Is there unwanted horizontal scrolling on mobile? (Common culprit: fixed width elements).
-   **Sticky Elements**: Do headers/footers obscure content? Do they jump when scrolling?
-   **Loading States**: Reload the page. Do you see a skeleton or spinner? Is there a "Flash of Unstyled Content" (FOUC)?
-   **Broken Assets**: Are any images or icons failing to load (alt text visible)?

### 2. Component-Level Visual Checklist
*Reference the `style-audit` skill for canonical values.*

#### A. Spacing & Rhythm
-   **Margins**: Are elements touching the screen edges? (Should usually have `mx-4` or `p-4` min on mobile).
-   **Padding**: Do cards feel cramped? (Content should breathe).
-   **Consistency**: Is the space between the header and the first element consistent across pages?

#### B. Typography & Text
-   **Hierarchy**: Is the H1 clearly larger than H2?
-   **Contrast**: Is grey text readable on the background?
-   **Truncation**: Does long text break the layout or truncate gracefully with `...`?
-   **Line Height**: Is body text readable (not too tight)?

#### C. Interactive States
-   **Hover**: Do buttons/cards change state on hover (desktop)?
-   **Active/Press**: Is there visual feedback when clicking?
-   **Cursor**: Does the cursor change to a pointer on clickable elements?
-   **Focus**: Tab through the page. Is there a visible focus ring?

#### D. The Glassmorphism Check (App Specific)
-   **Legibility**: Is text readable over the blurry background?
-   **Contrast**: Is the background too transparent or too opaque?
-   **Dark Mode**: Switch to dark mode (if available/system preference) and check for blinding white backgrounds or invisible text.

---

## Phase 3: Reporting Issues

**Goal:** Document findings in a structured way so they can be fixed.

1.  **Create/Update Report**: Create a file named `VISUAL_AUDIT.md` in the root directory.
2.  **Format**:

```markdown
# Visual Audit Report - [Date]

## Summary
Brief overview of the state of the app (e.g., "Mobile looks good, but Desktop Dashboard has layout shifts").

## Issues Log

| ID | Page/Component | Viewport | Severity | Issue Description | Suggested Fix |
|----|---------------|----------|----------|-------------------|---------------|
| 01 | Dashboard/Stats| Mobile   | Major    | Stat cards overflow screen width | Add `flex-wrap` or `overflow-x-auto` |
| 02 | Profile/Avatar | All      | Minor    | Avatar is not a perfect circle | Add `aspect-square` or check image aspect ratio |
| 03 | Nav/Sidebar    | Desktop  | Cosmetic | Glass blur effect missing | Add `backdrop-blur-md` class |
```

**Severity Scale**:
-   **Critical**: App crashes, functionality blocked, content inaccessible.
-   **Major**: Significant layout break, overlapping text, usable but confusing.
-   **Minor**: Inconsistent spacing, wrong icon size, typo.
-   **Cosmetic**: "Looks slightly off", sub-optimal animation.

---

## Phase 4: Remediation (Fixing)

**Goal:** Fix the reported bugs without breaking other things.

### Rules of Engagement
1.  **Verify First**: Reproduce the issue in the browser before touching code.
2.  **Search Globally**: Before changing a shared component, search where else it is used.
3.  **Canonical Standards**: Refer to `.agent/skills/style-audit/SKILL.md` for the correct values (colors, spacing, etc.).
4.  **Mobile First**: Fix for mobile first, then check if desktop needs a `md:` or `lg:` override.

### Fix Workflow
1.  **Identify Component**: Use the React DevTools or simple grep to find the file.
2.  **Apply Fix**:
    -   *Spacing*: formatting `p-4` -> `p-5`?
    -   *Layout*: `flex-row` -> `flex-col md:flex-row`?
    -   *Contrast*: `text-gray-400` -> `text-muted-foreground`?
3.  **Verify**: Check the browser again. Check BOTH mobile and desktop viewports.
4.  **Mark Resolved**: Update `VISUAL_AUDIT.md` to showing the item as fixed (or strike-through).

---

## Example Scenario: "The Button is unreadable on mobile"

1.  **Observe**: Open browser to mobile view. See that "Save Changes" button text is dark grey on a dark background.
2.  **Inspect**: See it has `bg-primary/10 text-primary-foreground`.
3.  **Check Standards**: `style-audit` says Primary actions should be `bg-primary text-primary-foreground`.
4.  **Fix**: Update the class string.
5.  **Verify**: Check browser. Text is now white on orange (readable).
6.  **Report**: Log in `VISUAL_AUDIT.md` as fixed.

