# T009 — Verify Platforms, Accessibility, Privacy, and Data Controls

## Objective and Outcome

Independently verify the release candidate across representative platforms and
close functional, accessibility, privacy, security, and data-control gaps.

## Dependencies and Context

- Dependencies: T007, T008, and explicit user approval of Phase 6
- Read: all canonical product, UX, architecture, research, and roadmap documents

## Scope

- In: traceability audit, regression/E2E/device matrix, accessibility, offline
  recovery, purchases, notifications, export/deletion, privacy, security, fixes.
- Out: new product features and unapproved scope expansion.

## Acceptance Criteria

- Every release criterion has direct passing evidence or a recorded blocker.
- Critical flows pass on representative iOS, Android, and web targets.
- Accessibility, time-zone/DST, offline recovery, permissions, purchases,
  export, deletion, and privacy checks pass.
- Meaningful bugs receive regression tests; unresolved release risks are explicit.

## Expected Files

Tests/fixes and a release-readiness record under `docs/` if needed, plus affected
canonical documents, ledger, this plan, and handoff.

## Steps

1. Build the requirement-to-test evidence matrix.
2. Run automated quality, security, accessibility, and build gates.
3. Execute the representative device/browser matrix.
4. Fix in-scope defects and add regression coverage.
5. Audit evidence and issue the required verdict.

## Verification

- Run the complete approved test, coverage, lint, typecheck, build, audit, E2E,
  accessibility, and device matrix.
- Review the final diff and release-risk register independently.

## Risks and Rollback

Platform-only failures may be hard to reproduce. Preserve diagnostics and exact
environments; isolate fixes and block release rather than waiving critical gaps.

## Completion Record

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T007, T008, and Phase 6 approval are required.
