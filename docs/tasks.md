# Starter Clock Task Ledger

**Last updated:** 2026-07-19

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
| T007 | Add notifications and purchase handling | 4 | DONE | T006, user approval of Phase 4 | [Plan](plans/T007-add-notifications-and-purchases.md) |
| T008 | Build web landing page and calculators | 5 | DONE | T003, T005, user approval of Phase 5 | [Plan](plans/T008-build-web-landing-and-calculators.md) |
| T009 | Verify platforms, accessibility, privacy, and data controls | 6 | BLOCKED | T007, T008, T013, user approval of Phase 6 | [Plan](plans/T009-verify-release-readiness.md) |
| T010 | Prepare store assets and release builds | 6 | PLANNED | T009, T012, T013 | [Plan](plans/T010-prepare-store-release.md) |
| T011 | Harden performance and architecture before store testing | 6 | DONE | T006, T008, user approval to continue non-store development while T009 is blocked | [Plan](plans/T011-performance-architecture-hardening.md) |
| T012 | Prepare non-submission Android release groundwork | 6 | DONE | T011, explicit owner assignment to work before T009 completes | [Plan](plans/T012-prepare-android-release-groundwork.md) |
| T013 | Integrate the approved Cool Quiet visual system | 6 | READY | T004, T006, T011, owner approval of the refreshed visual direction | [Plan](plans/T013-integrate-cool-quiet-visual-system.md) |

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
readiness. On 2026-07-05, the user approved T007 as complete with the
unverified Android/Google Play and iOS store-sandbox/device evidence recorded
as deferred release-readiness risk for T009, approved Phase 5, and explicitly
assigned T008.
T008 was completed on 2026-07-05 after Playwright/Chrome mobile verification
confirmed the feeding-ratio result block no longer clips or overflows.
The user approved Phase 6 and explicitly assigned T009 on 2026-07-05. T009 is
blocked on representative native device/store-sandbox verification and the
final rendered post-`expo-sharing` web check, as recorded in
`docs/release-readiness.md`. The final audit and Expo Doctor reruns passed in
T011.
On 2026-07-10, the user confirmed the store-account blockers will remain for
now and asked to continue structural and architectural hardening that does not
depend on Apple or Google store access. T011 is ready for explicit assignment.
On 2026-07-18, the user confirmed the Google Play Console developer account is
created and explicitly asked to continue Starter Clock. T011 completed with
paged/virtualized history, bounded capability queries, a 1,000-feeding
regression, SDK-compatible patch updates, and passing host quality gates. T009
remains blocked on console configuration and representative device/store
sandbox evidence.
Later on 2026-07-18, the user reported that Google Play developer-account
verification is in process and asked to record all useful work that can proceed
while waiting. T012 permanently records the narrowed, non-submission Android
release groundwork. The owner explicitly assigned T012 on 2026-07-18. T012
completed the local build profiles and versioning, production app assets,
public privacy/support pages, Play listing and Data Safety drafts, screenshot
plan, and Android evidence checklist. T009 remains the release-readiness owner
and T010 remains the final release task.
On 2026-07-19, the owner approved the refreshed Cool Quiet visual direction and
asked to reconcile the project plan. T013 now owns production integration of
that design source and is `READY`, but it has not been explicitly assigned.
T009 must run against the final T013 interface so its eventual device,
accessibility, and store evidence is not invalidated by a later redesign.
