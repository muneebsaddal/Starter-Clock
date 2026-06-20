# T002 — Validate Problem and Competitor Gap

## Objective and Outcome

Produce current, sourced evidence for or against the feed-to-peak problem,
competitor gap, candidate users, positioning, and monetization hypothesis.

## Dependencies and Context

- Dependencies: explicit user approval of Phase 1
- Read: `docs/prd.md`, `docs/requirements.md`, `docs/research/market-research.md`

## Scope

- In: current iOS, Android, and web competitors; official pricing/features;
  public customer-review themes; evidence synthesis and MVP implications.
- Out: final requirements, UX design, architecture, and app implementation.

## Acceptance Criteria

- Findings use current sources with links and access dates.
- Facts, vendor claims, customer opinions, and inferences are separated.
- Material competitors and recurring pain points are compared consistently.
- Evidence explicitly supports, changes, or rejects each core hypothesis.
- Recommended MVP boundary and pricing experiments are decision-ready.

## Expected Files

`docs/research/market-research.md`, `docs/prd.md`, `docs/requirements.md`,
`docs/roadmap.md`, `docs/tasks.md`, this plan, and `HANDOFF.md`.

## Steps

1. Define research questions and comparison criteria.
2. Gather current primary sources and attributable customer evidence.
3. Synthesize patterns, gaps, contradictions, and confidence.
4. Update product hypotheses and recommend the validated boundary.
5. Verify citations and conduct the Phase 1 product-evidence review.

## Verification

- Open every cited link and check it supports the adjacent claim.
- Check source dates, evidence labels, comparison coverage, and unresolved gaps.
- Inspect the documentation diff for unsupported claims and duplicated truth.

## Risks and Rollback

Store reviews can be biased and competitor details can change. Record dates,
sample limits, and confidence; revert only unsupported documentation claims.

## Completion Record

- Outcome: `BLOCKED`
- Summary: collected and synthesized current Apple metadata and Google Play
  discovery evidence; narrowed the plausible product wedge and kept scope and
  pricing explicitly provisional.
- Actual files changed: `docs/research/market-research.md`, `docs/prd.md`,
  `docs/requirements.md`, `docs/roadmap.md`, `docs/tasks.md`, this plan, and
  `HANDOFF.md`.
- Verification: official Apple listing links and adjacent claims checked from
  the public Search/Lookup API; Google Play presence checked from its US search
  surface; evidence labels and unsupported-claim boundaries reviewed. Final
  citation and acceptance review cannot pass while required evidence is absent.
- Remaining risks or blocker: the environment's external-research usage limit
  stopped collection of written customer reviews and full Android/web details.
  Restore research access, gather the evidence enumerated in the research
  document, revise confidence, and rerun the T002 product-evidence review.
