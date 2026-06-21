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
- The under-15-second representative-user target has a documented protocol;
  if participant access is unavailable, only an explicit owner waiver can close
  T004 and the unmet evidence must remain recorded as validation risk.
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
- Record feeding-time and peak-comprehension evidence or an explicit owner
  waiver without claiming a pass; inspect the final diff.

## Risks and Rollback

A polished prototype can disguise model uncertainty. Test comprehension with
realistic ranges and missing inputs; retain rejected alternatives in Git only.

## Completion Record

- Outcome: Done with explicit representative-validation waiver
- Summary: Defined the two-destination mobile IA, complete happy/recovery state
  contract, accessibility and platform behavior, and a disposable interactive
  prototype. The owner walkthrough found the flow and estimated-window language
  clear and approved replacing the manual reminder setup with a default-on,
  remembered feeding-entry preference that schedules automatically on save.
  No production architecture or peak formula was selected.
- Actual files changed: `docs/ux-flow.md`, `docs/prototypes/t004/index.html`,
  `styles.css`, `app.js`, `README.md`, `usability-test.md`,
  `docs/requirements.md`, `docs/prd.md`, `docs/roadmap.md`, `docs/tasks.md`, this
  plan, and `HANDOFF.md`.
- Verification: `node --check` passed; every local prototype asset resolved;
  Playwright exercised create/save, invalid-input preservation, uncertainty
  disclosure, history/edit, scenario states, Escape dismissal, and modal focus
  wrapping. Viewport checks at 320×640, 390×844, and 1280×800 found no
  horizontal overflow. Light contrast ratios were 12.94:1 (body), 4.78:1
  (muted), and 8.93:1 (accent); dark ratios were 14.72:1, 8.28:1, and 7.96:1.
  The UX contract traces 17 critical requirement IDs. For the reminder revision,
  `node --check`, local-asset resolution, data-action handler coverage, required
  state-copy checks, stale-status searches, and `git diff --check` passed. The
  earlier browser viewport suite was not rerun for this localized revision.
- Validation decision: The user stated that representative participants cannot
  be recruited, explicitly waived the five-person NFR-001/NFR-002 evidence on
  2026-06-21, and approved proceeding. The thresholds are not reported as
  passed. They remain non-blocking validation targets and the protocol is kept
  for future use if participant access becomes feasible.
- Remaining risk: feeding speed and first-time interval comprehension are
  supported only by an untimed owner walkthrough, not representative evidence.
