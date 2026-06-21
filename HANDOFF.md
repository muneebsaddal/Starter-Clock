# Starter Clock Handoff

**Updated:** 2026-06-21

## Current State

Phase 1 is complete with verdict `APPROVE`. Phase 2 is approved. T004 is `DONE`:
its information architecture, interaction/state contract, responsive accessible
prototype, and test protocol are complete. The user waived unavailable
five-person usability testing and accepted the recorded uncertainty. T005 is
`PLANNED`, eligible by dependency, and not yet explicitly assigned.

## Decisions and Constraints

- Mobile uses two persistent destinations: Today and History. Starter
  management and Settings remain secondary surfaces.
- Today leads with a plain-language estimated interval and before/in/past state.
  Factors and uncertainty are progressively disclosed.
- Feeding entry keeps time plus starter/flour/water in the primary path; flour,
  temperature, photo, and notes are optional.
- **Remind me near peak** is a remembered feeding-entry preference enabled by
  default. Save automatically schedules for the interval start when enabled;
  users may opt out, change, or cancel. Permission/scheduling failure occurs
  after safe feeding capture and never blocks tracking.
- Missing optional inputs widen and explain the interval. T005 still owns the
  formula, confidence behavior, accuracy evidence, and learning threshold.
- Free remains one active starter and 30 browsable feedings. Export and complete
  deletion remain free. No price or platform boundary changed.
- Prototype code under `docs/prototypes/t004/` is disposable design evidence,
  not production architecture.

## Verification Evidence

- Previous T004 checks covered JavaScript syntax, local assets, interactions,
  validation preservation, uncertainty, scenario states, history/edit,
  keyboard dismissal, modal focus, responsive overflow, and contrast.
- The reminder revision has default-on, opt-out, automatic-save scheduling,
  denied-permission recovery, change, and cancel paths. Final verification is
  recorded in the T004 plan and commit.
- Owner walkthrough found the flow and estimated-window communication clear.
  No feeding time was measured.

## Accepted Risk

The original NFR-001/NFR-002 study required five representative bakers. The
user stated recruitment is not possible and explicitly waived the study on
2026-06-21. These thresholds are not reported as passed. They remain
non-blocking validation targets if participant access later becomes feasible.

## Next Action

Wait for the user's explicit assignment of T005. Do not begin it automatically.
