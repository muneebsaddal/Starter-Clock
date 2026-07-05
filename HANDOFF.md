# Starter Clock Handoff

**Updated:** 2026-07-05

## Current State

T008 is `DONE`. On 2026-07-05, the owner approved T007 as complete despite
missing representative Android/Google Play and iOS store-sandbox/device
evidence, approved Phase 5, and explicitly assigned T008. The web landing page
and calculators are implemented and verified, including Playwright/Chrome
mobile coverage for the reported feeding-ratio result overflow and follow-up
scroll regression. The owner manually accepted T008 on 2026-07-05.

The Phase 4 audit verdict remains `CHANGES REQUIRED` for release readiness:
representative mobile notification and store-sandbox evidence has not run. This
is an explicit verification waiver for task sequencing only, not evidence that
native notification or purchase behavior is release-ready.

## Implemented

- Responsive public web landing page and free feeding-ratio/hydration
  calculators are implemented without web tracking, accounts, notifications, or
  purchase UI.
- Web calculators use shared domain formulas and boundary validation. Mobile
  web verification confirmed `Ratio 1:3:2` and `Hydration: 66.7%` render inside
  the feeding-ratio card without horizontal overflow, and that the React Native
  Web scroll container moves on mobile wheel scrolling.
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
- T008 web verification passed on 2026-07-05: `npm run typecheck`,
  `npm test`, `npm run test:coverage`, `npm run lint`, `npm run build:web`,
  `git diff --check`, and Playwright/Chrome mobile screenshot/DOM/scroll
  checks.

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

## Phase 5 Outcome

Phase 5 audit verdict: `APPROVE WITH FOLLOW-UPS`. T008 acceptance criteria
passed. Follow-ups move to T009/release readiness: broader cross-browser visual
QA, native notification/store sandbox evidence, privacy/data-control checks,
and the representative platform matrix.

## Next Action

Do not begin T009 without explicit assignment and Phase 6 approval.
