---
name: project-manager
description: Multi-agent project management with backend/frontend developers and tester
argument-hint: '[command: init|status|add-task|assign|run-backend|run-frontend|run-tester|review|continue|rollback|list|pause|sprint|archive|chat]'
---

# Project Manager — Multi-Agent Orchestration System

A coordinator-specialist workflow where the Project Manager orchestrates Backend Developer, Frontend Developer, and Tester agents through file-based async communication. Each agent has a dedicated workspace file and communicates via a shared project chat.

## Quick Reference

| Command | Description |
|---------|-------------|
| `init [name]` | Initialize project workspace |
| `status` | Report project status with metrics and recommendations |
| `add-task [desc]` | Add task to backlog (supports AC, priority, estimate, security flag) |
| `list [filter]` | List tasks (all, backlog, active, mine, blocked) |
| `assign [id] [agent]` | Assign task to developer |
| `run-backend` | Execute backend workflow |
| `run-frontend` | Execute frontend workflow |
| `run-tester` | Execute tester workflow (functional + security + performance) |
| `review` | Review test results, sign off or assign fixes |
| `continue` | Resume interrupted work |
| `pause` | Pause current work, save state |
| `rollback [id]` | Revert failed implementation |
| `sprint [cmd]` | Manage sprints (start, close, report) |
| `archive` | Archive completed tasks and clean up |
| `chat [msg]` | Post to project chat |

---

## Architecture

```
PROJECT_MANAGEMENT/
├── PROJECT_MANAGER.md         # Task board, agent status, decisions, metrics
├── BACKEND_DEVELOPER.md       # Backend workspace
├── FRONTEND_DEVELOPER.md      # Frontend workspace
├── TESTER.md                  # Test plans, bug reports
├── PROJECT_CHAT.md            # Cross-agent communication log
└── ARCHIVE/                   # Completed sprint archives
    └── sprint-N.md
```

### Agent Roles

| Agent | File | Responsibilities |
|-------|------|------------------|
| **Project Manager** | `PROJECT_MANAGER.md` | Orchestrate, assign, track, review, unblock, report |
| **Backend Developer** | `BACKEND_DEVELOPER.md` | Schema, queries, mutations, server logic, security |
| **Frontend Developer** | `FRONTEND_DEVELOPER.md` | Components, hooks, routes, translations, a11y |
| **Tester** | `TESTER.md` | Functional, security, performance, regression tests |

### Task States

```
Backlog → Assigned → Planning → Implementing → Ready-for-Test → Testing → [Bug-Fixing →] Completed
    ↓                    ↓            ↓              ↓            ↓              ↓
 Paused ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
    ↓
 Blocked → (unblocked) → returns to previous state
    ↓
 Cancelled (with reason)
```

| State | Description |
|-------|-------------|
| `Backlog` | Task defined but not started |
| `Assigned` | Developer assigned, not yet started |
| `Planning` | Developer writing implementation plan |
| `Implementing` | Code being written |
| `Ready-for-Test` | Implementation complete, awaiting tester |
| `Testing` | Tester executing test plan |
| `Bug-Fixing` | Developer fixing reported bugs |
| `Completed` | All tests pass, task signed off |
| `Paused` | Work suspended, can resume later |
| `Blocked` | Cannot proceed, waiting on dependency |
| `Cancelled` | Task abandoned (with reason logged) |

### Priority Levels

| Priority | Label | SLA | Description |
|----------|-------|-----|-------------|
| P0 | Critical | Immediate | Production down, data loss, security breach |
| P1 | High | Same day | Core feature broken, blocking users |
| P2 | Medium | This sprint | Standard feature work |
| P3 | Low | Backlog | Nice-to-have, polish, tech debt |

### Task Flags

| Flag | Meaning |
|------|---------|
| `🔒 security` | Requires security review and testing |
| `⚡ performance` | Requires performance testing |
| `♿ a11y` | Requires accessibility testing |
| `📱 mobile` | Requires mobile responsiveness testing |

---

## Command: `init [project-name]`

Initialize a new project management workspace.

### Steps

1. **Check if workspace exists**
   - If `PROJECT_MANAGEMENT/` exists, ask: "Workspace exists. Options: (1) Overwrite, (2) Archive and create new, (3) Cancel"

2. **Create directory structure**
   ```bash
   mkdir -p PROJECT_MANAGEMENT/ARCHIVE
   ```

3. **Create all workspace files** from templates

4. **Initialize git branch** (optional)
   - Suggest: `git checkout -b feature/[project-name]`

5. **Log initialization**
   ```
   [datetime] @ProjectManager: Project "[project-name]" initialized. Sprint 1 started.
   ```

