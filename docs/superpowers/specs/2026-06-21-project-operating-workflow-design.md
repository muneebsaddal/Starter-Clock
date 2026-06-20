# Starter Clock Project Operating Workflow Design

**Status:** Approved in conversation on 2026-06-21

## Purpose

Starter Clock will use a document-driven workflow designed for frequent fresh
agent sessions. A user must be able to assign work with a short instruction such
as `complete task 4`, while the new session reliably reconstructs the relevant
context, completes only the assigned work, records the result, and commits it.

The system prioritizes clear project state, low context cost, stable task
references, evidence-based completion, and minimal duplicated writing.

## Core Model

Use a canonical task ledger with one compact plan per task.

- `docs/tasks.md` is the authoritative project-wide task index and status
  ledger.
- `docs/plans/T###-name.md` contains the execution contract and completion
  record for one task.
- Product facts live in their appropriate canonical documents, including
  requirements, PRD, architecture, research, and UX documentation.
- `HANDOFF.md` is a small current-state snapshot. It is not a separate source
  of product or task truth.
- Git records historical changes. Project documents describe current truth
  rather than reproducing a session-by-session journal.

## Stable Task Identity

Every task receives a permanent identifier such as `T004`.

- Identifiers are never renumbered, reassigned, or reused.
- Removed work is marked `CANCELLED`; its identifier remains in the ledger.
- A user instruction such as `complete task 4` resolves to `T004`.
- New tasks receive the next unused identifier, even when logically inserted
  between existing tasks.

## Task Statuses

Each task has exactly one status in `docs/tasks.md`:

- `PLANNED`: defined but not sufficiently prepared for execution.
- `READY`: fully scoped, unblocked, and eligible for explicit assignment.
- `IN PROGRESS`: actively being executed.
- `BLOCKED`: incomplete because a recorded dependency or decision prevents
  completion.
- `DONE`: acceptance criteria and required verification passed.
- `CANCELLED`: intentionally removed from scope while preserving its identity.

Agents mark successful tasks `DONE` without waiting for a separate approval.
Phase transitions still require user approval.

## Per-Task Plan Contract

Each task plan contains only information required to execute and verify that
task:

- Objective and user-visible or engineering outcome
- Dependencies and required context documents
- Explicit in-scope and out-of-scope boundaries
- Acceptance criteria
- Files expected to be created or changed
- Ordered implementation steps
- Required verification commands and expected results
- Risks and rollback considerations when relevant
- Completion record containing outcome, actual files changed, verification
  evidence, commit hash, and any residual risk

The plan links to canonical requirements and architecture decisions instead of
copying them. Once execution begins, material scope changes require an explicit
plan update before implementation continues.

## Fresh-Session Execution Protocol

When assigned a task number, an agent:

1. Reads `AGENTS.md`.
2. Reads the active-state summary in `HANDOFF.md`.
3. Locates the immutable task in `docs/tasks.md`.
4. Reads that task's plan and only the canonical documents named by it.
5. Confirms the task is `READY` or already `IN PROGRESS` and not superseded.
6. Marks it `IN PROGRESS` before material implementation.
7. Executes only the assigned scope.
8. Runs the verification required by the plan.
9. Reviews a concise diff summary for accidental or unrelated changes.
10. Updates canonical documents affected by the work.
11. Writes the task completion record and updates the ledger and handoff.
12. Creates one focused Git commit and records its hash.

The agent must not automatically take another task. All task execution is
explicitly assigned by the user.

## Blocked Work

When a task cannot be completed, the agent preserves useful partial work and
marks the task `BLOCKED`.

The blocked record must state:

- What was completed
- What remains incomplete
- The exact blocker
- Verification already performed
- The exact decision, dependency, or action needed next

Partial work is committed so it survives fresh sessions. The commit message
must identify the task and its blocked state. The agent must not represent a
blocked task as complete.

## Git and Verification

Git use remains intentionally simple:

```text
implement -> verify -> inspect concise diff -> update records -> commit
```

- One focused commit is created for each completed task.
- Useful partial work for a blocked task is also committed.
- Agents do not spend context narrating routine Git commands.
- No redundant test pass is added solely for committing.
- CI may later enforce the full test, typecheck, lint, build, and security
  matrix.
- The task plan defines proportionate local verification for its scope.

## Document Ownership and Synchronization

Each kind of information has one owner:

- Requirements and constraints: `docs/requirements.md`
- Product goals, stories, scope, and acceptance criteria: `docs/prd.md`
- Technical decisions and boundaries: `docs/architecture.md`
- Project-wide task order and current status: `docs/tasks.md`
- Task execution detail and completion evidence: `docs/plans/T###-name.md`
- Current phase, active blockers, and next eligible work: `HANDOFF.md`
- Operating protocol and agent authority: `AGENTS.md`

Agents update the owner document when truth changes. Other documents link to
that source and do not restate it. Cross-document references use stable section
names or requirement IDs where practical.

## Lead Agent and Audits

`AGENTS.md` defines the lead role; it does not store changing project state.

The lead agent performs an audit at every phase boundary and whenever the user
requests `audit project`. The audit reconciles:

- Requirements and PRD alignment
- Architecture compliance
- Task ledger status against task completion records
- Git commits against recorded commit hashes
- Verification evidence and unresolved failures
- Missing dependencies, stale handoff data, and documentation drift
- Technical debt and risks that affect the next phase

The lead may directly repair small documentation, link, formatting, or status
inconsistencies. It must request user approval before changing product scope,
architecture, pricing, target platforms, policy, or phase boundaries.

An audit ends with one verdict: `APPROVE`, `APPROVE WITH FOLLOW-UPS`, or
`CHANGES REQUIRED`.

## User Control

The user controls task selection and phase progression.

- Agents never choose and begin the next task on their own.
- Completed tasks become `DONE` when evidence satisfies their contract.
- The user approves movement from one project phase to another.
- Decisions that materially change scope or architecture are presented to the
  user before implementation.

## Initial Document Set

The workflow will be implemented through:

```text
AGENTS.md
CLAUDE.md
DEVELOPMENT_WORKFLOW.md
HANDOFF.md
docs/
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

Additional documents are added only when they become the canonical home for
information that does not fit an existing owner.

## Success Criteria

The workflow succeeds when:

- A fresh agent can act correctly from `complete task N` without the user
  restating context.
- The current task and phase state can be understood from `docs/tasks.md` and
  `HANDOFF.md` in a few minutes.
- Every completed task points to acceptance criteria, verification evidence,
  affected files, and one focused commit.
- Blocked work is preserved and has an exact resumption path.
- Project facts are written once and updated in their canonical document.
- Phase audits detect drift before subsequent work compounds it.
- The user retains explicit control over task selection and phase progression.
