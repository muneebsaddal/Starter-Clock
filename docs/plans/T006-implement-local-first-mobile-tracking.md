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

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T005 and Phase 3 approval are required.