6. **Report to user**
   ```
   ✓ Project "[project-name]" initialized.

   Files created:
   - PROJECT_MANAGEMENT/PROJECT_MANAGER.md
   - PROJECT_MANAGEMENT/BACKEND_DEVELOPER.md
   - PROJECT_MANAGEMENT/FRONTEND_DEVELOPER.md
   - PROJECT_MANAGEMENT/TESTER.md
   - PROJECT_MANAGEMENT/PROJECT_CHAT.md
   - PROJECT_MANAGEMENT/ARCHIVE/

   Sprint 1 started. Use `/project-manager add-task` to add work.
   ```

---

## Command: `status`

Report project status with metrics, stale detection, and smart recommendations.

### Steps

1. **Verify workspace exists**

2. **Read all workspace files**

3. **Detect stale work**
   - Task in progress > 24h without update → flag as stale
   - Blocked task > 4h without resolution → escalate
   - Test results > 2h without review → remind

4. **Calculate metrics**
   - Sprint progress: X/Y tasks (Z%)
   - Velocity: tasks/day average
   - Bug rate: bugs found per task
   - Estimation accuracy: actual vs estimated

5. **Generate smart recommendations**
   - If blocked tasks: "Unblock TASK-XXX first"
   - If testing ready: "Run tester next"
   - If bugs pending: "Fix BUG-XXX (high severity)"
   - If sprint ending: "X tasks remaining, Y days left"

6. **Compile report**
   ```markdown
   ## Project Status — [Project Name]

   ### Sprint Progress
   Sprint 2: 3/5 tasks completed (60%)
   Days remaining: 2 | Velocity: 1.5 tasks/day

   ### Task Summary
   | State | Count | Stale |
   |-------|-------|-------|
   | Backlog | 2 | - |
   | In Progress | 1 | ⚠️ 1 |
   | Testing | 1 | - |
   | Completed | 3 | - |

   ### Agent Status
   | Agent | Task | State | Progress | Last Update | Stale? |
   |-------|------|-------|----------|-------------|--------|
   | Backend | TASK-004 | Implementing | 60% | 26h ago | ⚠️ Yes |
   | Frontend | - | Idle | - | - | - |
   | Tester | TASK-003 | Testing | 80% | 1h ago | - |

   ### Blockers (1)
   - BLOCKER-001: Waiting for API spec (TASK-004) — High urgency, 6h old

   ### Recommendations
   1. ⚠️ TASK-004 is stale (26h). Check on Backend Developer.
   2. 🔍 TASK-003 testing almost done. Prepare for review.
   3. 📋 2 tasks in backlog ready for assignment.

   ### Metrics
   | Metric | This Sprint | All Time |
   |--------|-------------|----------|
   | Tasks Completed | 3 | 12 |
   | Bugs Found | 5 | 23 |
   | Bugs Fixed | 4 | 22 |
   | Avg Estimation Accuracy | 85% | 78% |
   ```

---

## Command: `add-task [description]`

Add a new task to the backlog with full metadata.

### Syntax

```
/project-manager add-task "Description | AC: criteria | P1 | estimate:3 | security | depends:TASK-001"
```

### Supported Modifiers

| Modifier | Format | Example |
|----------|--------|---------|
| Acceptance Criteria | `\| AC: ...` | `\| AC: User can save notes` |
| Priority | `\| P0-P3` | `\| P1` |
| Estimate (hours) | `\| estimate:N` | `\| estimate:4` |
| Security flag | `\| security` | `\| security` |
| Performance flag | `\| performance` | `\| performance` |
| Accessibility flag | `\| a11y` | `\| a11y` |
| Dependency | `\| depends:ID` | `\| depends:TASK-001` |

### Steps

1. **Parse description** and extract modifiers

2. **Determine task type**
   - `backend` — schema, query, mutation, API, server, auth
   - `frontend` — component, UI, route, translation, hook, style
   - `fullstack` — both or unclear

3. **Generate Task ID**: TASK-{max + 1}

4. **Apply defaults**
   - Priority: P2
   - Estimate: 2 hours
   - Flags: none

5. **Update PROJECT_MANAGER.md backlog**
   ```markdown
   | TASK-XXX | [description] | [type] | P2 | 2h | - | [flags] | [AC] |
   ```

6. **Log and report**

### Enhanced Backlog Table

```markdown
| ID | Description | Type | Priority | Est | Depends | Flags | AC |
|----|-------------|------|----------|-----|---------|-------|-----|
| TASK-001 | Add walk notes | fullstack | P2 | 4h | - | 🔒 | User can add/edit notes |
```

---

## Command: `list [filter]`

List tasks with optional filtering.

### Filters

