# Starter Clock Handoff

**Updated:** 2026-07-05

## Current State

T008 is `BLOCKED` on manual mobile recheck. A manual QA finding that the
feeding-ratio result text overflowed on mobile has been fixed in code, but the
fixed mobile viewport has not yet been owner-verified. On 2026-07-05, the owner
approved T007 as complete despite missing representative Android/Google Play
and iOS store-sandbox/device evidence, approved Phase 5, and explicitly
assigned T008.

The Phase 4 audit verdict remains `CHANGES REQUIRED` for release readiness:
representative mobile notification and store-sandbox evidence has not run. This
is an explicit verification waiver for task sequencing only, not evidence that
native notification or purchase behavior is release-ready.

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

## Deferred Release-Risk Evidence

This host has no Android SDK/ADB and cannot execute iOS. The Google Play
non-consumable `starter_clock_pro_lifetime`, license testers, internal testing
track, and signed Android build are not configured in repository context. Apple
Developer/App Store Connect setup remains postponed.

Before claiming release readiness in T009, verify on representative Android and
iOS targets: permission grant, denial and Settings recovery;
schedule/edit/reschedule/delete; restart/resume and time-zone reconciliation;
purchase success, pending/deferred, cancellation, failure, offline cached Pro,
restore, and refund/revocation.

## T008 Blocker and Resumption

T008 implementation and host-executable verification are complete. Manual
browser QA is still required because local browser automation was unreliable on
this host: Expo web failed while installing the DevTools fallback due to a
dotslash cache error, `python.exe` was unavailable for static serving, and
headless Chrome/Edge screenshot attempts produced invalid or missing captures.

To resume, serve the exported `dist` folder or run the web app, then manually
recheck mobile feeding-ratio results for the `Ratio 1:3:2` and
`Hydration: 66.7%` overflow case, plus desktop/mobile layout, calculator
interaction, validation, metadata/copy boundaries, and accessibility basics. If
the manual review passes, rerun `npm test`, `npm run test:coverage`,
`npm run typecheck`, `npm run lint`, `npm run build:web`, and
`git diff --check`; then mark T008 `DONE`.

## Next Action

Resume T008 manual QA only. Do not begin T009 without explicit assignment and
Phase 6 approval.
