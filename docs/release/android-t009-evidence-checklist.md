# Starter Clock Android T009 Evidence Checklist

**Status:** Prepared by T012; execution remains owned by T009
**Last updated:** 2026-07-18

Run this checklist only after the Play developer account, app, one-time
product, license testers, internal track, and signed test build are configured.
Record device model, Android version, build version/name, `versionCode`, tester
account type, time zone, network state, exact steps, result, timestamp, and
screenshots/video or logs for each case. Redact purchase tokens, receipts,
emails, starter names, notes, and photos before preserving evidence.

## Build and Device Baseline

- [ ] Install the signed internal-test artifact for `com.starterclock.app` from Google Play.
- [ ] Confirm the tested artifact reports the intended public version and unique `versionCode`.
- [ ] Confirm app, adaptive/themed launcher icon, splash, and 96×96 notification icon render correctly on representative masks and light/dark system themes.
- [ ] Record a small Android device at or near 320 logical px and one current representative Android device.
- [ ] Verify a clean install and an upgrade install from the previous retained test build when one exists.

## Core Offline Tracking and Persistence

- [ ] Create, rename, archive, reactivate, and delete a starter offline; verify confirmation and cascade behavior.
- [ ] Log a valid feeding offline, restart the app, and confirm source values, ratio, hydration, estimate snapshot, and selected starter persist.
- [ ] Edit and delete feedings offline; confirm estimates and history update coherently and no prior data reappears after restart.
- [ ] Exercise corrupt/interrupted-write recovery where device tooling allows; verify the last committed record remains valid and recovery is actionable.
- [ ] Change device time zone and cross a DST boundary in controlled test data; verify recorded instants do not change and displayed local times recompute.

## Notification Permissions and Scheduling

- [ ] Undetermined permission: save feeding first, see local rationale, continue to Android prompt, grant, and verify one notification schedules at interval start.
- [ ] Choose **Not now** at the rationale; verify tracking remains saved and no OS prompt or false “Reminder set” state appears.
- [ ] Deny OS permission; verify the feeding remains saved, denial is clear, and Settings recovery is available.
- [ ] Grant from Android Settings, return/resume, and verify reconciliation schedules the pending future reminder once.
- [ ] Edit the source feeding; verify the prior OS request is cancelled and exactly one replacement uses the recalculated target.
- [ ] Disable/cancel the reminder; verify no scheduled request remains.
- [ ] Delete the feeding; verify its scheduled notification is cancelled.
- [ ] Restart and resume with a future enabled intent missing its OS ID; verify one replacement schedules and no duplicate appears.
- [ ] Resume after the target is past; verify intent becomes expired rather than scheduling a stale notification.
- [ ] Change device time zone before the target; verify reconciliation preserves the absolute target and copy remains understandable.
- [ ] Observe delivered notification icon, channel name, title/body, tap behavior, and system light/dark rendering.

## Photos

- [ ] Grant photo access, select one image, save, restart, and verify the managed copy remains visible.
- [ ] Deny photo access; verify the feeding can still be saved with entered values preserved.
- [ ] Replace and remove a photo; verify old managed files are cleaned up.
- [ ] Delete the owning feeding/starter and delete all data; verify associated managed photos are removed.
- [ ] Verify no absolute picker URI or unintended photo bytes appear in structured export.

## Google Play Billing

- [ ] License tester sees the configured `starter_clock_pro_lifetime` product and localized store price; no price is hardcoded in app copy.
- [ ] Successful purchase grants Pro only after purchased state and acknowledgement/finalization.
- [ ] Pending purchase remains ungranted and explains that completion is pending.
- [ ] User cancellation returns to usable Free state without an error claim.
- [ ] Billing unavailable/failure leaves tracking usable and exposes retry guidance without granting Pro.
- [ ] Offline launch after a prior verified purchase uses cached Pro; record the cache timestamp behavior.
- [ ] Restore purchases refreshes and grants current ownership.
- [ ] Reinstall/clear local data then restore; confirm ownership returns from Google Play.
- [ ] Refund or revoke the purchase in the sandbox, refresh/resume, and verify Pro access is removed without deleting starters or feedings.
- [ ] Re-entitle after refund/revocation test where supported and verify retained data becomes browsable again.
- [ ] Free after entitlement loss keeps one selected starter and 30 recent feedings browsable; extra retained records are not deleted.
- [ ] Verify no receipt or purchase token is persisted, exported, logged, or included in captured evidence.

## Export, Share, and Delete All

- [ ] Export as Free and Pro; verify the Android share sheet opens and cancellation is harmless.
- [ ] Inspect `starter-clock-export/v1` JSON for all structured records and complete Pro history.
- [ ] Confirm export excludes OS notification IDs, purchase tokens/receipts, diagnostics, and secrets; photo entries are metadata only.
- [ ] Delete all as Free and Pro through named confirmation; verify records, preferences, reminders, managed photos, temporary exports, and derived entitlement cache are removed.
- [ ] Verify delete all does not cancel store ownership and a later restore can recover Pro without recovering deleted app data.
- [ ] Force or simulate external cleanup failure where feasible; verify retry guidance is explicit and the app does not claim complete deletion falsely.

## Accessibility, Appearance, and Layout

- [ ] Complete create starter → log feeding → understand interval → history/edit using TalkBack; verify names, roles, states, live announcements, and focus order.
- [ ] Verify modal focus containment and return, labelled Close actions, error announcements, and Settings recovery.
- [ ] Test 200% font size/reflow, display scaling, light/dark appearance, reduced motion, and high-contrast system settings where available.
- [ ] Verify no horizontal scroll or clipped critical action at 320 logical px; Android targets are at least 48×48 dp.
- [ ] Verify peak state and timeline do not rely on color alone and uncertainty text remains readable.

## Performance and Reliability

- [ ] With 1,000 feedings, measure warm interactive launch ≤2 seconds and cold launch ≤3 seconds on the representative matrix.
- [ ] Measure save and history update completion ≤1 second at p95, excluding OS prompts.
- [ ] Scroll complete Pro history through multiple 100-row pages without dropped interaction, duplicate rows, crash, or material memory pressure.
- [ ] Repeat offline/online resume, background/foreground, rotation if supported, and low-storage scenarios without corruption or lost committed data.

## Exit Evidence

- [ ] Every checklist result links to direct evidence or an exact blocker; failures have reproduction steps and affected build/device.
- [ ] Meaningful defects have regression coverage before rerun.
- [ ] Reconcile Android permission manifest, Data Safety draft, privacy page, store copy, and screenshots with the tested binary.
- [ ] T009 records an explicit release-readiness verdict; T012 completion alone is not native evidence.
