# Starter Clock Project Operating Workflow Design

**Status:** Approved
**Adopted:** 2026-06-21

## Purpose

Starter Clock uses a document-driven workflow designed for frequent fresh
agent sessions. The user can assign work with a short instruction such as
`complete task 4`. A fresh agent must be able to recover the relevant context,
complete only that task, update the project state, and commit the result.

The workflow optimizes for:

- Clear user control
- Low context and token usage
- Stable task references
- Small, reviewable changes
- Evidence-based completion
- Current information written in one canonical place

## Operating Model

The project uses a canonical task ledger with one compact plan per task.

- `docs/tasks.md` is the authoritative project-wide task index and status
  ledger.
- `docs/plans/T###-name.md` is the execution contract and completion record for
  one task.
- Product facts live in their canonical documents: requirements, PRD,
  architecture, research, UX, and roadmap.
- `HANDOFF.md` is a small current-state snapshot, not an independent source of
  product truth.
- Git stores historical change detail. Project documents describe current
  truth rather than maintaining a duplicate activity journal.

## Stable Task Identity

Every task receives a permanent identifier such as `T004`.

- Identifiers are never renumbered, reassigned, or reused.
- A user instruction such as `complete task 4` resolves to `T004`.
- Removed work remains in the ledger with status `CANCELLED`.
- New tasks receive the next unused identifier, even when logically inserted
  between older tasks.
- Agents never start another task automatically after completing an assigned
  task.

## Task Statuses

Each task has exactly one status in `docs/tasks.md`:

- `PLANNED`: defined but not sufficiently prepared for execution.
- `READY`: scoped, unblocked, and eligible for explicit assignment.
- `IN PROGRESS`: currently being executed.
- `BLOCKED`: incomplete because a recorded dependency or decision prevents
  completion.
- `DONE`: all acceptance criteria and required verification passed.
- `CANCELLED`: intentionally removed from scope without reusing its identity.

A successful agent may mark its assigned task `DONE`. Movement to a new project
phase requires user approval.

## Per-Task Plan

Each task plan contains only the information needed to execute and verify that
task:

- Permanent task ID and title
- Objective and expected outcome
- Dependencies
- Required context documents
- In-scope and out-of-scope boundaries
- Acceptance criteria
- Expected files to create or modify
- Ordered implementation steps
- Required verification commands and expected results
- Relevant risks and rollback notes
- Completion record

The completion record contains:

- Outcome: `DONE` or `BLOCKED`
- Concise summary of work performed
- Actual files changed
- Verification commands and results
- Remaining risks or blocker
- Exact next action when blocked

Plans link to canonical requirements and architecture decisions instead of
copying them. Material scope changes require an approved plan update before
implementation continues.

## Fresh-Session Protocol

When the user assigns a task number, the agent follows this sequence:

1. Read `AGENTS.md`.
2. Read the short current-state summary in `HANDOFF.md`.
3. Resolve the permanent task ID in `docs/tasks.md`.
4. Read that task's plan.
5. Read only the canonical context documents named by the plan.
6. Confirm the task is `READY`, `IN PROGRESS`, or `BLOCKED` with resumable work.
7. Mark the task `IN PROGRESS` before material implementation.
8. Execute only the assigned scope.
9. Run the verification required by the task plan.
10. Inspect a concise diff summary for unrelated or accidental changes.
11. Update every affected canonical document.
12. Complete the task record, update `docs/tasks.md`, and refresh `HANDOFF.md`.
13. Create one focused Git commit containing the task ID in its subject.
14. Stop and return control to the user.

The task ID in the commit subject provides traceability without requiring a
second bookkeeping commit merely to write the first commit's hash into a file.

## Blocked Work

If a task cannot be completed, the agent preserves useful partial work and
marks the task `BLOCKED`.

The task record must state:

- What was completed
- What remains incomplete
- The exact blocker
- Verification already performed
- The exact decision, dependency, or action needed next