| Filter | Shows |
|--------|-------|
| `all` | All tasks (default) |
| `backlog` | Backlog only |
| `active` | In Progress + Testing |
| `mine` | Tasks assigned to current agent |
| `blocked` | Blocked tasks |
| `stale` | Tasks without updates > 24h |
| `P0` / `P1` | By priority |
| `security` | Security-flagged tasks |

### Output

```markdown
## Task List (filter: active)

| ID | Description | Assigned | State | Progress | Priority |
|----|-------------|----------|-------|----------|----------|
| TASK-003 | Add walk notes | Backend | Implementing | 60% | P2 |
| TASK-004 | Notes UI | Frontend | Waiting | 0% | P2 |

3 tasks in backlog, 2 active, 5 completed
```

---

## Command: `assign [task-id] [agent]`

Assign a task to a developer.

### Args
- `task-id`: Task identifier (e.g., TASK-001)
- `agent`: `backend`, `frontend`, or `both`

### Steps

1. **Validate task exists** in Backlog

2. **Check dependencies**
   - If depends on incomplete task: warn but allow override

3. **Check agent availability**
   - If busy: offer to pause current task or reassign

4. **For fullstack (`both`)**
   - Assign Backend first
   - Set Frontend status: "Waiting for Backend (TASK-XXX)"
   - Frontend auto-activates when backend completes

5. **Initialize estimation tracking**
   - Record start time
   - Note estimated hours

6. **Update workspace and log**

### Git Integration (Optional)

Suggest creating feature branch:
```
git checkout -b task/TASK-XXX-[short-description]
```

---

## Command: `run-backend`

Execute the Backend Developer workflow.

### Prerequisites Check

1. Verify task assigned
2. Check state is valid (Assigned, Planning, Implementing, Bug-Fixing)
3. If Paused, resume from saved state

### Phase 1: Study (State: Planning)

1. **Update state and start timer**

2. **Read existing code**
   - `convex/schema.ts` — current data model
   - Related `convex/*.ts` — patterns and exports
   - `convex/authHelpers.ts` — auth patterns

3. **Security check** (if 🔒 flagged)
   - Identify auth requirements
   - Note sensitive data handling
   - Plan input validation

4. **Identify patterns**
   ```
   ✓ getAuthUserId(ctx) at top of handlers
   ✓ .withIndex() for filtered queries
   ✓ No semicolons, single quotes, trailing commas
   ✓ Error handling: throw new Error('message')
   ✓ Input validation for user data
   ```

### Phase 2: Plan

1. **Write Implementation Plan**:
   ```markdown
   ## Implementation Plan

   ### Schema Changes
   - [ ] Add `notes` field (v.optional(v.string())) to `walks` table
   - [ ] Add index `by_date` on `walks.startTime`

   ### Queries
   - [ ] `getWalkNotes(walkId)` → string | null
         - Checks ownership before returning

   ### Mutations
   - [ ] `updateWalkNotes(walkId, notes)` → void
         - Validates walkId exists
         - Checks ownership
         - Sanitizes notes input

   ### Security Considerations
   - [ ] Ownership check prevents accessing other users' walks
   - [ ] Notes length limited to prevent abuse

   ### Files to Modify
   - [ ] `convex/schema.ts` — add field and index
   - [ ] `convex/walks.ts` — add query and mutation
   ```

2. **Update progress**: 20%

### Phase 3: Verify Plan

1. **Run Logic Verification Checklist**:
   - [ ] No naming conflicts with existing exports
   - [ ] All queried fields have indexes in schema
   - [ ] All mutations check `getAuthUserId(ctx)`
   - [ ] Data flow traced: mutation → DB → query → frontend
   - [ ] Edge cases: empty string, null, deleted walk
   - [ ] Error messages clear and helpful

2. **Security Verification** (if 🔒 flagged):
   - [ ] Auth checks cannot be bypassed
   - [ ] Input is validated/sanitized
   - [ ] No sensitive data in error messages
   - [ ] Rate limiting considered if needed

3. **Update state**: `Verified`, progress: 30%

### Phase 4: Implement

1. **Update state** to `Implementing`

2. **For each planned change**:
   - Make the code change
   - Log progress with timestamps
   - Update progress incrementally

3. **Run verifications**:
   ```bash
   npx convex dev          # Types compile
   npm run check           # Lint/format
   npm run build           # Build passes
   ```

4. **Update progress**: 90%

### Phase 5: Complete

1. **Final verification**

2. **Update Completion Report** with:
   - Files changed with descriptions
   - Build status
   - Security notes (if applicable)
   - Estimated vs actual time
   - Notes for tester

3. **Git commit** (suggested):
   ```
   git add [files]
   git commit -m "feat(TASK-XXX): [description]

   - Added [changes]
   - [security notes if applicable]"
   ```

