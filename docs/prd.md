# Starter Clock Product Requirements Document

**Status:** Problem and gap validated by T002; pending measurable definition in T003
**Last updated:** 2026-06-21

## Product Promise

**Know when your starter will peak.**

Starter Clock should let a baker record a feeding in seconds, understand an
estimated peak window, and receive a useful reminder without learning a
complicated baking system.

## Problem Hypothesis

Home sourdough bakers may struggle to translate feeding conditions into a
useful expectation of when a starter will be ready. Existing timers,
calculators, and tracking apps may not combine fast logging, transparent peak
windows, personal observations, and calm reminders well enough.

T002 supports the timing, reminder, calculation, and cognitive-load problem
from a directional sample of public reviews. It found a narrower opportunity
around the combination of fast persistent logging, an explainable peak window,
observed-peak capture, starter-specific learning, and a derived reminder. Close
substitutes already cover most generic tracking features, and free web tools
already estimate peak/readiness. The sourced assessment and its limits are
canonical in `docs/research/market-research.md`.

## Candidate Users and Jobs

- A newer baker who wants a simple answer after feeding a starter.
- A regular home baker coordinating a starter peak with a baking schedule.
- A detail-oriented baker who wants history without maintaining a spreadsheet.

Primary job: after feeding, help me understand roughly when my starter will
peak so I can plan when to use it.

T002's review evidence supports beginners who value guidance and confidence and
regular home bakers who value planning, calculators, history, and iteration.
It does not justify professional bakery scope.

## Success Measures to Define

T003 must convert these directions into measurable targets:

- Feeding entry can be completed in under 15 seconds.
- The peak window is immediately understandable and transparently approximate.
- Core records and history survive offline use and app restarts.
- Local reminders are useful and permission denial does not break tracking.
- A new user understands the product without external instruction.

## Scope

The candidate MVP scope and exclusions are canonical in
`docs/requirements.md`. Monetization remains a hypothesis: T002 found current
one-time anchors at USD 9.99 and USD 19.99 but no evidence of price elasticity.
Test both against a demonstrable core experience rather than locking a release
price now.

## Stories and Acceptance Criteria

Stable user-story IDs and release acceptance criteria will be added by T003,
using T002's evidence to resolve and measure the candidate MVP boundary.
