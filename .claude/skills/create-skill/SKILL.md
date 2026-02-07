---
name: create-skill
description: Meta-skill that guides through a rigorous process for creating high-quality workflow and skill files
disable-model-invocation: true
argument-hint: "[skill name or domain]"
---

# Skill Creator

A meta-workflow for producing other `.claude/skills/` skill files. A poorly written skill produces poor results at scale — every ambiguity compounds across every invocation. This skill enforces a rigorous creation process so that every new skill meets a high quality bar. The deliverable is a single `SKILL.md` file with YAML frontmatter, placed in `.claude/skills/<skill-name>/`.

## When to Use This Skill

- User asks to create a new skill
- User asks to improve or refactor an existing skill
- User wants to formalize a repeated process into a reusable skill
- Agent identifies a recurring pattern that should be codified

---

## The Canonical Skill Anatomy

Every skill file MUST follow this structure. Use this as a blueprint when writing.

### 1. YAML Frontmatter (Required)

```yaml
---
name: skill-name
description: One-line summary of what the skill does and its scope
---
```

- `name`: lowercase, hyphens, max 64 characters
- `description`: under 120 characters, format: "[Verb phrase] for [domain/context]"
- Optional fields: `disable-model-invocation`, `user-invocable`, `argument-hint`, `allowed-tools`, `context`, `agent`

### 2. Title and Summary (Required)

- H1 heading (`#`) with the skill name
- 1-3 sentence paragraph stating: what problem it solves, who it is for, what it produces

### 3. Prerequisites (If Applicable)

- Tools, dependencies, or context needed before starting
- Include verification commands where possible

### 4. Workflow Phases (Required)

- Use `## Phase N: Name` for major stages
- Each phase MUST open with a `**Goal:**` statement (one bold sentence)
- Numbered steps with actionable sub-bullets
- Self-correction prompts at decision points: *Ask yourself: [specific question]*
- Concrete file paths, commands, or artifact names — never vague references

### 5. Reference Tables (Required for skills with 4+ categories)

- Markdown tables for any lookup data
- Column patterns: `| Scenario | Action | Example |` or `| Rule | Do | Don't |`

### 6. Example Walkthrough (Required)

- A complete, realistic scenario applied end-to-end
- Use actual user input, not placeholder text
- Show intermediate decisions, not just the final result
- Must exercise at least 80% of the defined phases

### 7. Anti-Patterns (Required)

- Table of common mistakes: `| What agents do wrong | Why it fails | Do this instead |`
- Minimum 5 entries

### 8. Pre-Delivery Checklist (Required)

- Markdown checkboxes (`- [ ]`) grouped by category
- Every item must be verifiable (yes/no), not subjective

### 9. Tips (Recommended)

- 3-6 numbered practical tips for getting the best results from the skill

### Structure Sizing Guide

| Skill Complexity | Phases | Length | Tables | Checklists |
|---|---|---|---|---|
| Simple (single task) | 3-4 | 60-100 lines | 0-1 | 1 |
| Standard (multi-step process) | 4-6 | 100-200 lines | 1-3 | 1-2 |
| Comprehensive (full domain) | 5-7 | 200-350 lines | 3-6 | 2-4 |

---

## Phase 1: Requirements Gathering

**Goal:** Deeply understand the domain and scope before writing anything.

1. **Identify the domain** — What area does this skill address? (e.g., testing, deployment, code review, design, data modeling)
2. **Define the trigger** — Under what circumstances should this skill be activated?
3. **Define the deliverable** — What concrete output does following this skill produce? (e.g., a PR, a design file, a test suite)
4. **Set scope boundaries** — Explicitly state what this skill does NOT cover. Unbounded skills are low-quality skills.
5. **Check for overlap** — Read all files in `.claude/skills/` to avoid duplicating existing skills. Reference rather than repeat.

*Ask yourself: "Can I describe the skill's purpose in one sentence? If not, the scope is too broad — split it."*

## Phase 2: Domain Research

**Goal:** Become an expert in the domain before writing instructions.

1. **Study the codebase** — Read `CLAUDE.md`, relevant source files, and existing patterns.
2. **Identify the current process** — How is this task done today? What steps does someone take manually?
3. **Find pain points** — Where do mistakes happen? What gets skipped? What takes the longest?
4. **Collect concrete examples** — Gather 2-3 real instances of this task from git history, existing files, or user description.
5. **Identify decision points** — Where does the agent need judgment? These become self-correction prompts.
6. **Map the artifact chain** — What files are read, created, or modified? In what order?

*Ask yourself: "Do I understand this domain well enough to list the 5 most common mistakes? If not, research more."*

## Phase 3: Structure Design

**Goal:** Design the skeleton of the skill before writing content.

