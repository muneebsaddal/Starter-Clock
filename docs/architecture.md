# Starter Clock Architecture

**Status:** T007 capability implementation contract
**Last updated:** 2026-06-22

This document is the canonical owner of technical decisions and boundaries.
Product behavior remains in `requirements.md`; screen behavior remains in
`ux-flow.md`.

## System Boundary

Starter Clock is one Expo SDK 56 / React Native TypeScript repository. Native
iOS and Android builds contain the complete local tracking app. The web build
contains the public landing page and calculators only. Domain code is shared;
tracking routes and native capability adapters are excluded from the web route
tree rather than shipped as a hidden dashboard.

```text
React screens/routes
       |
application use cases (transactions and orchestration)
       |
domain (entities, arithmetic, peak model, policies)
       |
repository/capability ports
       |
SQLite | notifications | files/photos | store purchases | export/share
```

The domain imports no React, Expo, SQL, file-system, notification, or purchase
module. System boundaries parse unknown values into domain types. UI reads and
writes through application use cases; it does not issue SQL or call native
capabilities directly.

## Decision Records

| ID | Decision and rationale | Alternatives rejected | Impact |
|---|---|---|---|
| ADR-001 | Use Expo SDK 56, React Native, Expo Router, and strict TypeScript in one repository. This is the chartered cross-platform boundary and SDK 56 is current on the access date. | Separate native apps; a second web repository. | One dependency graph and shared domain; native development builds are required for purchase testing. |
| ADR-002 | Organize by domain/application/infrastructure/UI boundaries, with feature folders only inside UI. Dependency direction points inward. | Screen-centric business logic; a generic global `utils` layer. | Peak logic and persistence can be tested without rendering or a device. |
| ADR-003 | Persist normalized records in `expo-sqlite`, use foreign keys and WAL, and run numbered SQL migrations in transactions. SQLite persists across restarts and fits relational edit/delete/history needs. | Async key-value JSON blobs; an ORM in MVP. | Explicit SQL and mappings; no ORM dependency; migration and interrupted-write tests are mandatory. |
| ADR-004 | Store quantities as integer tenths of a gram and temperature as integer tenths of a degree Celsius; store instants as epoch milliseconds plus the zone/offset captured at entry. | Floating-point source values; formatted local date strings. | Arithmetic is reproducible and DST-safe; display units/rounding never alter source values. |
| ADR-005 | Use deterministic peak model `baseline-v1`, snapshot every produced interval and explanation, and keep the model behind a versioned port. | Exact-time prediction; remote service; machine learning. | Existing history remains explainable after upgrades; changing coefficients requires a new model version and regression suite. |
| ADR-006 | Treat reminder intent in SQLite as source of truth and OS notification IDs as disposable delivery state. Reconcile after commits and at startup. | Treat scheduled OS notifications as truth; schedule before saving. | Feeding capture survives permission/scheduling failure; edits and deletes are idempotently rescheduled/cancelled. |
| ADR-007 | Copy one selected image into an app-managed documents directory, store only relative metadata in SQLite, and delete by owning record. | Store image bytes in SQLite; retain picker URIs; cloud upload. | Photos remain local and durable; orphan cleanup and file/DB compensation are required. |
| ADR-008 | Integrate the stores directly through `react-native-iap`; cache only a derived entitlement state and refresh/restore from the stores. | RevenueCat; custom purchase backend; trusting a permanent local boolean. | No additional customer-data processor or app account; purchase testing requires development/store builds and adapters. |
| ADR-009 | Export a versioned UTF-8 JSON document through an app-generated file and the system share sheet; delete-all uses one confirmed application use case. | Proprietary backup; paid export; raw SQLite export. | Export is portable and free; photos are referenced in structured export but binary photo bundling is deferred unless release validation requires it. |
| ADR-010 | Use native adapter files only at genuine capability boundaries and keep calculators/domain platform-neutral. | Broad `Platform.OS` branching throughout components. | Platform divergence stays localized; native tracking code is not part of the web product surface. |
| ADR-011 | Use Zod at persisted/imported/route/config/capability boundaries, repository transactions for multi-record writes, and typed error codes. | Trust TypeScript at runtime; user-facing raw exceptions. | Corrupt or external values fail explicitly while recoverable UI state remains intact. |
| ADR-012 | Collect no analytics in MVP. Keep a bounded local diagnostic ring buffer with error code, operation, model/schema version, platform, and timestamp—never amounts, names, notes, photos, or purchase tokens. | Full event analytics or crash attachments by default. | Privacy contract remains intact; support evidence is exportable only by explicit user action. |
| ADR-013 | Unit-test domain and policy code with Vitest; integration-test SQLite migrations/repositories and fake capability adapters; use React Native Testing Library for screens and later device E2E for critical native flows. | Device-only testing; snapshot-heavy UI tests. | NFR-005 coverage is enforceable at domain/data boundaries while native behavior still receives device verification. |
| ADR-014 | Personalize only after five valid observations with median absolute residual deviation at most three hours; apply a median residual shift capped at four hours and never narrow the baseline interval in MVP. | Personalize after one observation; regression/ML; silently learn from all history. | Outliers and sparse history do not create false confidence; the UI may say history adjusted the estimate only when this gate passes. |

