# T005 — Define and Test the Estimation Model and Architecture

## Objective and Outcome

Specify an implementation-ready local-first architecture and a transparent,
deterministic peak-window model backed by executable tests or a focused model
prototype.

## Dependencies and Context

- Dependencies: T003 and T004
- Read: `docs/requirements.md`, `docs/prd.md`, `docs/ux-flow.md`,
  `docs/architecture.md`, `docs/roadmap.md`, `docs/tasks.md`, and
  `docs/research/market-research.md`. The PRD, roadmap, and ledger are included
  because this task closes Phase 2 with the required phase-boundary audit.

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

- Outcome: Completed on 2026-06-21.
- Summary: Defined 14 stable architecture decisions, a normalized SQLite data
  contract, local-first capability workflows, a versioned conservative
  `baseline-v1` model, missing-input widening, and a five-observation stable
  personalization gate. Added an executable strict TypeScript reference model.
- Actual files changed: `docs/architecture.md`, `docs/requirements.md`,
  `docs/prd.md`, `docs/roadmap.md`, `docs/tasks.md`,
  `docs/prototypes/t005-model/`, this plan, and `HANDOFF.md`.
- Verification: `npm run typecheck` passed. `npm test` passed 16/16 tests with
  97.67% statement, 97.26% branch, 100% function, and 100% line coverage. npm
  install/audit reported zero vulnerabilities. `git diff --check` passed. All
  five cited Expo pages returned HTTP 200; all scientific citations resolve to
  open-access articles or a verified DOI. Package versions were checked against
  npm on 2026-06-21.
- Remaining risks: The model coefficients do not have household observed-peak
  accuracy evidence, so no accuracy claim or interval narrowing is permitted.
  Native notification, purchase, file, permission, and store behavior remains
  subject to later development-build/device verification. T004's waived
  representative usability study remains accepted uncertainty.

## Phase 2 Audit

- Requirements and PRD: aligned. No scope, platform, price, or policy boundary
  changed. FR-004/FR-008 now link to their canonical technical decisions.
- UX and architecture: aligned. The estimate remains an interval, reminder
  capture remains post-commit and optional, missing inputs widen explicitly,
  and domain logic stays independent of UI/storage.
- Records and traceability: task, plan, roadmap, requirements, PRD, and handoff
  describe the same current state. Stable ADR/model IDs and executable evidence
  support T006.
- Dependencies and debt: current Expo/native capabilities and package snapshots
  were verified from primary sources. Empirical model calibration and native
  adapter/device validation are explicit later gates, not hidden completion
  claims.
- Phase verdict: `APPROVE WITH FOLLOW-UPS`. Phase 3 may start only after the
  user's explicit phase approval and assignment of T006.
