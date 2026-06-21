# Starter Clock Product Requirements Document

**Status:** Measurable MVP approved; Phase 2 design complete

**Last updated:** 2026-06-21

## Product Promise

**Know when your starter will peak.**

Starter Clock lets a home baker record a feeding quickly, understand an
estimated peak window, and receive a useful reminder without learning a
complicated baking system.

## Evidence-Based Product Decision

T002 found directional support for a timing and cognitive-load problem among
newer and regular home bakers. The defensible opening is the combination of a
fast persistent feed log, transparent peak interval, observed-peak capture,
starter-specific learning, and a reminder derived from that interval. It did
not validate scientific prediction accuracy, professional bakery needs, or a
price point. Evidence, sources, confidence, and limitations are canonical in
`docs/research/market-research.md`.

Starter Clock will therefore optimize the feed-to-peak planning loop instead
of competing on recipe breadth, AI advice, or social features. The requirements
and exclusions that enforce this decision are canonical in
`docs/requirements.md`.

## Users and Jobs

### Primary users

- A newer home baker who wants confidence about what happens after feeding.
- A regular home baker coordinating starter readiness with a baking schedule.

A detail-oriented home baker who values history is a secondary user. Bakery
teams and commercial production are not MVP users.

### Jobs to be done

- After I feed my starter, help me understand roughly when it should peak so I
  can decide when to use it.
- When life interrupts, remind me near the useful moment without making me
  manage another timer.
- When the starter behaves differently, let me record what happened so future
  expectations can become more relevant.
- When I review or correct a feeding, keep calculations, timing, and reminders
  coherent.

## Product Goals and Measures

| ID | Goal | Release measure | Evidence collection |
|---|---|---|---|
| GOAL-001 | Make feeding capture genuinely fast. | Post-build validation target: at least 4 of 5 representative users save a standard feeding in ≤15 seconds after one practice attempt. | Deferred representative test; T004 owner walkthrough found the flow clear but did not measure speed; NFR-001 |
| GOAL-002 | Make the estimate understandable without false precision. | Post-build validation target: at least 4 of 5 first-time users identify the interval and its approximate nature within 10 seconds. | Deferred representative test; T004 owner walkthrough found the interval and uncertainty clear; NFR-002 |
| GOAL-003 | Make the core loop dependable without connectivity. | All specified offline persistence, restart, edit/delete, and recovery tests pass on representative iOS and Android targets. | T006 verification; FR-010, NFR-006 |
| GOAL-004 | Make reminders helpful but safely optional. | Permission-denied, scheduling-failure, edit, delete, and reschedule scenarios all pass without blocking tracking or showing false success. | T007 integration tests; FR-006, NFR-011 |
| GOAL-005 | Preserve user agency and privacy. | Export and complete deletion pass on both mobile platforms; no user-entered data is transmitted in MVP. | T009 privacy/data-control audit; FR-013, NFR-007 |

GOAL-003 through GOAL-005 are release-readiness thresholds. The user explicitly
waived representative evidence for GOAL-001 and GOAL-002 because participants
are unavailable; those measures remain non-blocking validation targets and are
not reported as passed. Retention, conversion, willingness to pay, and
prediction error need later instrumentation or research and are not fabricated
as MVP success claims.

## MVP Stories and Traceability

