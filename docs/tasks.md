# Starter Clock Task Ledger

**Last updated:** 2026-06-25

This is the authoritative task index and status ledger. IDs are permanent and
never reused. The user selects tasks explicitly and approves phase changes.

| ID | Task | Phase | Status | Depends on | Plan |
|---|---|---:|---|---|---|
| T001 | Establish project operating workflow | 0 | DONE | None | [Plan](plans/T001-establish-project-operating-workflow.md) |
| T002 | Validate problem and competitor gap | 1 | DONE | User approval of Phase 1 | [Plan](plans/T002-validate-problem-and-competitor-gap.md) |
| T003 | Define measurable MVP requirements | 1 | DONE | T002 | [Plan](plans/T003-define-measurable-mvp-requirements.md) |
| T004 | Design and prototype the core feed-to-peak flow | 2 | DONE | T003, user approval of Phase 2 | [Plan](plans/T004-design-core-feed-to-peak-flow.md) |
| T005 | Define and test the estimation model and architecture | 2 | DONE | T003, T004 | [Plan](plans/T005-define-estimation-model-and-architecture.md) |
| T006 | Implement local-first mobile tracking | 3 | DONE | T005, user approval of Phase 3 | [Plan](plans/T006-implement-local-first-mobile-tracking.md) |
| T007 | Add notifications and purchase handling | 4 | BLOCKED | T006, user approval of Phase 4 | [Plan](plans/T007-add-notifications-and-purchases.md) |
| T008 | Build web landing page and calculators | 5 | PLANNED | T003, T005, user approval of Phase 5 | [Plan](plans/T008-build-web-landing-and-calculators.md) |
| T009 | Verify platforms, accessibility, privacy, and data controls | 6 | PLANNED | T007, T008, user approval of Phase 6 | [Plan](plans/T009-verify-release-readiness.md) |
| T010 | Prepare store assets and release builds | 6 | PLANNED | T009 | [Plan](plans/T010-prepare-store-release.md) |

## Status Definitions

- `PLANNED`: defined but not sufficiently prepared or approved for execution.
- `READY`: scoped, unblocked, and eligible for explicit assignment.
- `IN PROGRESS`: currently being executed.
- `BLOCKED`: incomplete because a recorded dependency or decision prevents it.
- `DONE`: all acceptance criteria and required verification passed.
- `CANCELLED`: intentionally removed without reusing its identity.

Phase 1 execution was approved by the user on 2026-06-21. T002 and T003 are
complete. The Phase 1 audit passed. The user approved Phase 2 and explicitly
assigned T004 on 2026-06-21. T004 is complete with an explicit owner waiver of
unavailable representative testing. The user explicitly assigned T005 on
2026-06-21. T005 is complete and the Phase 2 audit verdict is `APPROVE WITH
FOLLOW-UPS`. The user approved Phase 3 and explicitly assigned T006 on
2026-06-21. T006 is complete with Android owner-review evidence and an explicit
owner waiver of iOS device testing due to an Expo app version mismatch. The
Phase 3 audit verdict is `APPROVE WITH FOLLOW-UPS`. The user approved Phase 4
and explicitly assigned T007 on 2026-06-22. T007 implementation and host
verification are complete. On 2026-06-25, the user postponed paid Apple
Developer/App Store Connect testing and approved resuming after seven days with
Google Play/Android-only store-sandbox verification as the T007 completion
matrix. iOS evidence remains a deferred release risk before iOS store
readiness.
