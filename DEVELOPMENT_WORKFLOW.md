# Starter Clock Development Workflow

Starter Clock is run as a sequence of small, explicitly assigned tasks.
`docs/tasks.md` is the authoritative ledger; each row links to an execution
contract in `docs/plans/`.

## Assigning Work

Use a permanent task number, for example:

```text
complete task 2
```

This assigns `T002` only. The agent verifies the task, updates its records,
creates one focused commit, and stops. It does not start the next task.

## Status Flow

```text
PLANNED -> READY -> IN PROGRESS -> DONE
                       |
                       +-> BLOCKED -> IN PROGRESS

PLANNED or READY -> CANCELLED
```

The user approves phase changes. A task is `DONE` only after its acceptance
criteria and plan-specific verification pass.

## Sources of Truth

- Current state and next action: `HANDOFF.md`
- Task status and order: `docs/tasks.md`
- Task scope and evidence: `docs/plans/T###-name.md`
- Product and engineering truth: the canonical documents named in `AGENTS.md`
- Historical detail: Git

## Commits

Use one focused conventional commit containing the task ID:

```text
docs(T002): validate problem and competitor gap
feat(T006): implement local starter storage
chore(T008 blocked): preserve notification setup work
```

Before committing, run the verification in the task plan and inspect the diff.
Blocked work is committed with an exact resumption path recorded in its plan.

## Audits

Run `audit project` at phase boundaries or whenever records conflict. The audit
rules and verdicts are defined in `AGENTS.md`.
