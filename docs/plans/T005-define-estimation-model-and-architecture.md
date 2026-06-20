# T005 — Define and Test the Estimation Model and Architecture

## Objective and Outcome

Specify an implementation-ready local-first architecture and a transparent,
deterministic peak-window model backed by executable tests or a focused model
prototype.

## Dependencies and Context

- Dependencies: T003 and T004
- Read: `docs/requirements.md`, `docs/ux-flow.md`, `docs/architecture.md`,
  `docs/research/market-research.md`

## Scope

- In: domain/data model, storage and migrations, estimation inputs/fallbacks,
  personalization boundary, notifications, photos, purchases, export/deletion,
  package decisions, model tests, and architecture decisions.
- Out: broad production UI and full feature implementation.

## Acceptance Criteria

- Architecture decisions have stable IDs, rationale, alternatives, and impacts.
- The model returns an explainable window, handles missing inputs, avoids safety
  claims, and has tests covering ratios, hydration, temperature, and edge cases.
- Local-first boundaries, migrations, privacy, platform adaptation, and domain
  separation are explicit.
- Current framework/package capabilities are verified from primary sources.
- T006 can implement without unresolved foundational decisions.

## Expected Files

`docs/architecture.md`, focused model prototype/tests if needed,
`docs/requirements.md`, `docs/tasks.md`, this plan, and `HANDOFF.md`.

## Steps

1. Research current platform constraints and scientific limits.
2. Define domain entities, data lifecycle, and system boundaries.
3. Specify and prototype the deterministic model.
4. Test representative, missing, boundary, time-zone, and DST cases.
5. Record decisions, risks, and the Phase 2 audit.

## Verification

- Run model unit tests and strict checks applicable to the prototype.
- Review decisions against every architecture-affecting requirement and UX state.
- Verify primary-source links, dependency rationale, and the final diff.

## Risks and Rollback

Fermentation is variable and available datasets may be weak. Prefer conservative
windows and transparent uncertainty; isolate the model so it can be replaced.

## Completion Record

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T003 and T004 must be complete.
