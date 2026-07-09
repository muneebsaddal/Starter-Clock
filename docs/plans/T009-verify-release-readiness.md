# T009 — Verify Platforms, Accessibility, Privacy, and Data Controls

## Objective and Outcome

Independently verify the release candidate across representative platforms and
close functional, accessibility, privacy, security, and data-control gaps.

## Dependencies and Context

- Dependencies: T007, T008, and explicit user approval of Phase 6
- Read: all canonical product, UX, architecture, research, and roadmap documents

## Scope

- In: traceability audit, regression/E2E/device matrix, accessibility, offline
  recovery, purchases, notifications, export/deletion, privacy, security, fixes.
- Out: new product features and unapproved scope expansion.

## Acceptance Criteria

- Every release criterion has direct passing evidence or a recorded blocker.
- Critical flows pass on representative iOS, Android, and web targets.
- Accessibility, time-zone/DST, offline recovery, permissions, purchases,
  export, deletion, and privacy checks pass.
- Meaningful bugs receive regression tests; unresolved release risks are explicit.

## Expected Files

Tests/fixes and a release-readiness record under `docs/` if needed, plus affected
canonical documents, ledger, this plan, and handoff.

## Steps

1. Build the requirement-to-test evidence matrix.
2. Run automated quality, security, accessibility, and build gates.
3. Execute the representative device/browser matrix.
4. Fix in-scope defects and add regression coverage.
5. Audit evidence and issue the required verdict.

## Verification

- Run the complete approved test, coverage, lint, typecheck, build, audit, E2E,
  accessibility, and device matrix.
- Review the final diff and release-risk register independently.

## Risks and Rollback

Platform-only failures may be hard to reproduce. Preserve diagnostics and exact
environments; isolate fixes and block release rather than waiving critical gaps.

## Completion Record

- Outcome: Blocked
- Summary: Host verification and in-scope data-control fixes completed. Release
  readiness remains blocked because representative Android/iOS native device,
  notification, store-sandbox, export/share, delete-all, and final escalated
  audit/doctor evidence has not run.
- Actual files changed: `docs/release-readiness.md`, `docs/tasks.md`,
  `HANDOFF.md`, `docs/architecture.md`, `docs/roadmap.md`, `app.json`,
  `package.json`, `package-lock.json`, `src/application/ports.ts`,
  `src/application/tracking-service.ts`,
  `src/infrastructure/db/sqlite-repository.ts`,
  `src/infrastructure/files/data-export.native.ts`,
  `src/infrastructure/files/data-export.ts`,
  `src/ui/tracking-context.tsx`, `src/ui/screens/today-screen.native.tsx`,
  `test/sqlite-repository.test.ts`, and `test/tracking-service.test.ts`.
- Verification: `npm run typecheck`; `npm test`; `npm run test:coverage`;
  `npm run lint`; `npm run build:web`; `npx expo export --platform ios`;
  `npx expo export --platform android`; `npx expo config --type public`;
  `git diff --check`; source secret/TODO scan; Playwright Chromium rendered web
  check before `expo-sharing`; `npm audit --audit-level=high` and
  `npx expo-doctor` before adding `expo-sharing`.
- Remaining risks or blocker: Resume by running the matrix in
  `docs/release-readiness.md` on representative Android and iOS devices/store
  sandboxes, then rerun `npx expo-doctor`, `npm audit --audit-level=high`, and
  the rendered Playwright web check after the escalation limit resets.
