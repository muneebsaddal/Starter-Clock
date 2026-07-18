# T011 — Performance and Architecture Hardening

## Objective and Outcome

Prove and improve Starter Clock's local-first architecture under larger local
data sets before store testing is available.

## Dependencies and Context

- Dependencies: T006, T008, and user approval to continue non-store development
  while T009 remains blocked.
- Read: `docs/architecture.md`, `docs/requirements.md`, `docs/prd.md`,
  `docs/ux-flow.md`, `docs/release-readiness.md`, and the relevant app/test
  files touched by the implementation.

## Scope

- In: Expo dependency health, local data performance, large-history rendering,
  bounded personalization/reminder queries, export/delete-all scaling,
  regression tests, and host-executable profiling evidence.
- Out: Apple/Google store-sandbox testing, store assets, new product features,
  backend/cloud sync, analytics, and changes to MVP pricing or platform scope.

## Acceptance Criteria

- Expo Doctor package mismatches are resolved or explicitly documented with a
  justified blocker.
- History rendering is safe for large Pro history by using a virtualized list or
  another measured bounded rendering strategy.
- Personalization and reminder reconciliation avoid unbounded full-history work
  where the domain only needs a bounded subset.
- Repository tests cover at least 1,000-feedings behavior and any new bounded
  query contracts.
- Export and delete-all behavior remains correct after performance changes.
- Host-executable quality gates pass, and any native-only performance risk is
  recorded for T009 device verification.

## Expected Files

Likely changes under `src/application/`, `src/infrastructure/db/`, `src/ui/`,
`test/`, `package.json`, `package-lock.json`, and affected canonical documents.

## Steps

1. Resolve Expo SDK patch mismatches with Expo-compatible installs.
2. Add or update repository contracts for bounded history, observations, and
   reminder reconciliation.
3. Replace large-history screen rendering with a virtualized approach.
4. Add large-data regression tests and lightweight timing evidence where useful.
5. Re-run the host quality gates and record residual native profiling risks.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run test:coverage`
- `npm run lint`
- `npm run build:web`
- `npm audit --audit-level=high`
- `npx expo-doctor`
- `git diff --check`

## Risks and Rollback

Virtualized history can introduce spacing, grouping, or accessibility regressions.
Keep UI changes focused, verify empty/free/pro history states, and preserve
existing task blockers rather than expanding into store-release work.

## Completion Record

- Outcome: Complete
- Summary: Updated the Expo SDK 56 patch set required by Expo Doctor; paged Pro
  history in 100-row batches; replaced eager native history rendering with a
  virtualized `SectionList`; limited personalization to the latest 12 observed
  rows; reconciled only actionable reminders without replacing valid native
  requests; and narrowed delete cleanup to photo paths and scheduled IDs.
- Actual files changed: `package.json`, `package-lock.json`,
  `src/application/ports.ts`, `src/application/reminder-service.ts`,
  `src/application/tracking-service.ts`,
  `src/infrastructure/db/sqlite-repository.ts`,
  `src/ui/tracking-context.tsx`,
  `src/ui/screens/history-screen.native.tsx`,
  `test/mocks/react-native.tsx`, `test/history-screen.test.tsx`,
  `test/reminder-service.test.ts`, `test/sqlite-repository.test.ts`, and the
  affected canonical task/architecture/handoff documents.
- Verification: `npm run typecheck`; `npm test` (10 files, 56 tests);
  `npm run test:coverage` (90.51% statements / 84.72% branches overall,
  database repository 100% statements / 90.16% branches); `npm run lint`;
  `npm run build:web`; `npm audit --audit-level=high` (no high/critical;
  11 moderate transitive Expo tooling findings); `npx expo-doctor` (21/21);
  `git diff --check`; isolated 1,000-feeding paging/personalization/export/
  deletion regression (266 ms on the Windows host).
- Remaining risks or blocker: Native cold/warm launch, memory, and history
  scroll timing still require representative Android/iOS device evidence in
  T009. The 11 moderate transitive Expo tooling findings cannot be force-fixed
  without a breaking Expo downgrade.
