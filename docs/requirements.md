# Starter Clock Requirements

**Status:** MVP contract approved; T004 complete with approved validation waiver

**Last updated:** 2026-06-21

This document is the canonical owner of product requirements and constraints.
`Must` requirements are release-blocking; `Should` requirements may be deferred
only through an explicit scope decision. Sources identify charter authority or
the evidence synthesis in `docs/research/market-research.md`.

## Product Constraints

| ID | Requirement | Source | Status |
|---|---|---|---|
| CON-001 | Use one Expo and React Native TypeScript codebase for iOS, Android, and responsive web unless a platform capability requires native code. | Project charter | Required |
| CON-002 | Provide complete tracking on iOS and Android; limit MVP web scope to a landing page and free feeding and hydration calculators. | Project charter | Required |
| CON-003 | Keep core tracking functional offline; do not require an account or cloud synchronization. | Project charter; T002 offline/no-account comparison | Required |
| CON-004 | Use deterministic, independently testable peak-window calculations before considering machine learning. | Project charter | Required |
| CON-005 | Present peak timing as an estimate, disclose influential inputs and uncertainty, and make no food-safety or health claims. | Project charter; T002 calculator comparison | Required |
| CON-006 | Do not begin broad implementation until measurable requirements and the core UX flow are complete and approved. | Project charter | Required |

## Functional Requirements

| ID | Priority | Requirement and objective acceptance criterion | Source |
|---|---|---|---|
| FR-001 | Must | On iOS and Android, a user can create, name, rename, archive, and permanently delete a starter. Names contain 1–40 visible characters after trimming; duplicate names are allowed. Deletion requires confirmation and removes associated feedings and local photos. | Chartered MVP |
| FR-002 | Must | A feeding records starter, flour, and water amounts plus feeding time, and accepts optional flour type and temperature. Amounts accept grams to 0.1 g, temperature accepts Celsius or Fahrenheit, and the app stores normalized values. Only positive amounts and a valid time may be saved. The primary happy path contains no optional-field gate and supports the under-15-second target in NFR-001. | Charter; T002 fast-log evidence |
| FR-003 | Must | For every valid feeding, calculate and display the starter:flour:water feeding ratio and hydration percentage using documented formulas. Results update before save, round only for display, and remain reproducible from stored inputs. | Charter; T002 calculator evidence |
| FR-004 | Must | After a feeding, produce an estimated peak interval with an earliest and latest time. The result identifies which available inputs influenced it, labels the result as an estimate, and widens or lowers confidence when optional flour type or temperature is missing; it never invents a measured value. Exact formulas and accuracy thresholds belong to T005. | Charter; T002 narrow-gap inference |
| FR-005 | Must | The mobile dashboard shows the current starter, time since its latest feeding, the estimated peak interval, and one plain-language state: before window, in window, or past window. The state recomputes from absolute timestamps after restart, time-zone change, and daylight-saving transition. | Product promise; T002 planning evidence |
| FR-006 | Must | Feeding entry offers a remembered **Remind me near peak** preference, enabled by default. Saving automatically schedules one local reminder at the estimated interval start when enabled; the user can opt out before save and change or cancel it afterward. On first use, save completes before a contextual notification-permission request. Editing or deleting the feeding reschedules or cancels its reminder. Permission denial, unavailable services, or scheduling failure leaves tracking usable and exposes a recoverable status; no success state is shown unless scheduling succeeds. | Charter; T002 reminder/reliability evidence; approved T004 owner review |
| FR-007 | Must | A user can view feeding history newest-first, open an entry, edit all recorded fields, and delete it with confirmation. Editing recalculates derived values and the peak interval. Free users can browse the 30 most recent feedings for their starter; Pro users can browse complete retained history. | Charter; T002 editing evidence; product decision |
| FR-008 | Must | A user can record, edit, or remove an observed peak time for a feeding and see estimated versus observed timing. Once the model has enough valid observations, it may personalize later windows for that starter; until T005 defines and verifies that threshold, baseline estimates remain the fallback and the UI must not claim learning. | Charter peak-safety rule; T002 narrow-gap inference |
| FR-009 | Must | A user can attach, replace, view, or remove one progress photo per feeding. Photos remain device-local, are excluded from calculations, and removal of a feeding or starter removes its associated photo. Denied photo access does not block saving the feeding. | Chartered MVP; T002 history evidence |
| FR-010 | Must | Create, read, update, and delete operations for starters, feedings, observations, and reminder intent work with no network connection and persist across a normal app restart. Interrupted writes preserve the last valid committed record and surface recoverable failure. | Charter; T002 reliability evidence |
| FR-011 | Must | Free permits exactly one active starter, all calculators and reminders, and access to its 30 most recent feedings. A verified lifetime Pro entitlement permits multiple active starters and complete retained history. Purchase restore is available. Loss or refund of entitlement never deletes records: creation beyond the free limit is blocked and only the newest 30 feedings of one user-selected starter are browsable until entitlement returns. | Charter monetization assumption; T002 pricing evidence; product decision |
| FR-012 | Must | Responsive web provides account-free feeding-ratio and hydration calculators with the same formulas, validation, rounding rules, and units as mobile. It does not expose tracking, history, notifications, purchases, or a synchronized dashboard in MVP. | CON-002; T002 web comparison |
| FR-013 | Must | Before public release, a user can export all locally held structured starter and feeding data in a documented, portable format and can delete all app data through an explicit confirmation flow. Export and deletion are available regardless of entitlement; deletion includes locally managed photos and reminder intent. | Project charter privacy requirement |
| FR-014 | Must | Empty, invalid, unavailable, offline, permission-denied, and storage-failure states explain what happened in plain language and provide the next valid action. User input remains intact after a recoverable validation, permission, notification, or storage error. | Charter design standards; T002 reliability evidence |
| FR-015 | Must | Responsive web provides a public, account-free landing page that states the product promise, distinguishes mobile tracking from web calculators, and links directly to both calculators. Its claims do not imply proven prediction accuracy or mobile features on web. | CON-002; product promise |

