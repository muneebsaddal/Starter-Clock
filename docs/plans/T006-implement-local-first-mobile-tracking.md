# T006 — Implement Local-First Mobile Tracking

## Objective and Outcome

Build the tested iOS/Android core loop: create a starter, log and edit feedings,
see an explainable peak window, record observations/photos, and retain history
offline across restarts.

## Dependencies and Context

- Dependencies: T005 and explicit user approval of Phase 3
- Read: `docs/prd.md`, `docs/requirements.md`, `docs/ux-flow.md`,
  `docs/architecture.md`

## Scope

- In: project setup, domain and storage layers, mobile core UI, calculations,
  history, photos, offline persistence, validation, and automated tests.
- Out: notifications, purchases, web landing/calculators, and release assets.

## Acceptance Criteria

- T006-linked requirements and UX states work on representative iOS/Android.
- Strict TypeScript, domain separation, validation, and migrations follow T005.
- Calculation, edit/delete, persistence/recovery, time-zone, DST, and critical
  flow tests pass with at least the coverage threshold set by T003.
- No secrets or unjustified dependencies are introduced.

## Expected Files

Application source/config/tests plus affected canonical documents, ledger, this
plan, and handoff. Exact paths follow T005 architecture.

## Steps

1. Establish the approved Expo/TypeScript testable foundation.
2. Implement domain calculations and persistence test-first.
3. Implement the approved mobile flows and states.
4. Add photo handling, edit/delete, recovery, and accessibility behavior.
5. Verify devices, quality gates, security, and Phase 3 readiness.

## Verification

- Run unit/integration tests with coverage, typecheck, lint, and production build.
- Exercise critical flows on representative iOS and Android targets.
- Run dependency/security audit and inspect the final diff.

## Risks and Rollback

Storage migrations and photo permissions can threaten user data. Test upgrade
and denial paths; keep schema migrations reversible and feature commits focused.

## Completion Record

- Outcome: Done with explicit iOS device-test waiver
- Summary: Implemented the Expo SDK 56 mobile foundation, deterministic domain
  model, transactional versioned SQLite storage, starter and feeding lifecycle,
  peak dashboard, history/edit/delete, observed peaks, managed local photos,
  light/dark tokens, accessible recovery states, and a web tracking boundary.
  During Android verification, fixed an infinite render loop caused by an
  uncached `Date.now()` external-store snapshot and added a regression test.
  Native owner-review findings and prioritization are recorded in the
  canonical `docs/ux-flow.md` T006 feedback section.
- Actual files changed: Root Expo/TypeScript/test configuration and lockfile;
  `src/app/`, `src/domain/`, `src/application/`, `src/infrastructure/`,
  `src/ui/`; `test/`; this plan, the task ledger, and `HANDOFF.md`.
- Verification: Strict TypeScript passed; Expo lint passed; 32/32 Vitest tests
  passed; coverage passed at 93.16% statements and 86.88% branches overall,
  with domain at 98.18%/95.65% and database modules at 85%/86.84%; Expo Doctor
  passed 21/21 checks; production exports passed for iOS, Android, and web;
  `git diff --check` and source secret/TODO scan passed. `npm audit --omit=dev`
  reported 10 moderate transitive findings in Expo's CLI/config `uuid` chain
  and no high or critical finding; the suggested forced fix would downgrade
  Expo and was not applied.
- Device evidence and waiver: The owner completed the Android device review and
  accepted its recorded feedback as non-blocking follow-up work on 2026-06-22.
  iOS device execution was unavailable because the installed Expo app version
  did not match the project. The owner explicitly waived iOS device testing for
  T006 and directed completion using the Android review and feedback only. The
  successful iOS production export is build evidence, not device evidence.
- Remaining risks: iOS runtime behavior, native SQLite recovery, photo/files,
  permissions, accessibility semantics, and critical-flow parity remain
  unverified on an iOS device and must be covered before release. The Android
  navigation/active-feeding findings and deferred input improvements remain
  canonically recorded in `docs/ux-flow.md`; they are accepted follow-ups, not
  evidence that the current behavior passed those UX expectations.
- Phase 3 audit verdict: `APPROVE WITH FOLLOW-UPS`. Architecture boundaries,
  automated quality gates, Git scope, and canonical records are coherent. The
  explicit iOS waiver and Android UX findings prevent an unqualified approval.
