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

- Outcome: DONE
- Summary: Implemented the public web landing page and free feeding-ratio and
  hydration calculators using shared domain math, boundary validation,
  account-free copy, metadata, responsive layout styles, and no web tracking
  dashboard.
- Update, 2026-07-05: Fixed manual mobile QA finding where the feeding-ratio
  result text could overflow its calculator panel by removing the compact-mode
  fixed panel minimum and making result rows content-sized/wrapping.
- Update, 2026-07-05: Playwright/Chrome mobile verification found the deeper
  clipping cause was the React Native Web root `ScrollView` and compact card
  flex sizing. Replaced the web root with content-sized `View` containers and
  set compact calculator panels to automatic height.
- Actual files changed: `src/app/index.web.tsx`, `src/domain/calculators.ts`,
  `test/calculators.test.ts`, dependency manifests for Playwright QA,
  task/handoff records.
- Verification: `npm test` passed 48/48; `npm run test:coverage` passed at
  87.87% statements and 82.72% branches overall, with domain at 98.5%/96.26%;
  `npm run typecheck` passed; `npm run lint` passed; `npm run build:web`
  passed and exported static web routes; `git diff --check` passed. Generated
  concept inspection completed. Playwright with local Chrome at a 390 px mobile
  viewport exercised the feeding-ratio calculator with starter 25 g, flour
  75 g, and water 50 g; the screenshot showed `Ratio 1:3:2` and
  `Hydration: 66.7%` inside the card, document width equaled viewport width
  (390 px), and console errors/warnings were empty. Phase 5 audit verdict:
  `APPROVE WITH FOLLOW-UPS`.
- Remaining risks or blocker: T007 native device/store verification remains
  deferred to T009 by owner approval. Broader cross-browser visual QA remains a
  release-readiness concern, but T008 acceptance criteria passed.
