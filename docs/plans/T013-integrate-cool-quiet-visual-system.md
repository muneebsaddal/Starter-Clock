# T013 — Integrate the Cool Quiet Visual System

## Objective and Outcome

Translate the owner-approved Starter Clock v3 visual direction into the
production mobile tracking experience without changing product behavior,
navigation, estimation logic, persistence, notifications, or purchases.

## Dependencies and Context

- Dependencies: T004, T006, T011, and owner approval of the refreshed visual
  direction on 2026-07-19
- Read: `docs/ux-flow.md`, `docs/requirements.md`, `docs/architecture.md`,
  `output/design/starter-clock-v2/README.md`, and
  `output/design/starter-clock-v2/tokens.json`
- Visual source: `output/pdf/starter-clock-v2-affinity.pdf` and the editable
  SVGs under `output/design/starter-clock-v2/`

## Scope

- In: locally bundled DM Sans; shared semantic theme and typography tokens;
  lighter type weights; cooler light/dark palettes; revised spacing, sizing,
  radii, and hierarchy across shared primitives, Today, feeding entry, save
  feedback, History, Settings, and tracking modals; accessible native icons;
  visual regression evidence at required viewports and appearances.
- Out: new features, new navigation, changed calculations or copy semantics,
  public-web redesign, store listing screenshots, purchase configuration, and
  representative store-sandbox verification.

## Acceptance Criteria

- Production tracking UI uses locally bundled DM Sans with Regular, Medium, and
  Semibold as the normal hierarchy; routine 700/800 weights are removed.
- Light and dark semantic colors match the approved cool sage/slate direction,
  preserve meaning without color, and meet WCAG AA for normal text.
- The dashboard answers the peak-window question immediately without an
  oversized hero, and feeding entry preserves the fast primary path with
  optional details progressively disclosed.
- Shared controls meet 48 dp touch targets, visible focus/state requirements,
  200% text reflow, and 320 logical-pixel layout requirements.
- Existing empty, loading, error, offline, permission, reminder, entitlement,
  edit, and deletion behavior remains functional and visually coherent.
- The public web landing page and calculators are unchanged unless a defect is
  caused by shared-code integration.

## Expected Files

Font assets and affected files under `src/ui/` and the Expo root layout,
targeted UI tests or visual-check scripts, this plan, `docs/ux-flow.md`,
`docs/tasks.md`, `docs/roadmap.md`, and `HANDOFF.md`.

## Steps

1. Add and preload local DM Sans assets with a safe system-font fallback.
2. Replace warm theme constants and heavy shared primitive styles with the
   approved semantic tokens.
3. Integrate the revised hierarchy into Today and feeding entry first, then
   reconcile History, Settings, navigation, and modal states.
4. Verify light/dark, 320x640 and 390x844 layouts, 200% text, keyboard/focus,
   touch targets, contrast, and representative state coverage.
5. Run the full host quality gates, inspect the final diff, and preserve T009
   as the owner of representative native/store verification.

## Verification

- Run strict TypeScript, lint, unit/integration tests, coverage, web export, and
  iOS/Android Expo exports.
- Render and inspect the critical tracking flow in light and dark at 320x640
  and 390x844; verify font loading, overflow, touch targets, focus order, and
  contrast.
- Confirm no domain, storage, notification, purchase, or public-web behavior
  changed unintentionally; run `git diff --check`.

## Risks and Rollback

Font preloading can delay or flash the first frame, and visual refactors can
hide state or accessibility regressions. Keep font assets local, retain a
system fallback, migrate shared primitives before screens, and revert token or
screen changes independently if a quality gate fails.

## Completion Record

- Outcome: Not started
- Summary: The design source is approved and verified; production integration
  requires explicit assignment.
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T013 is ready but has not been explicitly
  assigned. T009 must verify the resulting final UI on representative devices.
