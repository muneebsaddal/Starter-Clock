# Starter Clock Roadmap

**Status:** Phase 4 in progress; T007 blocked on deferred Android store-sandbox verification
**Last updated:** 2026-06-25

This document owns milestone intent and phase outcomes. Task status and order
are canonical in `docs/tasks.md`.

| Phase | Outcome | Tasks | Gate |
|---|---|---|---|
| 0. Operating foundation | A fresh session can recover state and execute a numbered task safely. | T001 | Workflow documents are coherent and committed. |
| 1. Product definition | Current evidence validates the problem and gap; measurable MVP requirements are approved. | T002-T003 | Phase audit and user approval. |
| 2. Experience and technical design | Core UX, prototype, estimation model, and architecture are testable before broad implementation. | T004-T005 | Phase audit and user approval. |
| 3. Local-first tracking | The complete offline mobile tracking loop works and is tested. | T006 | Phase audit and user approval. |
| 4. Reminders and monetization | Notifications and purchase entitlements behave safely across mobile targets. | T007 | Phase audit and user approval. |
| 5. Web acquisition | Responsive landing page and free calculators are usable and tested. | T008 | Phase audit and user approval. |
| 6. Release readiness | Representative platforms, accessibility, privacy, stores, and release builds are verified. | T009-T010 | Release audit and explicit launch approval. |

## Current Position

Phase 1 execution was authorized by the user on 2026-06-21. T002 validated a
narrow problem and competitor gap with explicit evidence limits. T003 converted
that direction into a measurable MVP contract and passed its documentation
audit. The user approved Phase 2 and assigned T004 on 2026-06-21. Its core UX
and interactive prototype are complete. The user explicitly waived unavailable
representative testing and accepted the recorded validation risk. T005 defined
the tested deterministic model and implementation-ready architecture. The Phase
2 audit verdict is `APPROVE WITH FOLLOW-UPS`. The user approved Phase 3 and
assigned T006 on 2026-06-21. T006 delivered the local-first tracking loop and
passed automated quality gates. Android owner review completed with recorded
follow-ups; iOS device testing was explicitly waived because of an Expo app
version mismatch. The Phase 3 audit verdict is `APPROVE WITH FOLLOW-UPS`. The
user approved Phase 4 and assigned T007 on 2026-06-22. T007 implementation and
host-executable verification are complete, but representative store-sandbox
verification is blocked. On 2026-06-25, the user postponed Apple testing for
cost reasons and approved resuming T007 after seven days with Google
Play/Android-only verification. iOS verification remains a deferred release
risk before any iOS store-readiness claim.
