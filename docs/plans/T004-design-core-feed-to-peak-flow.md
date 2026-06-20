# T004 — Design and Prototype the Core Feed-to-Peak Flow

## Objective and Outcome

Define and validate a calm, accessible flow from starter creation and feeding
entry to peak-window understanding, reminders, observed peaks, and history.

## Dependencies and Context

- Dependencies: T003 and explicit user approval of Phase 2
- Read: `docs/prd.md`, `docs/requirements.md`, `docs/ux-flow.md`,
  `docs/research/market-research.md`

## Scope

- In: information architecture, flows, wireframes/prototype, component and
  system states, accessibility, responsive/platform behavior, usability checks.
- Out: production app code, architecture selection, final estimation formula.

## Acceptance Criteria

- The dashboard answers peak timing immediately and communicates uncertainty.
- Representative users can log a feeding in under 15 seconds in prototype tests.
- All required empty, error, offline, permission, limit, and edit states exist.
- Small Android, current iPhone, and responsive web layouts are reviewed.
- Decisions trace to requirements and usability evidence.

## Expected Files

`docs/ux-flow.md`, prototype assets under `docs/` if justified,
`docs/requirements.md`, `docs/tasks.md`, this plan, and `HANDOFF.md`.

## Steps

1. Map requirements to the smallest coherent information architecture.
2. Design happy paths and recovery/system states.
3. Build a viewport-safe interactive prototype.
4. Test timing, comprehension, accessibility, and representative viewports.
5. Incorporate evidence and document implementation-ready decisions.

## Verification

- Trace screens and states to requirement IDs.
- Run prototype interaction, viewport, keyboard, contrast, and touch-target checks.
- Record feeding-time and peak-comprehension evidence; inspect the final diff.

## Risks and Rollback

A polished prototype can disguise model uncertainty. Test comprehension with
realistic ranges and missing inputs; retain rejected alternatives in Git only.

## Completion Record

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T003 and Phase 2 approval are required.