4. **Update PROJECT_MANAGER.md and chat**

---

## Command: `run-frontend`

Execute the Frontend Developer workflow.

### Prerequisites Check

1. Verify task assigned
2. Check backend dependency if exists
3. If backend not complete: "Waiting for backend. TASK-XXX is [state]."

### Phase 1: Study (State: Planning)

1. **Update state and start timer**

2. **Read existing code**
   - Similar components in `src/components/`
   - Related hooks in `src/hooks/`
   - Translation structure in `src/locales/`

3. **Verify backend API exists**
   - Check `convex/*.ts` for expected queries/mutations
   - Verify types match expected usage

4. **Accessibility check** (if ♿ flagged)
   - Review existing a11y patterns
   - Plan keyboard navigation
   - Plan screen reader support

### Phase 2: Plan

1. **Write Implementation Plan** with:
   - Hooks (with Convex bindings)
   - Components (with props and purpose)
   - Routes (if any)
   - Translations (both locales)
   - Accessibility features

2. **Update progress**: 20%

### Phase 3: Verify Plan

1. **Run Logic Verification Checklist**:
   - [ ] Backend API exists
   - [ ] Component hierarchy correct
   - [ ] Data flows properly
   - [ ] All imports resolve
   - [ ] Styling matches patterns
   - [ ] Translations in both locales
   - [ ] Forms use react-hook-form + zod
   - [ ] Icons from lucide-react only

2. **Accessibility Verification** (if ♿ flagged):
   - [ ] Keyboard navigation planned
   - [ ] ARIA labels defined
   - [ ] Focus management planned
   - [ ] Color contrast sufficient

3. **Update state**: `Verified`, progress: 30%

### Phase 4: Implement

1. **Implementation order**:
   1. Hooks (data layer)
   2. Components (UI layer)
   3. Integration into routes
   4. Translations
   5. Accessibility features

2. **Run verifications** after each file

3. **Update progress**: 90%

### Phase 5: Complete

1. **Final verification**

2. **Update Completion Report**

3. **Git commit** (suggested)

4. **Update PROJECT_MANAGER.md and chat**

---

## Command: `run-tester`

Execute comprehensive testing workflow.

### Prerequisites Check

1. Find tasks with "Ready for Testing: Yes"
2. If none: "No tasks ready for testing."

### Phase 1: Gather Context

1. **Update TESTER.md assignment**

2. **Read developer workspaces**
   - What was implemented
   - Security considerations
   - Accessibility features
   - Performance concerns

3. **Read acceptance criteria**

4. **Check task flags** for required test types

### Phase 2: Verify Environment

```bash
curl http://localhost:5173     # Dev server
npx convex dev --once          # Convex types
npm run build                  # Build
```

### Phase 3: Create Test Plan

#### Functional Tests (Always)

```markdown
### Happy Path Tests
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|
| 1 | Add notes | 1. Open walk 2. Enter text 3. Save | Notes saved, toast shown | - | - |

### Edge Case Tests
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|
| 1 | Empty input | Submit empty | Validation or clear | - | - |
| 2 | Long input | 1000+ chars | Handles gracefully | - | - |
| 3 | Rapid clicks | 5x quickly | No duplicates | - | - |
| 4 | Offline | Disconnect, save | Error shown | - | - |

### Regression Tests
| Area | Test | Status |
|------|------|--------|
| Walk history | List loads | - |
```

#### Security Tests (if 🔒 flagged)

```markdown
### Security Tests
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|
| 1 | Auth bypass | Access without login | Redirect to login | - | - |
| 2 | Other user data | Access walk ID of other user | 403 or error | - | - |
| 3 | Injection | Enter `<script>` in notes | Escaped, not executed | - | - |
| 4 | Large payload | Send 1MB of data | Rejected gracefully | - | - |
| 5 | Invalid IDs | Use fake walk ID | Proper error, no crash | - | - |
```

#### Accessibility Tests (if ♿ flagged)

```markdown
### Accessibility Tests
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|
| 1 | Keyboard nav | Tab through form | Logical order | - | - |
| 2 | Focus visible | Tab through | Focus ring visible | - | - |
| 3 | Screen reader | Use VoiceOver/NVDA | Content announced | - | - |
| 4 | No mouse | Complete task keyboard-only | Possible | - | - |
```

#### Performance Tests (if ⚡ flagged)

```markdown
### Performance Tests
| # | Test | Metric | Threshold | Actual | Status |
|---|------|--------|-----------|--------|--------|
| 1 | Page load | LCP | < 2.5s | - | - |
| 2 | Interaction | FID | < 100ms | - | - |
| 3 | Save action | Response time | < 500ms | - | - |
| 4 | List render | 100 items | < 1s | - | - |
```

