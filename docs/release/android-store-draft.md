# Starter Clock Android Store Draft

**Status:** T012 local draft; not uploaded or submitted
**Policy access date:** 2026-07-18

This file owns the non-submission Google Play listing and disclosure groundwork
prepared in T012. T009 still owns representative Android evidence. T010 must
revalidate policy, reconcile this draft with the tested release binary, obtain
pricing approval, and perform any external Play Console work.

## Listing Identity

| Field | Draft |
|---|---|
| App name | Starter Clock |
| Package | `com.starterclock.app` |
| Default language | English (United States) |
| Category | Food & Drink |
| Support email | `support@starterclock.app` |
| Support URL | `https://starterclock.app/support` |
| Privacy policy URL | `https://starterclock.app/privacy` |
| Website | `https://starterclock.app` |

The owner controls domain deployment and email provisioning. Confirm that the
support mailbox receives mail before deploying the pages or entering these
details in Play Console. No response-time promise is made.

## Store Copy

### Title — 13/30 characters

> Starter Clock

### Short description — 58/80 characters

> Track sourdough feedings and see an estimated peak window.

### Full description

> Know roughly when your sourdough starter may peak.
>
> Starter Clock helps home bakers record a feeding, understand an estimated
> peak window, and set one local reminder near the start of that window. The
> estimate uses the amounts and optional flour type and temperature you record,
> then explains which factors shaped the result.
>
> Log starter, flour, and water amounts in grams. See the feeding ratio and
> hydration before saving. Review and edit feeding history, record the peak you
> observed, and optionally keep one progress photo with a feeding.
>
> Core tracking works offline without an account. Starter names, feedings,
> notes, estimates, observations, reminders, and photos stay on your device.
> You can export structured records or delete all local app data at any time.
>
> Free includes one active starter, local reminders, and the 30 most recent
> feedings. An optional one-time Lifetime Pro purchase unlocks multiple active
> starters and complete retained history. The current localized offer appears
> in the app store purchase sheet. Restore purchases is available.
>
> Peak timing is approximate. Starter behavior changes with temperature,
> flour, hydration, feeding ratio, starter health, and environment. Starter
> Clock provides an estimated window for planning and does not make food-safety
> or health claims.

The copy deliberately avoids an accuracy percentage, exact-time prediction,
release-price claim, download call to action, testimonial, award, or statement
that the app is already available.

## Lifetime Pro Product Draft

| Field | Draft |
|---|---|
| Product type | One-time product / non-consumable entitlement |
| Product ID | `starter_clock_pro_lifetime` |
| Title | Starter Clock Lifetime Pro |
| Description | Unlock multiple active starters and complete retained feeding history. |
| Multi-quantity | Disabled |
| Price | **UNDECIDED — owner approval required** |
| Activation | **NOT AUTHORIZED IN T012** |

Do not create, price, activate, upload, or submit this product in T012. Google
allows a product title up to 55 characters and description up to 200; the
drafts above remain below those limits.

## Data Safety Draft

These answers reflect the implemented release candidate as of 2026-07-18, not
a submitted Play form:

| Question | Draft answer | Basis |
|---|---|---|
| Does the app collect or share required user-data types? | No | Starter data, feeding inputs, observations, photos, diagnostics, and entitlement cache remain on-device and are not transmitted to a product-controlled service. Google states that access solely on-device is not collection. |
| Is any user data shared with other companies or organizations? | No | The app has no analytics, ads, accounts, cloud sync, or product backend. User-directed export through the system share sheet is initiated and controlled by the user. |
| Financial information | No developer collection | Google Play processes payment information directly under its terms. The app never accesses payment-card data and does not persist or log receipts or purchase tokens. |
| Data deletion mechanism | Yes, in app | Delete all local data is available to Free and Pro users. It removes local records, managed photos, reminders, preferences, and the derived entitlement cache, but cannot delete store ownership. |
| Privacy policy required | Yes | Use `https://starterclock.app/privacy` after owner-controlled deployment. |

Before submitting in T010, inspect the exact production dependency graph and
generated Android manifest, recheck current SDK disclosure guidance, and
reconcile the final Play form with the tested binary. A future analytics,
crash-reporting, account, cloud, ad, or server-side receipt-verification change
invalidates the “No collection or sharing” draft.

## Screenshot Shot List

Capture real app UI from the tested release candidate after T009 passes. Do not
use prototype screens or fabricate device evidence.

| Order | State | Core message | Capture requirements | Suggested alt text |
|---:|---|---|---|---|
| 1 | Today, before peak window | Estimated peak window is immediately visible | Named starter, estimated interval, starts-in copy, reminder status; no sensitive user content | Estimated peak window for a recently fed starter |
| 2 | Feeding entry with valid preview | A feeding is quick to record | Required amounts, ratio, hydration, reminder default; optional fields collapsed | Feeding form showing ratio and hydration before save |
| 3 | Why this window expanded | The estimate is transparent | Recorded factors, missing-input uncertainty, observable signs; no confidence percentage | Explanation of factors shaping the estimated peak window |
| 4 | History with observed peak | Estimate and observation can be compared | Newest-first entries and one estimated-versus-observed result | Feeding history with an observed peak time |
| 5 | Reminder recovery | Optional capabilities fail safely | Permission-denied or recovery state with Settings action, only after T009 verifies it | Reminder permission recovery with device settings action |
| 6 | Lifetime Pro sheet | Upgrade boundary is factual | Multiple starters and complete history benefits, Restore purchases, localized store price only if live | Lifetime Pro benefits and restore purchases action |

Google Play requires at least two screenshots to publish and recommends four
phone screenshots at a minimum 1080px resolution in 9:16 portrait for broader
recommendation surfaces. Use PNG or JPEG without alpha, keep each edge within
320–3840px and no more than 2:1, prioritize actual UI in the first three, omit
device frames and store badges, clean notification-bar artifacts, and add alt
text no longer than 140 characters.

## Visual Asset Inventory

| Asset | Repository source | Output | Validation |
|---|---|---|---|
| App icon | `assets/branding/app-icon.svg` | `assets/app-assets/icon.png`, 1024×1024 opaque | Full bleed, square, no rounded-corner pixels or text |
| Adaptive foreground | `assets/branding/adaptive-foreground.svg` | `assets/app-assets/adaptive-foreground.png`, 1024×1024 transparent | Centered within representative circle/squircle safe area |
| Adaptive monochrome | `assets/branding/adaptive-monochrome.svg` | `assets/app-assets/adaptive-monochrome.png`, 1024×1024 transparent | Single-color themed-icon source |
| Notification icon | `assets/branding/notification-icon.svg` | `assets/app-assets/notification-icon.png`, 96×96 transparent | All-white mark, readable at small size |
| Splash icon | `assets/branding/splash-icon.svg` | `assets/app-assets/splash-icon.png`, 1024×1024 transparent | Configured through `expo-splash-screen` on warm and dark backgrounds |

The Google Play 512×512 listing icon and 1024×500 feature graphic remain T010
finalization items because T012 does not upload a listing and the feature
graphic should be reconciled with verified screenshots.

## Official Sources

- [Expo EAS build profiles](https://docs.expo.dev/build/eas-json/)
- [Expo app version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo splash screen and app icon](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- [Expo notification icon configuration](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Google Play metadata policy](https://support.google.com/googleplay/android-developer/answer/9898842?hl=en)
- [Google Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-419)
- [Google Play Data Safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Google Play one-time product setup](https://support.google.com/googleplay/android-developer/answer/1153481?hl=en-EN)
