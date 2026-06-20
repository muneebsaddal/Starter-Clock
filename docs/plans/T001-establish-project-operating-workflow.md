# T001 — Establish Project Operating Workflow

## Objective and Outcome

Implement the approved operating-workflow design so a fresh session can
recover project state, resolve a numbered task, and execute only that task.

## Dependencies and Context

- Dependencies: none
- Read: `docs/project-operating-workflow-design.md`, existing `AGENTS.md`

## Scope

- In: update agent protocol; create canonical document shells, contributor
  workflow, handoff, permanent task ledger, and one plan per initial task.
- Out: external research, product decisions beyond the charter, design,
  architecture selection, package setup, and all app implementation.

## Acceptance Criteria

- All files required by the approved design exist and have one clear owner.
- `AGENTS.md` defines task resolution, statuses, fresh-session behavior,
  blocked work, phase authority, commits, and audits.
- The ledger has permanent IDs, dependencies, statuses, and valid plan links.
- Canonical shells distinguish approved constraints from unvalidated work.
- `HANDOFF.md` reports the current phase and exact next user action.
- Documentation checks pass and one focused T001 commit is created.

## Expected Files

`AGENTS.md`, `CLAUDE.md`, `DEVELOPMENT_WORKFLOW.md`, `HANDOFF.md`, and canonical
documents under `docs/`, including `docs/tasks.md` and `docs/plans/`.

## Steps

1. Reconcile the approved design with the project charter in `AGENTS.md`.
2. Create canonical document shells without inventing research or decisions.
3. Define the phased ledger and compact task plans.
4. Verify file presence, links, IDs, statuses, and the Git diff.
5. Complete records and commit once.

## Verification

- Enumerate required files and confirm none are missing.
- Parse ledger plan links and confirm every target exists.
- Confirm ledger IDs and plan IDs are unique and aligned.
- Search for app source/config files to confirm none were introduced.
- Run `git diff --check` and inspect `git diff --stat` plus status.

## Risks and Rollback

Risk: premature detail could look like validated product truth. Mitigation:
label shells and hypotheses explicitly. Rollback is documentation-only via a
focused revert of T001.

## Completion Record

- Outcome: `DONE`
- Summary: implemented the operating protocol, canonical document set, initial
  phased task ledger, task plans, and fresh-session handoff.
- Actual files changed: recorded by the T001 Git commit; all changes are
  documentation and workflow files.
- Verification: required files, plan links, IDs/statuses, implementation-file
  absence, whitespace, diff summary, and working-tree scope checked successfully.
- Remaining risks: product and market statements remain unvalidated until T002
  and T003; Phase 1 still requires explicit user approval.
