# Starter Clock Handoff

**Updated:** 2026-06-21

## Current State

T005 is `DONE`. Phase 2 is complete with verdict `APPROVE WITH FOLLOW-UPS`.
The core UX/prototype, versioned peak model, local-first architecture, data
contract, capability boundaries, and implementation verification plan are now
fixed. Phase 3 has not been approved and T006 must not start automatically.

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

- Model prototype: strict TypeScript passed; 16/16 tests passed.
- Coverage: 97.67% statements, 97.26% branches, 100% functions/lines.
- Dependency install/audit: zero vulnerabilities.
- Documentation: primary Expo capabilities, current npm package snapshot, and
  open-access scientific limits verified on 2026-06-21.
- Final task checks: `git diff --check` and source-link verification passed.

## Follow-ups and Accepted Risk

- `baseline-v1` is a conservative, transparent heuristic without household
  predictive-accuracy evidence. Before any accuracy claim or interval
  narrowing, the held-out evidence gate in `architecture.md` must pass.
- Native notifications, purchases, photo/files, permissions, migrations, and
  store behavior require implementation and device/sandbox verification in
  later tasks.
- T004's representative five-person speed/comprehension study was explicitly
  waived; those targets remain non-blocking validation opportunities.

## Next Action

Wait for explicit user approval of Phase 3 and assignment of T006. Do not begin
implementation automatically.
