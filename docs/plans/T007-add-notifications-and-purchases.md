# T007 — Add Notifications and Purchase Handling

## Objective and Outcome

Add reliable local peak reminders and a recoverable lifetime-Pro entitlement
without weakening the free core tracking experience.

## Dependencies and Context

- Dependencies: T006 and explicit user approval of Phase 4
- Read: `docs/requirements.md`, `docs/ux-flow.md`, `docs/architecture.md`

## Scope

- In: permission flows, schedule/reschedule/cancel behavior, denial recovery,
  purchase/restore/entitlement states, free limits, tests, and disclosures.
- Out: subscriptions, cloud sync, unrelated paywalls, and store submission.

## Acceptance Criteria

- Reminder scheduling follows edited feedings and handles denial/time changes.
- Purchase, pending, failure, cancellation, restore, and offline entitlement
  states meet requirements on both mobile platforms.
- Free users retain the chartered experience; Pro gates only approved benefits.
- Current official platform/store requirements are cited and satisfied.

## Expected Files

Notification and entitlement modules/UI/tests plus affected canonical documents,
ledger, this plan, and handoff.

## Steps

1. Verify current notification and purchase platform requirements.
2. Implement scheduling behind a testable boundary.
3. Implement entitlement and restore handling behind a testable boundary.
4. Integrate approved UX states and privacy disclosures.
5. Test failure/recovery paths and audit Phase 4.

## Verification

- Run notification/rescheduling and entitlement unit/integration tests.
- Exercise representative permission and purchase states on iOS/Android.
- Run typecheck, lint, build, security audit, and inspect the diff.

## Risks and Rollback

Store sandboxes differ from production and time changes are subtle. Record
sandbox evidence, keep adapters isolated, and disable optional integrations
without compromising local tracking if rollback is needed.

## Completion Record

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T006 and Phase 4 approval are required.
