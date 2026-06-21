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

- Outcome: Blocked after implementation; moderated acceptance evidence pending
- Summary: Defined the two-destination mobile IA, complete happy/recovery state
  contract, accessibility and platform behavior, and a disposable interactive
  prototype. Added a five-participant protocol with objective feeding-speed and
  interval-comprehension gates. No production architecture or peak formula was
  selected.
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
  The UX contract traces 17 critical requirement IDs. `git diff --check` passed.
- Remaining risks or blocker: NFR-001 and NFR-002 require moderated evidence
  from five representative bakers. No participants were available in this
  execution context, and automated agents are not substituted for users. Resume
  by running `docs/prototypes/t004/usability-test.md`, recording anonymized
  results, incorporating any failed observations, and repeating verification.