### Phase 4: Execute Tests

1. **For each test**: Follow steps, note actual, mark status
2. **Screenshot evidence** for failures
3. **Check console** for errors
4. **Skip tests** only with documented reason

### Phase 5: Log Bugs

**Bug format with severity and category**:
```markdown
### BUG-XXX: [Title]

**Severity:** Critical / High / Medium / Low
**Category:** Functional / Security / Accessibility / Performance
**Found in:** TASK-XXX testing
**Steps to Reproduce:**
1. Step one
2. Step two

**Expected:** What should happen
**Actual:** What actually happens

**Console Errors:**
```
Error message
```

**Suggested Fix:** [hint]
**Assigned To:** -
**Status:** Open
```

### Phase 6: Write Summary

```markdown
## Test Summary

**Task:** TASK-XXX
**Tested On:** [datetime]
**Duration:** 25 minutes

**Results:**
| Category | Pass | Fail | Skip |
|----------|------|------|------|
| Functional | 8 | 1 | 0 |
| Security | 5 | 0 | 0 |
| Accessibility | 4 | 0 | 0 |
| Performance | 3 | 1 | 0 |
| **Total** | **20** | **2** | **0** |

**Bugs Found:** 2
- BUG-001: Notes don't persist (High, Functional)
- BUG-002: Slow with 100 items (Medium, Performance)

**Security Status:** ✓ Pass
**Accessibility Status:** ✓ Pass
**Performance Status:** ⚠️ 1 issue

**Overall Status:** FAIL
**Recommendation:** Fix BUG-001 before release. BUG-002 can be optimized later.
```

---

## Command: `review`

Review test results and decide next steps.

### Steps

1. **Read TESTER.md** test summary

2. **Check critical issues**:
   - Any security failures → must fix before release
   - Any critical bugs → must fix before release
   - Any high bugs → should fix, can defer with justification

3. **If all tests pass**:
   - Record actual time vs estimate
   - Move task to Completed
   - Generate documentation snippet
   - Archive test results
   - Suggest git operations:
     ```
     git add .
     git commit -m "feat(TASK-XXX): [description]"
     ```

4. **If bugs found**:
   - Assign to appropriate developer
   - Update task state to Bug-Fixing
   - Log assignments to chat

5. **Update metrics**:
   - Estimation accuracy
   - Bug rate
   - Sprint velocity

---

## Command: `pause`

Pause current work to switch context.

### Steps

1. **Save current state** to workspace:
   ```markdown
   **State:** Paused
   **Paused At:** [datetime]
   **Resume Point:** [description of where to continue]
   **Context:** [any important notes]
   ```

2. **Update PROJECT_MANAGER.md**

3. **Log to chat**:
   ```
   [datetime] @BackendDeveloper: Pausing TASK-XXX at 60%. Will resume later.
   ```

4. **Report resumption instructions**:
   ```
   TASK-XXX paused at 60% (Implementing).
   To resume: /project-manager continue
   ```

---

## Command: `continue`

Resume interrupted work from last known state.

### Steps

1. **Read all workspace files**

2. **Find incomplete work** (priority order):
   1. Paused tasks (most recent first)
   2. In Progress tasks
   3. Testing tasks

3. **Report state and resume**:
   ```
   ## Resuming Work

   **Task:** TASK-XXX
   **State when paused:** Implementing at 60%
   **Resume point:** Adding updateWalkNotes mutation
   **Time paused:** 2h 15m

   Continuing implementation...
   ```

4. **Resume appropriate workflow**

---

## Command: `rollback [task-id]`

Revert a failed implementation.

### Steps

1. **Verify task** exists and can be rolled back

2. **Read files changed** from implementation log

3. **Revert changes**:
   - New files: `git rm [file]`
   - Modified files: `git checkout HEAD -- [file]`
   - Or manual revert if no git

4. **Update task state** to Backlog

5. **Log rollback with reason**

6. **Add to Lessons Learned**

---

## Command: `sprint [subcommand]`

Manage sprint lifecycle.

### Subcommands

#### `sprint start [name]`

Start a new sprint.

```markdown
## Sprint 2 — [name]

**Started:** [datetime]
**Planned End:** [datetime + 2 weeks]
**Goal:** [sprint goal]

### Planned Tasks
| ID | Description | Estimate | Assigned |
|----|-------------|----------|----------|
```

#### `sprint close`

Close current sprint.

