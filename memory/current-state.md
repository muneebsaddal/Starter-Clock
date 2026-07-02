# Starter Clock Current State

**Last updated:** 2026-07-03  
**Canonical handoff:** `../HANDOFF.md`  
**Canonical task ledger:** `../docs/tasks.md`

## State

Starter Clock is in Phase 4. `T007` is `BLOCKED`.

The implementation for notifications and purchase handling is complete, and
host-executable verification passed. The remaining blocker is representative
Android store-sandbox/mobile notification verification.

The user postponed paid Apple Developer/App Store Connect work for cost reasons
and approved resuming T007 with Google Play/Android-only store-sandbox
verification. iOS notification and purchase evidence remains a deferred release
risk before any iOS store-readiness claim.

## Next Action

Resume T007 only. Do not begin T008 unless the user explicitly assigns it after
T007 is resolved or explicitly overrides the handoff.

Required Android verification path:

- Configure `starter_clock_pro_lifetime` in Google Play.
- Add license testers.
- Publish a signed Android build to an internal test track.
- Verify notification permission grant, denial, Settings recovery, schedule,
  edit, reschedule, delete, restart/resume, time-zone reconciliation, purchase
  success, pending/deferred, cancellation, failure, offline cached Pro, restore,
  and refund/revocation.
- Record evidence in the T007 plan, rerun checks, inspect the diff, audit Phase
  4, and preserve the approved iOS waiver.