## Non-Functional Requirements

| ID | Priority | Requirement and objective acceptance criterion | Source |
|---|---|---|---|
| NFR-001 | Should | When representative participant access becomes feasible, target at least 4 of 5 users saving a standard feeding in 15 seconds or less after one practice attempt, without facilitator help. The user explicitly waived this evidence for T004 on 2026-06-21; the owner walkthrough found the flow clear but did not measure speed. | Project charter; approved validation waiver |
| NFR-002 | Should | When representative participant access becomes feasible, target at least 4 of 5 first-time users stating the peak interval and that it is approximate within 10 seconds, without external instruction. The user explicitly waived this evidence for T004 on 2026-06-21; the owner walkthrough found the interval and uncertainty clear. | Product promise; T002 uncertainty implication; approved validation waiver |
| NFR-003 | Must | Core screens meet WCAG 2.2 AA contrast and text-resize/reflow expectations; every interactive control has an accessible name, role, state, and logical focus order. Targets meet platform minimums of 44×44 pt on iOS and web and 48×48 dp on Android. Critical flows pass screen-reader checks on iOS and Android and keyboard checks on web. | Charter accessibility standard |
| NFR-004 | Must | On the representative release device matrix, a warm app launch makes local dashboard content interactive within 2 seconds, a cold launch within 3 seconds, and a save or history update visibly completes within 1 second at p95 for 1,000 feedings, excluding OS notification prompts. | Charter performance and reliability standards |
| NFR-005 | Must | Automated tests cover ratio, hydration, peak-window, time-zone/DST, edit/delete, entitlement, and persistence behavior. Required unit suites pass with at least 80% statement and branch coverage for domain and data modules; every meaningful defect adds a regression test. | Charter testing standard |
| NFR-006 | Must | Stored records use a versioned schema and atomic migrations. Tested restart, interrupted-write, and migration scenarios produce no silent data loss; failures retain the last valid data and expose recovery guidance. | Charter structured-storage standard |
| NFR-007 | Must | Starter data, feeding data, observed peaks, and photos stay on-device in MVP and are not transmitted to product-controlled services. Collect no account identifier, advertising identifier, analytics event, or crash attachment containing user-entered data without a later approved privacy change and disclosure. | CON-003; charter privacy standard |
| NFR-008 | Must | Validate all persisted, imported, purchase, notification, route, and calculator inputs at their system boundary. No secret is committed to client code or source control, and dependency/security review has no unresolved high- or critical-severity finding at release. | Charter engineering and security standards |
| NFR-009 | Must | All stored instants use an unambiguous absolute timestamp while displayed dates follow the device locale and current time zone. Ratio, hydration, and elapsed-time behavior is deterministic across iOS, Android, and web; DST and time-zone changes do not alter the recorded instant. | Charter cross-platform/date testing standard |
| NFR-010 | Must | Light and dark appearances preserve meaning, AA contrast, and legibility. The critical mobile flow is verified at 320 logical pixels wide and current representative iOS/Android sizes; web calculators work without horizontal scrolling from 320 px through desktop widths. | Charter design and platform standards |
| NFR-011 | Must | The app remains usable for tracking when notifications, photos, purchases, or network access are unavailable. Optional-capability failures do not crash, corrupt records, or prevent a valid feeding from being saved. | Charter graceful-failure standard |

## Release Boundary and Assumptions

- `Must` requirements define the MVP release contract. Any deferral requires an
  explicit approved scope change.
- NFR-001 and NFR-002 remain useful validation targets but are not T004 or MVP
  release gates after the user's explicit participant-testing waiver. This is
  accepted uncertainty, not evidence that the original thresholds passed.
- USD 9.99 and USD 19.99 lifetime prices are experiment candidates. No release
  price is approved, and subscriptions remain out of scope.
- The 30-feeding free history boundary is a product hypothesis to test for
  comprehension and perceived fairness in T004; changing it requires approval.
- Peak accuracy and the minimum observations needed for personalization remain
  open until T005. FR-004 and FR-008 deliberately specify behavior, not an
  unsupported scientific accuracy claim.
- Representative test devices and exact export format will be fixed in later
  technical and release plans without changing the product boundary.

## Explicit MVP Exclusions

AI coaching, recipes or a marketplace, social features, inventory, grocery
lists, bakery management, sensors, cloud accounts or synchronization, a full
web dashboard, and a large recipe library are excluded. Adding one requires a
separately approved scope change.