## Repository Contract

T006 should scaffold this shape without changing the dependency direction:

```text
app/                         Expo Router entry points
  (mobile)/                  Today, History, Settings; native only
  (public)/                  landing and calculator routes
src/
  domain/                    entities, ratios, hydration, estimation, policies
  application/               use cases and port interfaces
  infrastructure/
    db/                      SQLite schema, migrations, repositories
    notifications/           local notification adapter
    files/                   photo/export adapters
    purchases/               store entitlement adapter
  ui/                        feature components, hooks, presentation mapping
```

Prefer platform-neutral files. Use `.native.ts` / `.web.ts` only for route or
capability adapters. Application use cases accept a clock and ID generator so
tests do not depend on ambient time or random values.

## Package Baseline and Capability Evidence

The package snapshot was checked on 2026-06-21 and the T007 native capability
versions were rechecked on 2026-06-22. The app uses
the current Expo SDK 56 template and uses `npx expo install` for Expo-owned
packages so compatible patch versions are resolved. Do not manually combine
the standalone latest React Native package with Expo.

| Package | Checked version | Decision |
|---|---:|---|
| `expo` | 56.0.12 | Platform/runtime baseline |
| `expo-router` | 56.2.11 | File-based navigation and web route splitting |
| `expo-sqlite` | 56.0.5 | Structured local persistence |
| `expo-notifications` | 56.0.18 | One-off local peak notifications |
| `expo-file-system` | 56.0.8 | Managed photo and export files |
| `expo-image-picker` | 56.0.18 | System photo/camera picker |
| `expo-crypto` | 56.0.4 | UUID generation |
| `expo-sharing` | 56.0.18 | System export share sheet |
| `react-native-iap` | 15.3.2 | Direct StoreKit / Google Play Billing entitlement adapter |
| `zod` | 4.4.3 | Runtime boundary schemas |
| `vitest` | 4.1.9 | Domain and non-rendered integration tests |
| `@testing-library/react-native` | 14.0.0 | Component/accessibility behavior tests |

Primary capability evidence:

- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) states that
  its SQLite database persists across app restarts and supports asynchronous
  transactions.
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
  supports one-off scheduled local notifications. Local notifications remain
  available in Expo Go, but the release path uses development builds.
- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) gives
  access to app-local files/directories; [Expo ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
  uses system image/camera UI and permission configuration.
- [Expo in-app purchases](https://docs.expo.dev/guides/in-app-purchases/)
  confirms that IAP libraries contain custom native code and therefore require
  a development build rather than Expo Go.
- Package versions above came from the public npm registry on the access date;
  they are an evidence snapshot, not a reason to bypass Expo compatibility
  resolution.

### T007 notification and store implementation evidence

Checked 2026-06-22:

- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
  supports one-off local date notifications and requires an Android channel
  before the Android 13 permission prompt can appear. The adapter creates the
  `peak-reminders` channel before checking or requesting permission. Starter
  Clock does not request Android exact-alarm access: this is a near-window
  reminder, not an alarm-clock guarantee, and exact delivery still requires
  later device verification.
- [Expo in-app purchases](https://docs.expo.dev/guides/in-app-purchases/)
  requires custom native code and therefore a development build rather than
  Expo Go. `react-native-iap` and its Nitro peer are linked through app config.
- [Google Play Billing integration](https://developer.android.com/google/play/billing/integrate)
  requires pending purchases to remain ungranted, completed purchases to be
  queried when the app reconnects, and delivery to be acknowledged within
  three days to avoid automatic refund and revocation. The adapter grants Pro
  only for `purchased`, finalizes the non-consumable, and refreshes on launch,
  resume, and explicit restore.
- [Apple StoreKit current entitlements](https://developer.apple.com/documentation/storekit/transaction/currententitlements)
  is the store-owned source used by the IAP library for restorable current
  ownership. [Apple sandbox testing](https://developer.apple.com/documentation/storekit/testing-in-app-purchases-with-sandbox)
  remains required before release.

The public non-consumable identifier is
`starter_clock_pro_lifetime`. No receipt, purchase token, account identifier,
or user-entered value is persisted or logged. SQLite stores only the derived
`free`/`pro` result, store family, and last successful verification time.

No state-management, ORM, date-time, analytics, or remote data package is
approved. React state/reducers, `Intl`, and small repository mappings cover the
MVP. Additions require a measured need and an ADR amendment.

## Domain and Data Model

All IDs are UUID strings. Every mutable record has `created_at_ms` and
`updated_at_ms`. Database mapping converts snake_case rows to domain types.

| Entity/table | Required source fields | Lifecycle and constraints |
|---|---|---|
| `starters` | `id`, trimmed `name`, `status`, timestamps | Name 1–40 visible characters; `status` is active/archived; delete cascades to owned data. |
| `feedings` | `id`, `starter_id`, `fed_at_ms`, `entry_zone`, `entry_offset_minutes`, starter/flour/water tenths-g, optional flour type/temp tenths-C/notes, timestamps | Positive quantities; newest-first index on `(starter_id, fed_at_ms DESC)`; source values are never rounded for display. |
| `peak_estimates` | `feeding_id`, `model_version`, earliest/midpoint/latest ms, mode, factor-code JSON, missing-input JSON, timestamps | Immutable result snapshot replaced transactionally when a feeding edit recalculates it. |
| `peak_observations` | `feeding_id`, `observed_at_ms`, timestamps | Zero or one per feeding; must be after its feeding and within 2–36 elapsed hours to influence personalization. |
| `photos` | `feeding_id`, relative path, MIME type, byte size, timestamps | Zero or one per feeding; no absolute picker URI persists. |
| `reminders` | `feeding_id`, intent enabled, status, target ms, optional OS notification ID/error code, timestamp | One per feeding; intent persists even when permission is denied. |
| `preferences` | singleton selected starter, temperature unit, appearance, reminder default | Boundary-validated; defaults are explicit migration data. |
| `entitlement_cache` | singleton product ID, state, store, last verified ms | Derived cache only; no purchase token or receipt in logs/export. |
| `diagnostics` | bounded sequence, error code, operation, schema/model version, platform, timestamp | Maximum 100 records; excludes user-entered and secret data. |
| `schema_meta` | schema version and migration timestamp | Used in addition to SQLite `user_version` for diagnostics. |

### Schema and migration rules

- Enable `PRAGMA foreign_keys = ON` on every connection and WAL during database
  initialization.
- Migrations are immutable, sequential `NNN_name.sql` steps. A single exclusive
  transaction advances from the stored version to the target. Set the new
  version only after its step succeeds.
- Before a destructive migration, create an app-private database backup. On
  failure, roll back, retain the last valid database, mark recovery required,
  and do not open repositories against a partial schema.
- Repository writes that change a feeding, estimate, observation, reminder
  intent, or entitlement-visible selection are atomic transactions.
- Retention is not entitlement-dependent. Free limits affect queries/actions,
  never deletion. The database retains complete history until the user deletes
  it.

## Calculation and Peak Model Contract

The executable reference is `docs/prototypes/t005-model/`. T006 ports it into
`src/domain` without changing behavior and retains its tests.

### Exact arithmetic

- Feeding ratio is normalized to starter = 1:
  `1 : flourGrams / starterGrams : waterGrams / starterGrams`.
- Hydration is `waterGrams / flourGrams × 100`.
- Calculations use normalized source values. Rounding belongs only to the
  presenter: ratio components to at most two decimals and hydration to one
  decimal, with trailing zeroes omitted.

### `baseline-v1` heuristic

The model accepts feeding instant, positive starter/flour/water grams, optional
flour category, optional Celsius temperature, and eligible prior residuals.

1. At 24 °C, 100% hydration, and white flour, the midpoint is
   `max(2, 6 + 1.7 × log2(flour / starter))` hours.
2. For recorded temperatures from 10–35 °C, multiply time by
   `2 ^ ((24 - temperatureC) / 10)`. Outside that calibration range, do not
   extrapolate: use the 24 °C midpoint and widen the window.
3. Multiply by `(100 / hydrationPercent) ^ 0.15`, clamping hydration to
   50–200% for the estimate. Clamp flour/starter ratio to 0.25–20.
4. Flour multipliers are white/other 1.00, blend 0.95, whole wheat 0.90, and
   rye 0.82. These are product heuristics, not measured universal constants.
5. Baseline half-width is `max(0.75 h, midpoint × 0.10)`. Add 20% of midpoint
   when temperature is absent/out of calibration, 8% when flour is absent, and
   15% when ratio or hydration is outside calibration.
6. Bound the midpoint to 2–36 hours and the interval to 1–48 hours after the
   feeding. Round stored timestamps to the nearest minute.

Factors identify only values actually recorded. Missing/out-of-range values
produce `widened`, never an invented measurement. The dashboard derives
before/in/past state by comparing the current absolute instant with the stored
earliest/latest instants.

### Personalization

For up to the latest 12 eligible observations, calculate
`observed elapsed hours - baseline midpoint hours`. An observation is eligible
only when predicted and observed elapsed values are 2–36 hours and the absolute
residual is at most 12 hours.

Apply personalization only with at least five eligible observations and a
median absolute residual deviation no greater than three hours. Shift the
midpoint by the median residual, capped to ±4 hours. Do not narrow the baseline
window in MVP. Otherwise use baseline and expose either
`not_enough_observations` or `observations_too_variable`; the UI must not claim
learning.

### Scientific and accuracy boundary

Peak here means the user-observed maximum rise before visible decline, not
microbial safety, maturity, or laboratory growth rate. Published work supports
that temperature, inoculum/feeding conditions, flour, and starter ecology can
affect fermentation, but it does not validate these coefficients for household
rise-peak prediction:

- Di Biase et al. varied temperature, pH, and inoculum in a controlled liquid
  sourdough and found different conditions changed strain growth and metabolite
  patterns ([open-access article; DOI 10.3390/foods11233942](https://pmc.ncbi.nlm.nih.gov/articles/PMC9741194/)).
- Taheri et al. found flour type affected bacterial communities and explicitly
  identified broader feeding-frequency and inoculum-ratio work as still needed
  ([open-access article; DOI 10.1128/spectrum.02380-25](https://pmc.ncbi.nlm.nih.gov/articles/PMC12772405/)).
- Minervini et al. found flour microbiota/nutrients were a major driver of
  population dynamics over repeated propagation
  ([DOI 10.3389/fmicb.2018.01984](https://doi.org/10.3389/fmicb.2018.01984)).

Therefore T005 establishes deterministic correctness and conservative behavior,
not predictive accuracy. No accuracy threshold has passed. Before any marketing
accuracy claim or interval narrowing, a held-out set of at least 30 valid
observations from at least 10 starters must show at least 80% interval coverage
and median absolute midpoint error no greater than two hours. Until then the UI
uses “estimated” and observable-sign guidance exactly as specified in the UX.

## Application Workflows

### Save or edit a feeding

1. Parse and validate form values; compute ratio/hydration preview in domain.
2. In one SQLite transaction, write source feeding, estimate snapshot, reminder
   intent, and any observation change.
3. Commit and return tracking success.
4. If reminder intent is enabled, request permission when needed, schedule the
   earliest-window instant, then persist delivery status/OS ID in a second
   transaction. Failure changes reminder status only.
5. A selected photo is copied to a temporary managed path first, renamed to its
   final path after the database commit, and recorded through compensation. On
   any failure, keep the feeding and expose photo-specific recovery.

Edits cancel the prior OS notification after the feeding transaction commits,
then schedule the replacement. Deletes transactionally remove database-owned
records first, then best-effort cancel the OS notification and remove the file;
startup orphan reconciliation retries external cleanup.

### Reminder reconciliation

At launch/resume, compare enabled future reminder intents with permission and
scheduled IDs. Schedule missing future reminders, cancel IDs with no intent,
and mark past targets expired. Never schedule more than one notification per
feeding. Android creates a named channel before the permission request. Tests
use a fake adapter and clock; device tests verify OS behavior and denial.

### Purchase entitlement

The application port exposes `getEntitlement`, `purchaseLifetime`, and
`restorePurchases`. The native adapter maps the single approved non-consumable
product to `pro` only after a successful store response. Launch/resume and
explicit restore refresh the cache when network/store service is available;
offline uses the last verified state. Refund/revocation changes access on the
next successful refresh but never deletes data. Web has no purchase adapter.

### Export and deletion

Export schema `starter-clock-export/v1` contains export timestamp, app/schema/
model versions, preferences excluding diagnostics, starters, feedings, estimate
snapshots, observations, reminder intent/status, and photo relative metadata.
It excludes OS notification IDs, purchase tokens/receipts, diagnostics, and
secrets. Write to a temporary app file, invoke the system share sheet, then
remove the temporary file.

Delete-all requires named confirmation, disables repository writes, cancels
known notifications, deletes managed photo/export files and SQLite databases,
clears entitlement cache/preferences, recreates an empty current schema, and
reports any external cleanup retry explicitly. Store ownership itself cannot be
deleted locally and remains restorable.

## Validation, Errors, Privacy, and Security

- Zod schemas validate routes, forms before use-case invocation, database rows,
  import/export, configuration, purchase responses, and notification payloads.
- Domain failures use stable codes such as `VALIDATION_AMOUNT`,
  `DB_MIGRATION_FAILED`, `PHOTO_COPY_FAILED`, `NOTIFICATION_DENIED`, and
  `PURCHASE_UNAVAILABLE`. Presenters map codes to plain-language recovery.
- User input remains in UI state until the use case commits. A notification,
  photo, purchase, sharing, or network failure cannot roll back a valid feeding.
- Database, photos, notes, observations, and estimates stay in the app sandbox.
  No product-controlled service, analytics SDK, ad SDK, or account is present.
- App configuration may contain public store product identifiers but no secret.
  Purchase receipts/tokens, user values, names, notes, and file paths never enter
  diagnostics.

## Verification Boundary

T006 must preserve the prototype model suite and add:

- migration tests from every prior schema plus rollback/interruption;
- repository CRUD, cascade, 1,000-feeding query, and restart persistence tests;
- fake-adapter tests for notification reconciliation, photo compensation,
  entitlement loss/restore, export, and delete-all;
- screen tests for validation preservation and accessibility semantics;
- device tests for notification permission/scheduling, image permissions,
  store sandbox flows, time-zone/DST display, and restart recovery.

Domain and data modules require at least 80% statement and branch coverage.
Every migration/model change adds a versioned fixture and regression tests.

## Known Risks

- `baseline-v1` is a transparent product heuristic without household accuracy
  evidence. Its wide interval and no-narrowing personalization rule mitigate but
  do not remove this risk.
- Store behavior, OS notification delivery, permissions, and file cleanup cannot
  be fully proven in unit tests; representative device/sandbox verification
  remains a later release gate.
- Direct store integration reduces third-party data processing but increases
  adapter and test responsibility compared with a purchase service.
