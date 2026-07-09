# Starter Clock Release Readiness

**Status:** Blocked
**Last updated:** 2026-07-05

This document records the current release-readiness evidence for T009. The
release verdict is `CHANGES REQUIRED` because representative native device and
store-sandbox evidence has not run.

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

## Evidence Matrix

| Area | Evidence | Result |
|---|---|---|
| TypeScript | `npm run typecheck` | Pass |
| Unit/integration tests | `npm test` | Pass: 9 files, 51 tests |
| Coverage | `npm run test:coverage` | Pass: 90.15% statements / 83.33% branches overall; domain 98.5% / 96.26%; database 85.39% / 87.93% |
| Lint | `npm run lint` | Pass |
| Web export | `npm run build:web` | Pass |
| iOS export | `npx expo export --platform ios` | Pass |
| Android export | `npx expo export --platform android` | Pass |
| App config | `npx expo config --type public` | Pass; `expo-sharing`, notifications, SQLite, image picker, and IAP plugins present |
| Dependency security | `npm audit --audit-level=high` before adding `expo-sharing`; `expo install expo-sharing` audit output | No high or critical findings; 11 moderate Expo transitive findings remain |
| Expo health | `npx expo-doctor` before adding `expo-sharing` | Pass: 21/21 after SDK patch updates |
| Rendered web | Playwright Chromium against static web export at 1366x900 and 390x844 | Pass before `expo-sharing`: title/content present, calculator interaction produced `1:3:2` and `Hydration: 66.7%`, no console warnings/errors, no failed requests, no horizontal overflow |
| Source hygiene | `git diff --check`; source secret/TODO scan | Pass, with Windows line-ending warnings only |

## Blockers

1. Representative Android device or emulator evidence is still missing for
   notification permission grant, denial, Settings recovery, schedule,
   edit/reschedule, delete cancellation, restart/resume reconciliation, offline
   persistence, photo selection/denial, export share sheet, and delete-all.
2. Google Play internal-test evidence is still missing for
   `starter_clock_pro_lifetime`: purchase success, pending, cancellation,
   failure, restore, offline cached Pro, and refund/revocation.
3. Representative iOS device evidence is still missing for the same native
   notification, photo, export/delete, and StoreKit sandbox flows.
4. `expo-doctor` and `npm audit --audit-level=high` could not be rerun after
   adding `expo-sharing` because the escalation reviewer rejected further
   escalated commands due the account usage limit. Local builds and config pass
   after the dependency change, and `expo install expo-sharing` reported only
   moderate findings.
5. The final rendered Playwright check after `expo-sharing` could not be rerun
   for the same escalation-limit reason. The web UI code under test was not
   changed by the native export/share addition, and `npm run build:web` still
   passes.

## Verdict

`CHANGES REQUIRED`

Do not claim release readiness until the blockers above pass on representative
targets or are explicitly resolved by a scope decision.