1. **Choose the phase count** — Most skills need 3-7 phases. Fewer than 3 means the skill should be a checklist. More than 7 means it should be split.
2. **Name each phase** — Use the pattern `Phase N: Verb Phrase` (e.g., "Phase 3: Frontend Implementation"). The name must communicate the activity without reading details.
3. **Write goal statements first** — Write the one-sentence `**Goal:**` for every phase before writing any steps. If you cannot write a clear goal, the phase is not well-defined.
4. **Identify table candidates** — Any list of 4+ items with consistent attributes should be a table.
5. **Identify checklist candidates** — Any set of verification criteria should be checkboxes.
6. **Plan the example walkthrough** — Choose a realistic scenario now. It should exercise at least 80% of the phases.

*Ask yourself: "If I delete any one phase, does the skill still produce a correct result? If yes, that phase is unnecessary."*

## Phase 4: Content Creation

**Goal:** Write the skill following the Canonical Skill Anatomy.

1. **Write frontmatter and title** — Get the `name` and `description` right first. If you cannot summarize the skill in one sentence, the scope is wrong. Go back to Phase 1.
2. **Write phases in order** — Each phase should be self-contained enough that an agent could resume from any phase if interrupted.
3. **Write steps as imperatives** — "Create the schema file" not "The schema file should be created."
4. **Embed specificity** — Every step must reference concrete file paths, commands, or decision criteria. No step should say "use best practices" or "as appropriate."
5. **Add self-correction prompts** — At every decision point, add: *Ask yourself: [specific verification question]*
6. **Write reference tables** — Use `| Rule | Do | Don't |` for anti-patterns. Use `| Scenario | Action | Example |` for decision guides.
7. **Write the example walkthrough** — Walk through the chosen scenario step by step, showing actual commands, file contents, or decisions at each phase.
8. **Write the pre-delivery checklist** — Every quality claim in the skill should have a corresponding checkbox.
9. **Write anti-patterns last** — By this point you will have discovered common mistakes through the writing process itself.

### Writing Quality Rules

| Rule | Good | Bad |
|---|---|---|
| Imperative voice | "Run the test suite" | "The test suite should be run" |
| Specific file paths | "Edit `convex/schema.ts`" | "Edit the schema file" |
| Concrete criteria | "Response time under 200ms" | "Should be fast" |
| Bounded scope | "Covers API endpoints only" | "Covers the backend" |
| Actionable steps | "Add index on `userId` field" | "Optimize the database" |
| Verifiable items | "All queries have indexes" | "Performance is acceptable" |

## Phase 5: Quality Validation

**Goal:** Verify the skill meets all standards before delivery.

1. **Structure check** — Walk through the Canonical Skill Anatomy section above. Confirm every required element is present.
2. **Specificity audit** — Read every step. If any step could apply to any project generically, it is too vague. Rewrite it.
3. **The "New Agent" test** — Imagine an agent that has never seen this codebase. Could it follow this skill start-to-finish and produce a correct result? If not, add context.
4. **Anti-pattern coverage** — For every "Do" instruction, ask: "What would an agent do wrong here?" If the wrong thing is non-obvious, add it to anti-patterns.
5. **Example completeness** — Does the walkthrough touch every phase? Does it show at least one decision point?
6. **Checklist completeness** — Is every quality claim backed by a checklist item?
7. **Length check** — Is the skill within the recommended range for its complexity (see Structure Sizing Guide)?

## Phase 6: Delivery and Integration

**Goal:** Place the skill correctly and confirm it is discoverable.

1. **Create the directory** — `mkdir -p .claude/skills/[skill-name]`. Name should be 2-4 words in kebab-case communicating the domain.
2. **Save the file** — Write to `.claude/skills/[skill-name]/SKILL.md`.
3. **Verify frontmatter** — Confirm the YAML parses correctly (`name` and `description` fields at minimum).
4. **Cross-reference check** — If the skill references other skills, verify those paths exist.
5. **Inform the user** — Summarize what was created, its purpose, and how to invoke it with `/skill-name`.

---

## Example Walkthrough: Creating a "Code Review" Skill

**User request:** "Create a skill that guides agents through thorough code reviews on PRs in this project."

### Phase 1 Output

- **Domain:** Code review for TanStack Start + Convex PRs
- **Trigger:** User asks for a PR review or posts a PR link
- **Deliverable:** Structured review comments (architecture, implementation, testing)
- **Scope boundaries:** Does NOT cover automated linting (handled by `npm run check`), does NOT cover deployment
- **Overlap check:** No existing review skill in `.claude/skills/`

### Phase 2 Output

- Studied `CLAUDE.md` — found conventions: Prettier (no semis, single quotes), strict TypeScript, Convex validators, normalized friendship IDs
- Current process: manual review with no checklist
- Pain points: reviewers miss Convex-specific issues (missing indexes, no `getAuthUserId` checks)
- Decision points: when to request changes vs. approve, how deep to review generated files

