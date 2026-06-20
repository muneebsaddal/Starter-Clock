# Starter Clock Requirements

**Status:** Seeded; pending validation and Task T003
**Last updated:** 2026-06-21

This document is the canonical owner of product requirements and constraints.
The entries below are directives from the approved project charter, not
evidence that the underlying customer or pricing assumptions are validated.

## Product Constraints

| ID | Requirement | Source | Status |
|---|---|---|---|
| CON-001 | Use one Expo and React Native TypeScript codebase for iOS, Android, and responsive web unless a native capability requires otherwise. | Project charter | Required |
| CON-002 | Provide the complete tracking experience on iOS and Android; limit MVP web scope to a landing page and free feeding and hydration calculators. | Project charter | Required |
| CON-003 | Keep core tracking functional offline and avoid complex cloud accounts and synchronization in the MVP. | Project charter | Required |
| CON-004 | Use deterministic, testable peak-window calculations before considering machine learning. | Project charter | Required |
| CON-005 | Present peak timing as an estimate, avoid food-safety claims, and explain influential inputs. | Project charter | Required |
| CON-006 | Do not begin broad app implementation until validation, measurable requirements, and the core UX flow are complete and approved. | Project charter | Required |

## Candidate MVP Capabilities

These capabilities are the chartered starting scope. T002 validates the
problem and gap; T003 converts the approved scope into measurable functional
and non-functional requirements with stable `FR-###` and `NFR-###` IDs.

- Create and name a starter.
- Log flour, water, retained starter, flour type, and temperature for a feeding.
- Calculate feeding ratio and hydration.
- Estimate and explain a peak window and show elapsed/time-to-peak information.
- Schedule a local reminder.
- View and edit feeding history and optionally attach a progress photo.
- Support one free starter; test a lifetime Pro purchase for multiple starters
  and complete history.
- Support export and deletion before public release.

## Explicit MVP Exclusions

AI coaching, a social feed, marketplace, inventory, grocery lists, bakery
management, sensor integrations, complex synchronization, and a large recipe
library remain excluded unless current evidence justifies a separately approved
scope change.

## Open Requirements Work

T003 must define measurable acceptance thresholds, missing-input behavior,
history limits, entitlement semantics, accessibility criteria, performance and
reliability targets, privacy requirements, and platform-specific constraints.