1. **Generate sprint report**:
   ```markdown
   ## Sprint 2 Summary

   **Duration:** 2 weeks
   **Goal:** [goal] — ✓ Achieved / ⚠️ Partial / ✗ Not achieved

   ### Metrics
   | Metric | Planned | Actual |
   |--------|---------|--------|
   | Tasks | 5 | 4 |
   | Story Points | 13 | 11 |
   | Bugs Found | - | 7 |
   | Bugs Fixed | - | 6 |

   ### Velocity
   - This sprint: 4 tasks (11 points)
   - Average: 3.5 tasks (10 points)

   ### Estimation Accuracy
   - Average: 82%
   - Best: TASK-003 (100%)
   - Worst: TASK-005 (45%)

   ### Incomplete Tasks
   | ID | Description | Reason |
   |----|-------------|--------|
   | TASK-007 | Chat feature | Blocked by API |

   ### Lessons Learned
   [From PROJECT_MANAGER.md]
   ```

2. **Archive sprint** to `ARCHIVE/sprint-N.md`

3. **Move incomplete tasks** to next sprint backlog

#### `sprint report`

Generate current sprint status report without closing.

---

## Command: `archive`

Archive completed work and clean up.

### Steps

1. **Move completed tasks** to archive
2. **Trim PROJECT_CHAT.md** (keep last 50 messages)
3. **Update metrics** with historical data
4. **Report cleanup**:
   ```
   Archived:
   - 5 completed tasks
   - 12 resolved bugs
   - 47 chat messages

   Current state:
   - 3 tasks in backlog
   - 1 task in progress
   - Sprint 3 active
   ```

---

## Quality Gates

Every task must pass these gates:

| Gate | Checked By | Requirement |
|------|------------|-------------|
| Plan Verified | Developer | Implementation plan written and verified |
| Type Check | Developer | `npx convex dev` passes (backend) |
| TypeScript | Developer | No TS errors (frontend) |
| Lint/Format | Developer | `npm run check` passes |
| Build | Developer | `npm run build` passes |
| Functional Tests | Tester | All happy path tests pass |
| Edge Cases | Tester | Critical edge cases handled |
| Regression | Tester | No existing features broken |
| Security Tests | Tester | All security tests pass (if flagged) |
| Accessibility | Tester | All a11y tests pass (if flagged) |
| Performance | Tester | Within thresholds (if flagged) |

---

## Blocking Protocol

### When an Agent Gets Blocked

1. **Update workspace**:
   ```markdown
   **State:** BLOCKED
   **Blocked By:** [description]
   **Urgency:** High / Medium / Low
   **Blocked Since:** [datetime]
   **Waiting For:** [what's needed]
   ```

2. **Post to chat** with @ProjectManager

3. **PM resolves based on type**:
   | Blocker Type | Action |
   |--------------|--------|
   | Missing requirements | AskUserQuestion |
   | Task dependency | Reprioritize blocking task |
   | Technical issue | Research, WebSearch if needed |
   | Design decision | Decide, log rationale |
   | External dependency | Log, set reminder, continue other work |

### Escalation

PM escalates to user when:
- Architectural decision beyond codebase patterns
- Business requirement ambiguous
- Conflicting priorities
- Security concern discovered
- Resource constraint

---

## Git Integration

### Branch Naming

```
task/TASK-XXX-short-description
```

### Commit Message Format

```
type(TASK-XXX): short description

- Detail 1
- Detail 2

[Security: notes if applicable]

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`

### Suggested Git Workflow

1. **On assign**: `git checkout -b task/TASK-XXX-description`
2. **On complete**: Commit with message
3. **On review pass**: `git checkout main && git merge task/TASK-XXX-description`

---

## Metrics & Estimation

### Task Estimation

```markdown
| Field | Value |
|-------|-------|
| Estimated | 4h |
| Actual | 5.5h |
| Accuracy | 73% |
```

### Sprint Velocity

```markdown
| Sprint | Tasks | Points | Bugs |
|--------|-------|--------|------|
| Sprint 1 | 4 | 10 | 5 |
| Sprint 2 | 5 | 12 | 3 |
| Sprint 3 | 4 | 11 | 4 |
| **Avg** | **4.3** | **11** | **4** |
```

### Estimation Accuracy

Track for improvement:
- Tasks estimated well → learn patterns
- Tasks underestimated → identify complexity signals
- Tasks overestimated → avoid padding

---

## File Templates

### PROJECT_MANAGER.md