### Phase 3 Output

Skeleton designed with 5 phases:
1. Context Gathering (read PR diff, understand scope)
2. Architecture Review (data model, API design, routing)
3. Implementation Review (code quality, Convex patterns, security)
4. Testing Assessment (coverage, edge cases)
5. Review Delivery (structured comments, verdict)

### Phase 4 Output (snippet of one phase)

```markdown
## Phase 3: Implementation Review
**Goal:** Verify code correctness, security, and adherence to project conventions.

1. **Convex function checks:**
   - Every mutation/query that accesses user data calls `getAuthUserId(ctx)` at the top
   - New database queries have matching indexes in `convex/schema.ts`
   - Validators use strict types (`v.string()`, not `v.any()`)
2. **Frontend checks:**
   - Components use `@/` path alias for imports
   - Forms use react-hook-form + zod validation
   - Translation keys added to both `src/locales/en.json` and `src/locales/pl.json`
```

### Phase 5 Output

Applied quality validation — found Phase 4 was missing a self-correction prompt. Added: *Ask yourself: "Are there any new database queries without indexes?"*

### Phase 6 Output

Directory created at `.claude/skills/code-review/`. File saved as `SKILL.md`. User notified with summary and `/code-review` invocation command.

---

## Anti-Patterns in Skill Creation

| Anti-Pattern | Why It Fails | Do This Instead |
|---|---|---|
| **Vague steps** ("follow best practices") | Agent has no concrete action to take | Specify exact actions, files, commands |
| **Unbounded scope** ("covers everything about testing") | Skill becomes too long, agents skip sections | Define explicit boundaries, split if needed |
| **No example walkthrough** | Agents misinterpret abstract instructions | Include one end-to-end scenario |
| **Wall of prose** | Agents lose context in long paragraphs | Use tables, lists, and checklists |
| **Missing anti-patterns** | Agents repeat the same mistakes | Document at least 5 common mistakes |
| **No checklist** | No way to verify output quality | Add verifiable pre-delivery checklist |
| **Generic advice** ("write clean code") | Adds no value over general knowledge | Every instruction must be specific to the domain |
| **Too many phases** (>7) | Cognitive overload, agents lose the thread | Merge related phases or split into separate skills |
| **No goal statements** | Agent does not understand a phase's purpose | Every phase opens with bold one-sentence Goal |
| **Passive voice** ("the file should be created") | Ambiguous about who acts | Use imperative: "Create...", "Run...", "Verify..." |

---

## Pre-Delivery Checklist for New Skills

### Structure
- [ ] YAML frontmatter has `name` and `description` fields
- [ ] Description is under 120 characters and communicates purpose
- [ ] H1 title present and matches the skill name
- [ ] Opening summary explains problem, audience, and deliverable
- [ ] Phases use `## Phase N: Name` headings
- [ ] Every phase has a bold `**Goal:**` statement

### Content Quality
- [ ] Every step uses imperative voice
- [ ] No step contains vague language ("best practices", "as appropriate", "consider")
- [ ] File paths, commands, and artifact names are concrete
- [ ] Self-correction prompts exist at key decision points
- [ ] Scope boundaries are explicitly stated

### Reference Material
- [ ] Tables used for lookup data with 4+ entries
- [ ] Anti-patterns section exists with at least 5 entries
- [ ] At least one complete example walkthrough included
- [ ] Example exercises at least 80% of defined phases

### Completeness
- [ ] Pre-delivery checklist exists with verifiable items
- [ ] Checklist items grouped by category
- [ ] Skill length matches complexity (see Structure Sizing Guide)
- [ ] A new agent with no prior context could follow start-to-finish

### Integration
- [ ] Directory named in kebab-case: `.claude/skills/[skill-name]/`
- [ ] `SKILL.md` placed in the skill directory
- [ ] Cross-references to other skills use correct paths
- [ ] No duplicate coverage with existing skills

---

## Tips for Creating Effective Skills

1. **Write the checklist first** — If you know what "done" looks like, the phases write themselves.
2. **Steal structure from existing skills** — Read `.claude/skills/implement-feature/SKILL.md` and `.claude/skills/ui-ux/SKILL.md` before starting. Match the formatting conventions already established.
3. **One skill, one job** — A skill that tries to do two things does neither well. If you find yourself writing Phase 8, split into two skills.
4. **Anti-patterns are more valuable than instructions** — Agents know how to follow steps. What they don't know is what to avoid. Invest heavily in the anti-patterns section.
5. **Concrete beats comprehensive** — A skill with 5 specific steps beats one with 20 generic steps. When in doubt, be more specific and less complete.
6. **Test with the "delete a phase" heuristic** — For each phase, ask: "If I removed this, would the skill still produce a correct result?" If yes, the phase is not necessary.
