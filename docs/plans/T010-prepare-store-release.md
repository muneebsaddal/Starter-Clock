# T010 — Prepare Store Assets and Release Builds

## Objective and Outcome

Prepare truthful store listings, privacy disclosures, signed release builds,
and a final launch package ready for explicit user approval.

## Dependencies and Context

- Dependencies: T009
- Read: all canonical documents and the T009 release-readiness evidence

## Scope

- In: current store-policy verification, listing copy/assets, privacy/data
  disclosures, purchase metadata, versioning, signed builds, release checklist.
- Out: submission or launch without explicit user authorization; new features.

## Acceptance Criteria

- Listings and screenshots accurately represent the verified product.
- Privacy, permissions, data safety, export/deletion, and purchase disclosures
  match actual behavior and current official requirements.
- Reproducible release builds pass final smoke tests on target platforms.
- Known risks, rollback, support, and version information are documented.
- Final audit returns `APPROVE` before launch approval is requested.

## Expected Files

Store/release assets and configuration plus affected canonical documents,
ledger, this plan, and handoff.

## Steps

1. Verify current Apple, Google, and applicable web policy requirements.
2. Produce listing copy, screenshots, disclosures, and support material.
3. Configure versioning/signing without committing secrets.
4. Build and smoke-test release artifacts.
5. Conduct the release audit and request explicit launch authorization.

## Verification

- Run production builds and smoke tests; validate store asset dimensions and
  metadata; reconcile disclosures with actual data flow.
- Inspect Git diff, secret scan, release checklist, and audit evidence.

## Risks and Rollback

Policies can change and signing material is sensitive. Use official current
sources and external secret storage; do not submit if disclosures or builds drift.

## Completion Record

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: T009 must be complete.