```markdown
# Project Manager — [Project Name]

> Last Updated: [datetime]
> Session Started: [datetime]

## Current Sprint
Sprint 1 — [Goal]
Started: [date] | Ends: [date]

## Task Board

### Backlog
| ID | Description | Type | Priority | Est | Depends | Flags | AC |
|----|-------------|------|----------|-----|---------|-------|-----|

### In Progress
| ID | Description | Assigned | State | Progress | Started | Est | Actual |
|----|-------------|----------|-------|----------|---------|-----|--------|

### Testing
| ID | Description | Developer | Test Status | Bugs |
|----|-------------|-----------|-------------|------|

### Completed
| ID | Description | Completed By | Date | Est | Actual | Accuracy |
|----|-------------|--------------|------|-----|--------|----------|

## Agent Status

| Agent | Task | State | Progress | Last Update |
|-------|------|-------|----------|-------------|
| Backend | - | Idle | - | - |
| Frontend | - | Idle | - | - |
| Tester | - | Idle | - | - |

## Blockers

| ID | Task | Description | Urgency | Since | Owner | Status |
|----|------|-------------|---------|-------|-------|--------|

## Decision Log

| Date | Decision | Rationale | Made By |
|------|----------|-----------|---------|

## Lessons Learned

| Date | Event | Lesson | Action |
|------|-------|--------|--------|

## Metrics

### Session
| Metric | Value |
|--------|-------|
| Tasks Completed | 0 |
| Bugs Found | 0 |
| Bugs Fixed | 0 |
| Blockers Resolved | 0 |

### Sprint
| Metric | Target | Actual |
|--------|--------|--------|
| Tasks | - | 0 |
| Estimation Accuracy | 80% | - |

### Historical
| Sprint | Tasks | Points | Bugs | Accuracy |
|--------|-------|--------|------|----------|
```

### BACKEND_DEVELOPER.md

```markdown
# Backend Developer Workspace

> Last Updated: [datetime]

## Current Assignment

**Task ID:** None
**Description:** -
**Acceptance Criteria:** -
**Flags:** -
**Assigned By:** -
**Assigned On:** -
**State:** Idle
**Progress:** 0%
**Estimate:** -
**Actual Time:** -

---

## Implementation Plan

_Write BEFORE implementing._

### Schema Changes
- [ ] _Table/field/index with types_

### Queries
- [ ] _name(args) → return — description_

### Mutations
- [ ] _name(args) → return — description_

### Security Considerations (if 🔒 flagged)
- [ ] _Auth checks_
- [ ] _Input validation_
- [ ] _Data sanitization_

### Files to Modify
- [ ] `convex/schema.ts` — _changes_
- [ ] `convex/[module].ts` — _changes_

---

## Logic Verification Checklist

- [ ] No naming conflicts
- [ ] All queried fields indexed
- [ ] All mutations check auth
- [ ] Data flow traced
- [ ] Edge cases handled
- [ ] Error messages helpful

### Security Checklist (if 🔒 flagged)
- [ ] Auth cannot be bypassed
- [ ] Input validated/sanitized
- [ ] No sensitive data in errors
- [ ] Rate limiting if needed

---

## Implementation Log

```
[HH:MM] Started
```

---

## Completion Report

**State:** -
**Progress:** 0%
**Estimate:** -
**Actual Time:** -
**Accuracy:** -

**Files Changed:**
- _(none)_

**Verification:**
- [ ] `npx convex dev` — types compile
- [ ] `npm run check` — lint pass
- [ ] `npm run build` — build pass

**Security Notes:** -
**Ready for Testing:** No
**Notes for Tester:** -

**Suggested Commit:**
```
feat(TASK-XXX): [description]
```
```

### FRONTEND_DEVELOPER.md

```markdown
# Frontend Developer Workspace

> Last Updated: [datetime]

## Current Assignment

**Task ID:** None
**Description:** -
**Acceptance Criteria:** -
**Flags:** -
**Assigned By:** -
**Assigned On:** -
**State:** Idle
**Progress:** 0%
**Estimate:** -
**Actual Time:** -
**Backend Dependency:** None

---

## Implementation Plan

_Write BEFORE implementing._

### Hooks
- [ ] _name — bindings, return_

### Components
- [ ] _name — props, purpose_

### Routes
- [ ] _changes_

### Translations
- [ ] _key — "EN" / "PL"_

### Accessibility (if ♿ flagged)
- [ ] _Keyboard nav_
- [ ] _ARIA labels_
- [ ] _Focus management_

### Files to Modify
- [ ] `src/hooks/[hook].ts`
- [ ] `src/components/[component].tsx`
- [ ] `src/locales/en.json`
- [ ] `src/locales/pl.json`

---

## Logic Verification Checklist

- [ ] Backend API exists
- [ ] Component hierarchy correct
- [ ] Data flows properly
- [ ] Imports resolve
- [ ] Styling matches patterns
- [ ] Translations both locales
- [ ] Forms validated
- [ ] Icons from lucide-react

### Accessibility Checklist (if ♿ flagged)
- [ ] Keyboard navigation works
- [ ] Focus visible and logical
- [ ] ARIA labels present
- [ ] Color contrast sufficient

---

## Implementation Log

```
[HH:MM] Started
```

---

## Completion Report

**State:** -
**Progress:** 0%
**Estimate:** -
**Actual Time:** -
**Accuracy:** -

**Files Changed:**
- _(none)_

**Verification:**
- [ ] TypeScript compiles
- [ ] `npm run check` — lint pass
- [ ] `npm run build` — build pass

**Accessibility Notes:** -
**Ready for Testing:** No
**Notes for Tester:** -

**Suggested Commit:**
```
feat(TASK-XXX): [description]
```
```

