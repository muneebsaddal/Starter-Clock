# T012 — Prepare Non-Submission Android Release Groundwork

## Objective and Outcome

Prepare the local configuration, public support material, visual asset system,
and truthful store-metadata drafts that do not require a verified Google Play
developer account. This reduces later T010 release work without claiming store
or device readiness.

## Dependencies and Context

- Dependencies: T011 and explicit owner assignment approving this narrowed work
  before T009 completes.
- T009 remains blocked and retains ownership of representative device,
  notification, purchase, export/delete, accessibility, and rendered web
  verification.
- Read: `docs/architecture.md`, `docs/requirements.md`, `docs/prd.md`,
  `docs/ux-flow.md`, `docs/release-readiness.md`, T009/T010 plans, and the
  current Expo app/web configuration.

## Scope

### In

- Add local EAS build-profile configuration for development, internal-test,
  and production intents without creating or storing signing secrets.
- Add explicit Android/iOS build-version configuration while preserving package
  `com.starterclock.app` and bundle identifier `com.starterclock.app`.
- Create and validate production app icon, Android adaptive icon, Android
  notification icon, and splash assets consistent with Starter Clock's warm,
  calm visual system.
- Add accurate public `/privacy` and `/support` web pages suitable for the
  purchased domain; deployment and DNS remain owner-controlled external steps.
- Draft Play Store title, short description, full description, category,
  support details, screenshot shot list, and Data Safety answers mapped to the
  implemented local-only data flow.
- Record the one-time product identifier `starter_clock_pro_lifetime` while
  leaving price selection and activation explicitly open for owner approval.
- Prepare the Android internal-test/device evidence checklist that T009 will
  execute after account verification.

### Out

- Google Play identity/account verification, payments-profile setup, license
  tester creation, or merchant configuration.
- Creating or activating the Play one-time product, selecting its price,
  uploading a bundle, creating a store release, or submitting anything.
- Generating or committing signing keys, credentials, service-account files,
  receipts, tokens, or other secrets.
- Claiming native, purchase, notification, accessibility, privacy, or release
  readiness before T009 passes.
- New product features, analytics, cloud accounts/sync, pricing-model changes,
  Apple App Store submission work, or expansion of the MVP.
- The final rendered post-`expo-sharing` Playwright check, which remains owned
  by T009.

## Acceptance Criteria

- `eas.json` expresses development, internal-test, and production intents and
  passes local configuration validation without requiring stored secrets.
- Expo configuration contains explicit initial build versions and valid
  references for every required icon/splash/notification asset; identifiers
  remain `com.starterclock.app`.
- Asset files meet current official Android/Expo format and dimension rules and
  pass visual checks at representative masks and small notification size.
- `/privacy` and `/support` build successfully, accurately describe the
  implemented product/data flow, contain no placeholder legal or contact claim,
  and remain usable from 320 px through desktop widths.
- Store copy and the Data Safety draft match implemented behavior, distinguish
  mobile tracking from web calculators, and make no unsupported prediction,
  food-safety, platform, price, or availability claim.
- The screenshot plan covers the core feed-to-peak promise and required states
  without fabricating device evidence or final screenshots.
- Pricing remains explicitly undecided; no product is activated or submitted.
- Android T009 checklist covers permissions, notifications, restart/time-zone,
  offline persistence, photos, purchase states, restore/refund/revocation,
  export/share, delete-all, accessibility, and performance.
- Host quality gates pass, source/config secret scans are clean, and the final
  diff contains no submission or credential material.

## Expected Files

Likely `app.json`, a new `eas.json`, asset files under a dedicated app-assets
directory, web privacy/support routes and tests, store-copy/checklist documents,
and affected canonical task/roadmap/handoff records.

## Steps

1. Verify current official Expo and Google requirements for configuration,
   assets, public support/privacy pages, store metadata, and Data Safety.
2. Configure version/build profiles without signing material or remote mutation.
3. Produce and visually validate the app/adaptive/notification/splash assets.
4. Implement and render-test the privacy and support pages.
5. Draft truthful store metadata, Data Safety answers, screenshot plan, and the
   T009 Android evidence checklist.
6. Run host quality, configuration, asset, web, secret, and diff checks.
7. Update canonical records, commit T012 once, and stop without uploading or
   submitting anything.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run test:coverage`
- `npm run lint`
- `npm run build:web`
- `npx expo config --type public`
- `npx expo export --platform android`
- Current official asset/config validation appropriate to the implemented files
- Rendered web checks for `/privacy` and `/support` at mobile and desktop sizes
- Source/config secret and placeholder scan
- `git diff --check`

## Risks and Rollback

Store and Expo requirements may change during account verification. Record
access dates and revalidate in T010 before any release. Keep configuration and
assets reviewable and reversible; do not create external state or signing
material in this task.

## Completion Record

- Outcome: Not started
- Summary: —
- Actual files changed: —
- Verification: —
- Remaining risks or blocker: Explicit owner assignment is required before
  execution. Google Play verification and all release-readiness evidence remain
  owned by T009.
