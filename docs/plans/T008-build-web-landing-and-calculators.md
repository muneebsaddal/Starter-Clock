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

- Outcome: BLOCKED on manual browser/visual QA as of 2026-07-05
- Summary: Implemented the public web landing page and free feeding-ratio and
  hydration calculators using shared domain math, boundary validation,
  account-free copy, metadata, responsive layout styles, and no web tracking
  dashboard.
- Actual files changed: `src/app/index.web.tsx`, `src/domain/calculators.ts`,
  `test/calculators.test.ts`, task/handoff records.
- Verification: `npm test` passed 48/48; `npm run test:coverage` passed at
  87.87% statements and 82.72% branches overall, with domain at 98.5%/96.26%;
  `npm run typecheck` passed; `npm run lint` passed; `npm run build:web`
  passed and exported static web routes; `git diff --check` passed. Generated
  concept inspection completed. Automated browser screenshot verification could
  not be completed because the Expo dev server failed on a local dotslash cache
  error, `python.exe` was unavailable for static serving, and headless
  Chrome/Edge capture attempts produced invalid or missing screenshots.
- Remaining risks or blocker: Manual browser QA is required before marking
  T008 `DONE`: open the exported web app, check desktop and mobile viewports,
  verify calculator interaction and validation, inspect accessibility basics
  and copy boundaries, then rerun the quality gates and update this record.
  T007 native device/store verification remains deferred to T009 by owner
  approval.
