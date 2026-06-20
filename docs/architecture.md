# Starter Clock Architecture

**Status:** Constraints only; technical design deferred to T005
**Last updated:** 2026-06-21

This document is the canonical owner of technical decisions and boundaries.
No app architecture has been selected beyond the chartered constraints below.

## Approved Boundaries

- One Expo and React Native application written in strictly checked TypeScript.
- iOS and Android receive full tracking; responsive web serves the landing page
  and calculators for the first release.
- Core tracking is local-first and works offline.
- Domain calculations remain independent from React UI and storage.
- Storage uses structured APIs with validation at system boundaries.
- Peak estimates are deterministic and testable before any machine-learning
  approach is considered.
- Secrets are supplied through environment configuration and never committed.

## Decisions Deferred to T005

T005 must define and record stable architecture decision IDs for:

- Project structure and package choices
- Domain entities and data schema
- Local storage and migration strategy
- Peak-window model inputs, fallback behavior, and personalization boundary
- Notification scheduling and rescheduling
- Photo storage and privacy
- Purchase entitlement handling
- Export and deletion
- Platform adaptation, testing boundaries, and observability

Dependencies must remain limited and justified against the requirements and UX
flow. Current Expo, notification, purchase, and store constraints require
primary-source verification when T005 executes.