| Story ID | User story and acceptance outcome | Requirement trace |
|---|---|---|
| US-001 | As a home baker, I can create and manage a named starter so records belong to the right culture. Accepted when lifecycle, validation, and deletion behavior pass. | FR-001, FR-011, NFR-006 |
| US-002 | As a baker who just fed, I can enter amounts, flour, temperature, and time quickly so the app can calculate from what happened. Accepted when valid entries save within the speed target and invalid entries preserve input with clear corrections. | FR-002, FR-014, NFR-001 |
| US-003 | As a baker, I can see ratio and hydration before saving so I understand the feeding. Accepted when shared-formula calculation and boundary tests pass on mobile and web. | FR-003, FR-012, NFR-009 |
| US-004 | As a planning baker, I can see an explainable peak interval and current timing state so I know roughly when to use the starter. Accepted when complete- and missing-input cases, comprehension testing, restart, time-zone, and DST cases pass. | FR-004, FR-005, NFR-002, NFR-009 |
| US-005 | As a busy baker, I get an optional reminder from the interval without managing a separate timer. Accepted when default-on automatic scheduling, opt-out, remembered preference, denial, failure, edit, delete, change, and reschedule scenarios pass. | FR-006, FR-014, NFR-011 |
| US-006 | As an iterative baker, I can review, correct, and delete feedings and record the observed peak so my history reflects reality. Accepted when derived values and reminder state remain coherent after every mutation. | FR-007, FR-008, NFR-006 |
| US-007 | As a visual baker, I can optionally keep one progress photo with a feeding without photo access blocking the core log. | FR-009, NFR-007, NFR-011 |
| US-008 | As an offline baker, I can complete the tracking loop and recover it after restart without an account. Accepted when offline and interrupted-write suites pass without silent loss. | FR-010, NFR-006, NFR-011 |
| US-009 | As a customer, I can understand the free boundary, unlock or restore Pro, and retain my data if entitlement changes. Accepted when one-starter, 30-feeding, restore, refund/loss, and re-entitlement tests pass. | FR-011 |
| US-010 | As a web visitor, I can calculate feeding ratio and hydration for free on phone or desktop without creating an account. | FR-012, NFR-003, NFR-010 |
| US-011 | As a user, I can export or permanently delete all my data regardless of payment status. | FR-013, NFR-007 |
| US-012 | As a web visitor, I can understand what Starter Clock offers and reach either free calculator without mistaking the site for a synchronized dashboard. | FR-015, NFR-003, NFR-010 |

Every MVP story traces to at least one stable requirement. Detailed field,
failure, performance, accessibility, privacy, platform, and entitlement
criteria live only in `docs/requirements.md`.

Cross-cutting requirements trace as follows so none sits outside a verifiable
user outcome:

| Requirement | Story coverage |
|---|---|
| NFR-003 Accessibility | US-001–US-012 critical paths |
| NFR-004 Performance | US-001–US-009 mobile critical paths |
| NFR-005 Automated quality | US-001–US-012 according to each story's domain behavior |
| NFR-006 Storage integrity | US-001, US-006, US-008, US-009, US-011 |
| NFR-007 Privacy | US-007, US-008, US-011 |
| NFR-008 Boundary security | US-001–US-012 at every external or persisted input |
| NFR-009 Date and calculation consistency | US-002–US-006, US-010 |
| NFR-010 Responsive appearance | US-001–US-012 on their target platforms |
| NFR-011 Graceful degradation | US-002, US-005, US-007–US-009 |

## Commercial Boundary

Free includes one active starter, calculators, local reminders, and browsing
the 30 most recent feedings. A lifetime Pro entitlement unlocks multiple active
starters and complete retained history. Export and deletion are never paid
features. The history limit and USD 9.99 versus USD 19.99 lifetime price anchors
are hypotheses to test against the T004 prototype; neither a price nor a
subscription is approved for release.

## Open Decisions and Learning Plan

- T004 established the core flow through automated checks and an owner
  walkthrough. Its five-person speed and comprehension study was explicitly
  waived as unavailable, leaving a recorded validation risk rather than a pass.
- T005 defined the deterministic model, accuracy-claim gate, missing-input
  widening, and five-observation stability threshold for personalization. The
  coefficients remain an unvalidated product heuristic as recorded in
  `architecture.md`.
- T007 validates native notification and purchase edge cases before those
  behaviors are considered release-ready.
- Post-prototype pricing research must test willingness to pay; competitor
  anchors alone cannot select a price.

Interaction design and technical architecture are now fixed by T004 and T005.
Store setup remains later work and cannot silently change this contract.
