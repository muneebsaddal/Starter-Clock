# T008 — Build Web Landing Page and Calculators

## Objective and Outcome

Ship a responsive web landing experience and free feeding-ratio and hydration
calculators that communicate the product promise without implying a full web
dashboard.

## Dependencies and Context

- Dependencies: T003, T005, and explicit user approval of Phase 5
- Read: `docs/prd.md`, `docs/requirements.md`, `docs/ux-flow.md`,
  `docs/architecture.md`, `docs/research/market-research.md`

## Scope

- In: landing content, responsive calculator UI, shared domain math, metadata,
  accessibility, error states, analytics/privacy decision, and web tests.
- Out: synchronized dashboard, accounts, content library, and app-store assets.

## Acceptance Criteria

- Both calculators match tested domain formulas and validate boundaries.
- The page is clear and accessible on mobile and desktop viewports.
- Copy accurately distinguishes calculators from peak prediction and avoids
  unsupported scientific or safety claims.
- Web performance and discoverability meet T003 thresholds.

## Expected Files

Web routes/components/tests and affected canonical documents, ledger, this plan,
and handoff.

## Steps

1. Map validated positioning and requirements to the landing structure.
2. Implement calculators using shared domain functions.
3. Add responsive, accessible states and metadata.
4. Test representative browsers/viewports and calculation boundaries.
5. Verify quality gates and audit Phase 5.

## Verification

- Run calculator tests, E2E flows, accessibility checks, typecheck, lint, build,
  and performance checks.
- Inspect mobile/desktop screenshots and the final diff.

## Risks and Rollback

Web scope can expand into a dashboard. Enforce the requirements boundary and
keep landing/calculator routes independently removable.

## Completion Record

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T003, T005, and Phase 5 approval are required.
