# T007 — Add Notifications and Purchase Handling

## Objective and Outcome

Add reliable local peak reminders and a recoverable lifetime-Pro entitlement
without weakening the free core tracking experience.

## Dependencies and Context

- Dependencies: T006 and explicit user approval of Phase 4
- Read: `docs/requirements.md`, `docs/ux-flow.md`, `docs/architecture.md`

## Scope

- In: permission flows, schedule/reschedule/cancel behavior, denial recovery,
  purchase/restore/entitlement states, free limits, tests, and disclosures.
- Out: subscriptions, cloud sync, unrelated paywalls, and store submission.

## Acceptance Criteria

- Reminder scheduling follows edited feedings and handles denial/time changes.
- Purchase, pending, failure, cancellation, restore, and offline entitlement
  states meet requirements on both mobile platforms.
- Free users retain the chartered experience; Pro gates only approved benefits.
- Current official platform/store requirements are cited and satisfied.
- Owner waiver, 2026-06-25: Apple Developer/App Store Connect testing is
  deferred for cost reasons. T007 may complete with representative Google
  Play/Android store-sandbox evidence only, provided the iOS gap is recorded as
  a deferred release risk rather than treated as verified.

## Expected Files

Notification and entitlement modules/UI/tests plus affected canonical documents,
ledger, this plan, and handoff.

## Steps

1. Verify current notification and purchase platform requirements.
2. Implement scheduling behind a testable boundary.
3. Implement entitlement and restore handling behind a testable boundary.
4. Integrate approved UX states and privacy disclosures.
5. Test failure/recovery paths and audit Phase 4.

## Verification

- Run notification/rescheduling and entitlement unit/integration tests.
- Exercise representative permission and purchase states on iOS/Android.
- Run typecheck, lint, build, security audit, and inspect the diff.
- Owner waiver, 2026-06-25: for T007 completion, replace the representative
  iOS/Android store-sandbox matrix with a representative Android/Google Play
  matrix after the seven-day postponement, around 2026-07-02. Keep iOS
  verification open for release readiness.

## Risks and Rollback

Store sandboxes differ from production and time changes are subtle. Record
sandbox evidence, keep adapters isolated, and disable optional integrations
without compromising local tracking if rollback is needed.

## Completion Record

- Outcome: DONE by owner approval on 2026-07-05 with deferred
  release-readiness verification risk
- Summary: Added schema-v2 reminder intent and derived entitlement cache,
  deterministic reminder reconciliation, Expo local-notification and direct
  store adapters, Lifetime Pro purchase/restore UI, remembered reminder
  preference, application-level Free/Pro limits, loss-safe selected-starter
  handling, official platform evidence, and failure/recovery tests.
- Actual files changed: `app.json`, dependency manifests, notification and
  purchase application/infrastructure modules, schema/repository/tracking
  modules, native tracking UI, T007 tests, `docs/architecture.md`,
  `docs/ux-flow.md`, ledger, plan, and handoff.
- Verification: strict TypeScript and Expo lint passed; 44/44 tests passed;
  coverage passed at 87.02% statements and 81.71% branches overall, with
  domain at 98.18%/95.65% and database at 82.89%/87.93%; migration from schema
  v1 passed; Expo Doctor passed 21/21; public/introspected config includes the
  notification and IAP plugins, Google Billing permission, and removal of
  unused camera/microphone permission; iOS, Android, and web production exports
  passed; dependency audit has no high/critical issue (the existing 10 moderate
  Expo toolchain findings remain); source secret/TODO scan and
  `git diff --check` passed.
- Remaining risks or blocker: Required device/store verification did not run on
  this Windows host: no Android SDK/ADB or Android device is available, iOS
  execution requires macOS/Xcode and an iOS device/simulator, and the
  `starter_clock_pro_lifetime` non-consumable plus sandbox/test accounts are not
  configured in App Store Connect or Play Console. Resume by configuring the
  same product ID in both stores, provisioning development builds and sandbox
  accounts, then exercise on iOS and Android: first permission grant, denial
  and Settings recovery; schedule/edit/reschedule/delete; restart/resume and
  time-zone change reconciliation; purchase success, pending/deferred,
  cancellation, failure, offline cached Pro, restore, and refund/revocation.
  Record evidence during T009 before claiming release readiness. Current Phase
  4 audit verdict remains `CHANGES REQUIRED` for representative native
  notification and store-sandbox evidence.
- Owner update, 2026-06-25: paid Apple Developer/App Store Connect testing is
  postponed. Resume T007 after seven days, around 2026-07-02, by configuring
  only Google Play for `starter_clock_pro_lifetime`, adding license testers,
  publishing a signed Android build to an internal test track, and running the
  Android notification and purchase matrix. T007 may be marked `DONE` if that
  Android matrix passes and the iOS gap is preserved as a deferred release risk.
- Owner update, 2026-07-05: the user approved closing T007 without the Android
  matrix and approved carrying both Android/Google Play and iOS store-sandbox
  device verification forward as T009 release-readiness risk.
