# Starter Clock Handoff

**Updated:** 2026-07-18

## Current State

T009 is `BLOCKED`, T011 is `DONE`, and T012 is `DONE`. On 2026-07-05, the owner approved T007 as complete despite
missing representative Android/Google Play and iOS store-sandbox/device
evidence, approved Phase 5, and explicitly assigned T008. The web landing page
and calculators are implemented and verified, including Playwright/Chrome
mobile coverage for the reported feeding-ratio result overflow and follow-up
scroll regression. The owner manually accepted T008 on 2026-07-05.
The owner then approved Phase 6 and explicitly assigned T009 on 2026-07-05.
Host verification and in-scope data-control fixes are complete, but release
readiness remains blocked on representative native device/store-sandbox
verification and the final rendered post-`expo-sharing` web check.
On 2026-07-10, the owner confirmed the store-account blockers will remain for
now and asked to continue development that can be done without Apple/Google
store access. T011 was created for performance and architecture hardening.
On 2026-07-18, the owner confirmed the Google Play Console developer account
has been created and assigned continuation of Starter Clock. T011 completed
performance and architecture hardening. Android store verification still
requires app/product configuration, a signed test build, license testers, and
representative device evidence.
Later on 2026-07-18, the owner reported that Google Play developer-account
verification is in process and asked to record all useful work that can proceed
while waiting. T012 now records non-submission Android release groundwork and
was explicitly assigned and completed on 2026-07-18. No price decision,
upload, submission, or other external store mutation was made.

The Phase 4 audit verdict remains `CHANGES REQUIRED` for release readiness:
representative mobile notification and store-sandbox evidence has not run. This
is an explicit verification waiver for task sequencing only, not evidence that
native notification or purchase behavior is release-ready.

## Implemented

- Responsive public web landing page and free feeding-ratio/hydration
  calculators are implemented without web tracking, accounts, notifications, or
  purchase UI. The web root layout intentionally omits the mobile tracking
  provider.
- Mobile data controls now expose export and delete-all actions to Free and Pro
  users. Export writes `starter-clock-export/v1` JSON, excludes OS notification
  IDs, and opens the native share sheet through `expo-sharing`. Delete-all
  clears local records, preferences, derived entitlement cache, reminders, and
  managed photos without deleting store ownership.
- Web calculators use shared domain formulas and boundary validation. Mobile
  web verification confirmed `Ratio 1:3:2` and `Hydration: 66.7%` render inside
  the feeding-ratio card without horizontal overflow, the React Native Web
  scroll container remains scrollable, and the live web console is clean for
  the reported mobile tracking, favicon, and deprecated shadow warnings.
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
- Pro history loads in 100-row pages and renders through a native virtualized
  list. Personalization reads at most 12 observed feedings; reminder and delete
  cleanup queries materialize only actionable capability state. Full export
  remains complete.
- T012 adds account-free EAS development/internal-test/production profiles,
  explicit initial build versions, generated and validated production app
  assets, and public Privacy and Support routes.
- The Android store draft records truthful listing copy, a local-only Data
  Safety basis, the unpriced `starter_clock_pro_lifetime` product, a real-UI
  screenshot plan, and the complete Android T009 evidence checklist.

## Verification Evidence

- Strict TypeScript, Expo lint, and 56/56 tests passed.
- Coverage passed: 90.51% statements / 84.72% branches overall;
  98.5%/96.26% domain; 89.71%/89.55% database.
- Expo Doctor passed 21/21. Production exports passed for iOS, Android, and web.
- App-config introspection confirms the notification/IAP plugins, Google
  Billing permission, and removal directives for unused camera/microphone
  permissions.
- Dependency audit has no high or critical issue. Eleven moderate
  transitive Expo CLI/config findings remain; forced remediation would
  downgrade Expo.
- Source secret/TODO scan and `git diff --check` passed.
- T008 web verification passed on 2026-07-05: `npm run typecheck`,
  `npm test`, `npm run test:coverage`, `npm run lint`, `npm run build:web`,
  `git diff --check`, and Playwright/Chrome mobile screenshot/DOM/scroll
  checks. A follow-up regression check on live `localhost:8081` confirmed no
  console warnings/errors, no failed requests, and `favicon.ico` served with
  200 `image/x-icon` on mobile and desktop Chrome.
- T009 host verification on 2026-07-05 passed: `npm run typecheck`,
  `npm test` (51/51), `npm run test:coverage`, `npm run lint`,
  `npm run build:web`, `npx expo export --platform ios`,
  `npx expo export --platform android`, `npx expo config --type public`,
  `git diff --check`, source secret/TODO scan, and Playwright Chromium rendered
  web checks at 1366x900 and 390x844 before adding `expo-sharing`.
- T011 verification on 2026-07-18 passed: strict TypeScript, Expo lint, 56/56
  tests, 90.51% statement / 84.72% branch coverage, web export, Expo Doctor
  21/21, no high/critical audit finding, and `git diff --check`. The isolated
  1,000-feeding paging/personalization/export/delete regression ran in 266 ms
  on this host.
- T012 verification on 2026-07-18 passed: strict TypeScript, Expo lint, 56/56
  tests, coverage thresholds, web and Android exports, Expo Doctor 21/21,
  public config and release/asset validators, rendered Privacy/Support QA at
  1366x900 and 320x844, source hygiene, and `git diff --check`. Dependency
  audit found no high/critical issue; 12 moderate Expo transitive findings
  remain.

## Deferred Release-Risk Evidence

This host has no Android SDK/ADB and cannot execute iOS. The Google Play Console
developer account exists and its verification is in process; the app, non-consumable
`starter_clock_pro_lifetime`, license testers, internal testing track, and
signed Android build are not configured in repository context. Apple Developer/
App Store Connect setup remains postponed.

Before claiming release readiness in T009, verify on representative Android and
iOS targets: permission grant, denial and Settings recovery;
schedule/edit/reschedule/delete; restart/resume and time-zone reconciliation;
purchase success, pending/deferred, cancellation, failure, offline cached Pro,
restore, and refund/revocation.
Also verify the export share sheet and delete-all flow on Android and iOS.
The final rendered Playwright web check after `expo-sharing` remains deferred;
the final dependency audit and Expo Doctor checks now pass.

## Phase 5 Outcome

Phase 5 audit verdict: `APPROVE WITH FOLLOW-UPS`. T008 acceptance criteria
passed. Follow-ups move to T009/release readiness: broader cross-browser visual
QA, native notification/store sandbox evidence, privacy/data-control checks,
and the representative platform matrix.

## Next Action

Wait for Google Play verification, then resume T009 with Play
app/product/test-track configuration and representative Android verification.
Do not begin T010 automatically; T012 is complete but T009 remains blocked.