### TESTER.md

```markdown
# Tester Workspace

> Last Updated: [datetime]

## Current Assignment

**Task ID:** None
**Feature:** -
**Developer(s):** -
**Flags:** -
**State:** Idle
**Started:** -

---

## Pre-Test Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] Convex running (`npx convex dev`)
- [ ] Build passes (`npm run build`)
- [ ] Logged in as test user
- [ ] Browser console open

---

## Test Plan

### Functional: Happy Path
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|

### Functional: Edge Cases
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|

### Regression
| Area | Test | Status |
|------|------|--------|

### Security (if 🔒 flagged)
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|

### Accessibility (if ♿ flagged)
| # | Test | Steps | Expected | Actual | Status |
|---|------|-------|----------|--------|--------|

### Performance (if ⚡ flagged)
| # | Test | Metric | Threshold | Actual | Status |
|---|------|--------|-----------|--------|--------|

---

## Bug Report

### Active Bugs
| ID | Severity | Category | Title | Assigned | Status |
|----|----------|----------|-------|----------|--------|

### Bug Details
_Detailed reports below_

### Resolved Bugs
| ID | Title | Resolved By | Date | Verified |
|----|-------|-------------|------|----------|

---

## Test Summary

**Task:** -
**Tested On:** -
**Duration:** -

| Category | Pass | Fail | Skip |
|----------|------|------|------|
| Functional | 0 | 0 | 0 |
| Security | 0 | 0 | 0 |
| Accessibility | 0 | 0 | 0 |
| Performance | 0 | 0 | 0 |
| Regression | 0 | 0 | 0 |

**Bugs Found:** 0
**Security Status:** -
**Accessibility Status:** -
**Performance Status:** -
**Overall Status:** -
**Recommendation:** -
```

### PROJECT_CHAT.md

```markdown
# Project Chat

Format: `[YYYY-MM-DD HH:MM] @Agent: message`

---

## Message Log

[YYYY-MM-DD HH:MM] @ProjectManager: Project initialized. Sprint 1 started.

---

_Messages appended above this line_
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Do Instead |
|--------------|--------------|------------|
| Skip implementation plan | 10x cost to fix in code | Plan first |
| Forget to update files | PM loses visibility | Update after every action |
| Frontend before backend | No API to call | Backend first for fullstack |
| Skip tester workflow | Bugs ship | Always test |
| Ignore blockers | Silent stall | Post immediately |
| Fix bugs without logging | Regression risk | Log all bugs |
| Skip security tests | Vulnerabilities | Test all 🔒 tasks |
| Ignore stale warnings | Work forgotten | Respond to stale alerts |
| No estimation | Can't improve | Estimate all tasks |
| No commit messages | Lost context | Use suggested format |

---

## Example Session

```
> /project-manager init walk-notes
✓ Created PROJECT_MANAGEMENT/. Sprint 1 started.

> /project-manager add-task "Add walk notes | AC: Save/edit notes | estimate:4 | security"
✓ TASK-001 created (fullstack, P2, 4h, 🔒 security)

> /project-manager assign TASK-001 both
✓ Backend assigned. Frontend waiting for backend.

> /project-manager run-backend
[Planning] Reading schema...
[Security] Auth patterns identified
[Plan] Schema + mutation + security checks
[Verified] All checklists pass
[Implementing] 20%... 60%... 100%
[Time] Estimated: 2h, Actual: 2.5h (80% accuracy)
✓ Backend complete. Security reviewed.

> /project-manager run-frontend
[Planning] Backend API verified ✓
[Plan] Hook + component + translations
[Implementing] 100%
✓ Frontend complete.

> /project-manager run-tester
[Pre-check] All systems ✓
[Testing] Functional ✓, Security ✓, Regression ✓
✓ All 15 tests pass.

> /project-manager review
✓ TASK-001 completed.
  Time: 5.5h (est 4h, 73% accuracy)
  Suggested: git commit -m "feat(TASK-001): Add walk notes feature"

> /project-manager status
Sprint 1: 1/1 tasks (100%)
Velocity: 1 task/day
Next: Add more tasks or close sprint
```
