# Starter Clock Handoff

**Updated:** 2026-06-25

## Current State

T007 is `BLOCKED`. Phase 4 was approved and the notification/purchase
implementation plus host-executable verification are complete. The Phase 4
audit verdict is `CHANGES REQUIRED` because representative mobile notification
and store-sandbox evidence has not run.

On 2026-06-25, the owner deferred paid Apple Developer/App Store Connect work
for cost reasons and approved resuming T007 with Google Play/Android-only
store-sandbox verification after a seven-day pause, around 2026-07-02. This is
an explicit verification waiver for completing T007, not a change to the
long-term iOS target; iOS notification and purchase evidence remains a release
risk to resolve before claiming iOS store readiness.

## Implemented

- Schema v2 persists reminder intent/status and a derived lifetime-Pro cache.
- Feeding save commits before permission or scheduling; edit/delete and
  launch/resume reconciliation replace, cancel, expire, or retry OS requests.
- The first notification request follows a local rationale. Denial and failure
  keep tracking usable and expose recovery; success copy appears only after a
  native schedule identifier is stored.
- Direct `react-native-iap` handling covers purchased, pending, cancelled,
  failed, offline-cache, restore, loss, and revocation-on-refresh policy. Store
  receipts and tokens are not persisted or logged.
- Free remains one active starter, reminders, and 30 recent feedings. Verified
  Pro unlocks multiple active starters and retained history; entitlement loss
  deletes nothing and keeps one persisted selected starter browsable.
- Official Expo, Apple, and Google requirements checked on 2026-06-22 are cited
  in `docs/architecture.md`.

## Verification Evidence

- Strict TypeScript, Expo lint, and 44/44 tests passed.
- Coverage passed: 87.02% statements / 81.71% branches overall;
  98.18%/95.65% domain; 82.89%/87.93% database.
- Expo Doctor passed 21/21. Production exports passed for iOS, Android, and web.
- App-config introspection confirms the notification/IAP plugins, Google
  Billing permission, and removal directives for unused camera/microphone
  permissions.
- Dependency audit has no high or critical issue. The existing ten moderate
  transitive Expo CLI/config findings remain; forced remediation would
  downgrade Expo.
- Source secret/TODO scan and `git diff --check` passed.

## Exact Blocker and Resumption

This host has no Android SDK/ADB and cannot execute iOS. The Google Play
non-consumable `starter_clock_pro_lifetime`, license testers, internal testing
track, and signed Android build are not configured in repository context. Apple
Developer/App Store Connect setup is intentionally postponed.

To resume T007 around 2026-07-02, configure `starter_clock_pro_lifetime` in
Google Play, add license testers, publish a signed Android build to an internal
test track, and verify on a representative Android target: permission grant,
denial and Settings recovery; schedule/edit/reschedule/delete; restart/resume
and time-zone reconciliation; purchase success, pending/deferred, cancellation,
failure, offline cached Pro, restore, and refund/revocation. Record evidence in
the T007 plan, rerun all checks, inspect the diff, audit Phase 4, and mark T007
`DONE` only if the Android matrix passes with the owner-approved iOS waiver
clearly preserved.

## Next Action

Resume T007 only. Do not begin T008 while T007 is blocked or without a later
explicit assignment and phase approval.
