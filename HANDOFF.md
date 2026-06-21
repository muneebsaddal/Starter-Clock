# Starter Clock Handoff

**Updated:** 2026-06-21

## Current State

Phase 1 is complete with verdict `APPROVE`. The user approved Phase 2 and
explicitly assigned T004 on 2026-06-21. T004's information architecture,
interaction/state contract, responsive accessible prototype, and moderated
test protocol are implemented. T004 is `BLOCKED`, not done, because its two
human usability thresholds have not yet been tested. T005 remains `PLANNED`.

## Decisions and Constraints

- Mobile uses two persistent destinations: Today and History. Starter
  management and Settings remain secondary surfaces.
- Today leads with a plain-language estimated interval and before/in/past state.
  Factors and uncertainty are progressively disclosed.
- Feeding entry keeps time plus starter/flour/water in the primary path; flour,
  temperature, photo, and notes are optional.
- Missing optional inputs widen and explain the interval. T005 still owns the
  formula, confidence behavior, accuracy evidence, and learning threshold.
- Reminder/photo/network/Pro failure never blocks core tracking. Recoverable
  errors preserve input and state a next action.
- Free remains one active starter and 30 browsable feedings. Export and complete
  deletion remain free. No scope, price, or platform boundary changed.
- Prototype code under `docs/prototypes/t004/` is disposable design evidence,
  not production architecture.

## Verification Evidence

- Prototype JavaScript syntax, local asset references, and diff whitespace pass.
- Playwright covered save, validation preservation, uncertainty disclosure,
  all scenario states, history/edit, keyboard dismissal, and modal focus wrap.
- No horizontal overflow at 320×640, 390×844, or 1280×800 review viewports.
- Tested light/dark text pairs meet WCAG AA; detailed ratios are in the T004
  completion record.
- Human feeding-time and peak-comprehension results are intentionally absent.

## Blocker

NFR-001 and NFR-002 require five representative bakers in moderated prototype
sessions, with at least 4/5 logging within 15 seconds and at least 4/5 stating
the interval and its approximate nature within 10 seconds. Automation cannot
satisfy this evidence requirement.

## Next Action

Run the five sessions in `docs/prototypes/t004/usability-test.md`, record
anonymized results, revise and retest any failed criteria, then resume T004 to
mark it `DONE`. Do not start T005 while T004 is blocked.
