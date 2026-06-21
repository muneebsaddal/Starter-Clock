# Starter Clock Handoff

**Updated:** 2026-06-22

## Current State

T006 is `DONE`. The Phase 3 audit verdict is `APPROVE WITH FOLLOW-UPS`.
Implementation and host-executable verification are complete. The owner
completed Android review and accepted its feedback as follow-up work. The owner
explicitly waived iOS device testing because the installed Expo app version did
not match the project; the successful iOS export does not count as device
verification.

## Decisions and Constraints

- `architecture.md` contains ADR-001 through ADR-014 and is the implementation
  contract for T006.
- Use one Expo SDK 56 / React Native repository, strict TypeScript, Expo Router,
  SQLite repositories, runtime boundary validation, and inward dependencies.
- Mobile has Today and History as persistent destinations; web MVP remains only
  the public landing page and calculators.
- `baseline-v1` returns an estimated interval from ratio, hydration, optional
  temperature, and optional flour type. Missing/out-of-calibration values widen
  the interval and never invent an input.
- Personalization requires five eligible observations with median absolute
  residual deviation at most three hours. It shifts by a capped median residual
  and never narrows the MVP interval.
- Reminder intent is database truth; feeding save commits before permission or
  scheduling. Photos remain managed local files. Purchases use direct store
  integration. Export/delete remain free.
- No analytics, account, cloud synchronization, remote prediction, AI, or
  accuracy claim is approved.

## Verification Evidence

- T006 strict TypeScript and Expo lint passed.
- 32/32 tests passed, including the native clock-render regression. Overall
  coverage is 93.16% statements and 86.88% branches; domain coverage is
  98.18%/95.65% and database coverage is 85%/86.84%.
- Expo Doctor passed 21/21 checks. Production exports passed for iOS, Android,
  and web.
- Dependency audit found no high or critical issue. Ten moderate transitive
  findings remain in Expo's CLI/config dependency chain; the available forced
  remediation would incorrectly downgrade Expo.
- `git diff --check` and the source secret/TODO scan passed.

## Follow-ups and Accepted Risk

- `baseline-v1` is a conservative, transparent heuristic without household
  predictive-accuracy evidence. Before any accuracy claim or interval
  narrowing, the held-out evidence gate in `architecture.md` must pass.
- Native notifications, purchases, photo/files, permissions, migrations, and
  store behavior require implementation and device/sandbox verification in
  later tasks.
- iOS native SQLite recovery, managed-photo permission/file behavior,
  accessibility semantics, and critical-flow parity remain unverified and must
  be covered before release despite the T006 owner waiver.
- Android review feedback about navigation continuity, concurrent unfinished
  feedings, and deferred input improvements remains canonical in
  `docs/ux-flow.md` and must be dispositioned before release.
- T004's representative five-person speed/comprehension study was explicitly
  waived; those targets remain non-blocking validation opportunities.

## Next Action

Await explicit user approval of Phase 4 and assignment of T007. Do not begin
T007 automatically. Preserve the T006 native feedback for explicit scheduling
before release.
