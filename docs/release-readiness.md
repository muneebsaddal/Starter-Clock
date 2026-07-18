# Starter Clock Release Readiness

**Status:** Blocked
**Last updated:** 2026-07-19

This document records the current release-readiness evidence for T009. The
release verdict is `CHANGES REQUIRED` because the approved final interface is
not integrated and representative native device/store-sandbox evidence has not
run.

## Fixes Completed In T009

- Added Free/Pro-visible data controls on mobile Today: export data and delete
  all local data.
- Added export format `starter-clock-export/v1` for starters, feedings,
  estimate snapshots, observations, reminder intent/status, preferences, and
  photo metadata.
- Excluded OS notification identifiers from export output.
- Added confirmed delete-all behavior that clears starters, feedings,
  observations, reminders, local photos, preferences, and the derived
  entitlement cache without deleting store ownership.
- Added `expo-sharing` and opens the system share sheet for JSON export.
- Updated Expo SDK 56 patch dependencies to the versions required by
  Expo Doctor before `expo-sharing` was added.

## Hardening Completed In T011

- Aligned the final Expo SDK 56 patch dependencies and passed Expo Doctor 21/21.
- Paged and virtualized Pro history, bounded observation/reminder queries, and
  narrowed delete cleanup without limiting complete export.
- Added 1,000-feeding repository coverage and native History screen contract
  tests; 56/56 tests and the complete host quality suite pass.

## Evidence Matrix

| Area | Evidence | Result |
|---|---|---|
| TypeScript | `npm run typecheck` | Pass |
| Unit/integration tests | `npm test` | Pass: 10 files, 56 tests |
| Coverage | `npm run test:coverage` | Pass: 90.51% statements / 84.72% branches overall; domain 98.5% / 96.26%; database 89.71% / 89.55% |
| Lint | `npm run lint` | Pass |
| Web export | `npm run build:web` | Pass |
| iOS export | `npx expo export --platform ios` | Pass |
| Android export | `npx expo export --platform android` | Pass |
| App config | `npx expo config --type public` | Pass; `expo-sharing`, notifications, SQLite, image picker, and IAP plugins present |
| Dependency security | `npm audit --audit-level=high` after final SDK patch alignment | No high or critical findings; 11 moderate Expo transitive findings remain |
| Expo health | `npx expo-doctor` after final SDK patch alignment | Pass: 21/21 |
| Rendered web | Playwright Chromium against static web export at 1366x900 and 390x844 | Pass before `expo-sharing`: title/content present, calculator interaction produced `1:3:2` and `Hydration: 66.7%`, no console warnings/errors, no failed requests, no horizontal overflow |
| Source hygiene | `git diff --check`; source secret/TODO scan | Pass, with Windows line-ending warnings only |

## Blockers

1. T013 has not integrated the owner-approved Cool Quiet interface. Device and
   accessibility evidence must cover that final UI rather than the superseded
   warm production styling.
2. Representative Android device or emulator evidence is still missing for
   notification permission grant, denial, Settings recovery, schedule,
   edit/reschedule, delete cancellation, restart/resume reconciliation, offline
   persistence, photo selection/denial, export share sheet, and delete-all.
3. Google Play internal-test evidence is still missing for
   `starter_clock_pro_lifetime`: purchase success, pending, cancellation,
   failure, restore, offline cached Pro, and refund/revocation. The Play
   developer account exists, but account verification is currently in process;
   the app, product, testers, track, and signed bundle are not configured.
4. Representative iOS device evidence is still missing for the same native
   notification, photo, export/delete, and StoreKit sandbox flows.
5. The final rendered Playwright check after `expo-sharing` has not been rerun.
   The web UI code under test was not changed by the native export/share
   addition, and `npm run build:web` still passes.

## Recorded Waiting-Period Work

T012 completed the non-submission Android release groundwork that could proceed
while Play verification is pending: validated local EAS profiles/versioning,
production visual assets, public privacy/support pages, truthful listing and
Data Safety drafts, screenshot planning, and the Android T009 evidence
checklist. Its host checks passed, but it supplies no representative native or
store-sandbox evidence. Uploads, signing secrets, product activation/pricing,
submission, and all representative device/store claims remain out of scope.

On 2026-07-19, the owner approved the Cool Quiet mobile design package stored
under `output/design/starter-clock-v2/` and `output/pdf/`. T013 is ready to
integrate it while Play verification is pending. Its host and visual checks
will not satisfy the representative native/store evidence above.

## Verdict

`CHANGES REQUIRED`

Do not claim release readiness until T013 is complete and the remaining
blockers pass on representative targets or are explicitly resolved by a scope
decision.