Partial work is committed so it survives fresh sessions. The commit subject
includes both the task ID and `blocked`. The agent must never represent blocked
work as complete.

## Git and Verification

Git stays deliberately simple:

```text
implement -> verify -> inspect concise diff -> update records -> commit
```

- Create one focused commit for each completed task.
- Commit useful partial work for blocked tasks.
- Use a concise conventional subject containing the permanent task ID.
- Do not spend context narrating routine Git operations.
- Do not run redundant tests solely because a commit is about to be created.
- Let CI enforce the broader test, lint, typecheck, build, and security matrix
  when CI is available.
- Run the proportionate local verification specified by the task plan.

Recommended subjects:

```text
feat(T004): implement feeding entry
docs(T002): define measurable MVP requirements
chore(T011 blocked): preserve notification setup work
```

## Canonical Document Ownership

Each kind of changing information has one owner:

| Information | Canonical owner |
|---|---|
| Operating protocol and agent authority | `AGENTS.md` |
| Product requirements and constraints | `docs/requirements.md` |
| Goals, stories, scope, and acceptance criteria | `docs/prd.md` |
| Technical decisions and boundaries | `docs/architecture.md` |
| UX flows, screens, and interaction states | `docs/ux-flow.md` |
| Milestones and phase outcomes | `docs/roadmap.md` |
| Task order and current status | `docs/tasks.md` |
| Task execution detail and completion evidence | `docs/plans/T###-name.md` |
| Current phase, blockers, and next eligible tasks | `HANDOFF.md` |
| Competitor and customer evidence | `docs/research/market-research.md` |

When truth changes, agents update the owner document. Other documents reference
that source instead of restating it. Stable requirement and decision IDs are
used where cross-document traceability is needed.

## Lead Agent and Project Audits

`AGENTS.md` defines the lead agent's responsibility; it does not store changing
project state.

The lead agent performs an audit:

- At every phase boundary
- Whenever the user says `audit project`
- When conflicting records or architecture drift are discovered

The audit reconciles:

- Requirements and PRD alignment
- Architecture compliance
- Task ledger statuses and task completion records
- Task IDs in Git history
- Verification evidence and unresolved failures
- Stale handoff information
- Missing dependencies and documentation drift
- Technical debt and risks affecting the next phase

The lead agent may directly repair small documentation, formatting, link, and
status inconsistencies. It must request user approval before changing product
scope, architecture, pricing, target platforms, policy, or phase boundaries.

Every audit ends with one verdict:

- `APPROVE`
- `APPROVE WITH FOLLOW-UPS`
- `CHANGES REQUIRED`

## User Control

The user controls task selection and phase progression.

- Agents execute only explicitly assigned task IDs.
- Agents may mark work `DONE` when its written contract is satisfied.
- The user approves movement between project phases.
- Agents request approval before material product or architecture changes.
- A fresh session should not require the user to restate project history.

## Required Project Documents

```text
AGENTS.md
CLAUDE.md
DEVELOPMENT_WORKFLOW.md
HANDOFF.md
docs/
  project-operating-workflow-design.md
  requirements.md
  prd.md
  architecture.md
  tasks.md
  ux-flow.md
  roadmap.md
  research/
    market-research.md
  plans/
    T###-name.md
```

Additional documents are created only when they become the canonical owner of
information that cannot fit an existing document cleanly.

## Success Criteria

This operating workflow succeeds when:

- A fresh agent can correctly execute `complete task N` without additional
  project narration.
- Current project state can be understood quickly from `docs/tasks.md` and
  `HANDOFF.md`.
- Every finished task is traceable to acceptance criteria, verification
  evidence, changed files, and one task-scoped Git commit.
- Blocked work is preserved with an exact resumption path.
- Current facts are written once and updated only in their canonical owner.
- Phase audits detect drift before later work compounds it.
- The user always retains explicit control over task selection and phase
  progression.
