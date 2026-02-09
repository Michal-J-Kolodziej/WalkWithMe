---
name: project-manager
description: Multi-agent project management with backend/frontend developers and tester
argument-hint: '[command: init|status|add-task|list|assign|run-backend|run-frontend|run-tester|review|continue|pause|rollback|sprint|archive|chat]'
---

# Project Manager — Multi-Agent Orchestration System

Coordinator-specialist workflow with Backend Developer, Frontend Developer, and Tester agents. File-based async communication with sprint management, estimation tracking, and comprehensive testing.

## Commands

| Command | Description |
|---------|-------------|
| `init [name]` | Initialize workspace with ARCHIVE/ |
| `status` | Status with stale detection & recommendations |
| `add-task [desc]` | Add task (AC, priority, estimate, flags) |
| `list [filter]` | List tasks (all, active, blocked, stale, P0) |
| `assign [id] [agent]` | Assign to backend, frontend, or both |
| `run-backend` | Backend workflow with security checks |
| `run-frontend` | Frontend workflow with a11y checks |
| `run-tester` | Full testing (functional, security, perf, a11y) |
| `review` | Review results, sign off or assign fixes |
| `continue` | Resume paused/interrupted work |
| `pause` | Pause current work with saved state |
| `rollback [id]` | Revert failed implementation |
| `sprint [cmd]` | Manage sprints (start, close, report) |
| `archive` | Archive completed work, trim chat |
| `chat [msg]` | Post to project chat |

## Task Modifiers

```
/project-manager add-task "Description | AC: criteria | P1 | estimate:4 | security | a11y | depends:TASK-001"
```

| Modifier | Example |
|----------|---------|
| Acceptance Criteria | `\| AC: User can save notes` |
| Priority (P0-P3) | `\| P1` |
| Estimate (hours) | `\| estimate:4` |
| Security flag | `\| security` |
| Accessibility flag | `\| a11y` |
| Performance flag | `\| performance` |
| Dependency | `\| depends:TASK-001` |

## Task Flags

| Flag | Triggers |
|------|----------|
| 🔒 security | Security checklist + testing |
| ♿ a11y | Accessibility checklist + testing |
| ⚡ performance | Performance testing |
| 📱 mobile | Mobile responsiveness testing |

## Architecture

```
PROJECT_MANAGEMENT/
├── PROJECT_MANAGER.md      # Task board, metrics, decisions
├── BACKEND_DEVELOPER.md    # Backend workspace
├── FRONTEND_DEVELOPER.md   # Frontend workspace
├── TESTER.md               # Test plans, bug reports
├── PROJECT_CHAT.md         # Communication log
└── ARCHIVE/                # Sprint archives
```

## Task States

```
Backlog → Assigned → Planning → Implementing → Ready-for-Test → Testing → Completed
              ↓           ↓           ↓             ↓            ↓
           Paused ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
              ↓
           Blocked → (unblocked) → returns to previous state
```

## Quality Gates

| Gate | Requirement |
|------|-------------|
| Plan Verified | Implementation plan with checklists |
| Type Check | `npx convex dev` passes |
| Lint/Format | `npm run check` passes |
| Build | `npm run build` passes |
| Functional Tests | All happy path + edge cases |
| Security Tests | If 🔒 flagged |
| Accessibility | If ♿ flagged |
| Performance | If ⚡ flagged |

## Key Features

- **Stale Detection**: Warns for tasks without updates > 24h
- **Smart Recommendations**: Suggests next actions based on state
- **Estimation Tracking**: Estimated vs actual with accuracy %
- **Sprint Management**: Start, close, report with velocity tracking
- **Git Integration**: Branch naming, commit message templates
- **Comprehensive Testing**: Functional + Security + A11y + Performance

## Workflow Example

```
/project-manager init my-feature
/project-manager add-task "Add notes | AC: Save notes | estimate:4 | security"
/project-manager assign TASK-001 both
/project-manager run-backend     # Security checks included
/project-manager run-frontend    # Waits for backend
/project-manager run-tester      # Full test suite
/project-manager review          # Sign off + metrics
/project-manager sprint close    # Archive + velocity
```

## Integration

| Scenario | Skill |
|----------|-------|
| Style issues | `/style-audit` |
| Feature planning | `/implement-feature` |
| UI/UX decisions | `/ui-ux` |
| Browser testing | `/functional-test` |

For detailed workflow, see `.agent/workflows/project-manager.md`.
