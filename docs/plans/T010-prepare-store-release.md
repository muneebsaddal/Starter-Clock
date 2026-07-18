# T010 — Prepare Store Assets and Release Builds

## Objective and Outcome

Prepare truthful store listings, privacy disclosures, signed release builds,
and a final launch package ready for explicit user approval.

## Dependencies and Context

- Dependencies: T009 and T012
- Read: all canonical documents, T009 release-readiness evidence, and T012
  groundwork/completion evidence

## Scope

- In: final current-policy reconciliation; review/finalization of T012 listing,
  asset, privacy, support, Data Safety, and versioning groundwork; purchase
  metadata/pricing after explicit approval; signed builds; release checklist.
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

1. Reverify current Apple, Google, and applicable web policy requirements.
2. Review and finalize T012 listing copy, screenshots, disclosures, assets, and
   support material against passing T009 evidence.
3. Finalize approved versioning/pricing and configure signing without
   committing secrets.
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
- Remaining risks or blocker: T009 and T012 must be complete.
