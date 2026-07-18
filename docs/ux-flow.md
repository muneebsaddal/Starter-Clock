# Starter Clock UX Flow

**Status:** T007 reminder and Lifetime Pro states implemented

**Last updated:** 2026-06-22

This document is the canonical owner of screens, user flows, interaction
states, responsive behavior, and accessibility decisions. Product constraints
remain in `requirements.md`; the T005 model will define calculation behavior.

## Experience Contract

The interface makes one promise at a time: **know when your starter will
peak**. The first viewport answers that question with an interval, its current
state, and the status of an optional, default-on reminder. It never presents an
exact predicted instant.

- Show the peak interval before charts, history, or secondary metrics.
- Keep the primary feeding path to time plus starter, flour, and water amounts.
- Calculate ratio and hydration before save; disclose flour, temperature,
  photo, and notes as optional detail.
- Use “estimate,” “about,” and “may” around peak timing. Do not use “ready,”
  “safe,” or a confidence percentage unsupported by T005.
- Preserve entered values through every recoverable error.
- Keep tracking usable without network, notifications, photos, or Pro.

These decisions trace to FR-002, FR-003, FR-004, FR-005, FR-006, FR-010,
FR-011, FR-014, NFR-001, NFR-002, NFR-003, NFR-010, NFR-011, and the fast,
transparent planning gap described by T002.

## Information Architecture

Mobile has two persistent destinations:

1. **Today** — active starter, latest peak window, feeding action, reminder,
   latest feeding, and observed-peak action.
2. **History** — newest-first feedings, estimate-versus-observed result, and
   entry detail/editing.

The active-starter switcher opens starter management. The T007 Lifetime Pro
sheet is reachable from the starter-limit action and Free history notice, and
contains purchase and restore. Later Settings work owns units, appearance,
export, and delete-all-data without moving purchase behind a paid gate.
Creation and editing use focused sheets so Today remains the stable place users
return to. Web does not use this tracking IA in MVP (CON-002).

```text
First use -> Create starter -> Log feeding -> Today / peak interval
                                      |          |-> Explain factors
                                      |          |-> Change/cancel reminder
                                      |          |-> Record observed peak
                                      +-> History -> Feeding detail -> Edit/delete
Today -> Starter switcher -> create/rename/archive/delete or free-limit choice
Today/History -> Lifetime Pro -> purchase or restore
```

## Primary Flow Decisions

### First use and starter creation

The empty Today screen explains the outcome in one sentence, states that no
account is needed, and offers one action: **Create my starter**. Creation asks
only for a 1–40-character name. On success, feeding entry opens immediately.
Whitespace-only names show an inline correction and retain focus. Duplicate
names are allowed. Permanent deletion is a destructive confirmation that
names the starter and associated feedings/photos (FR-001, FR-014).

### Log a feeding

The dashboard action opens a bottom sheet on mobile and a centered contained
panel on wide web prototype viewports. The default order is:

1. Feeding time, defaulted to now and editable.
2. Starter, flour, and water grams in a single visible amount group.
3. Live feeding-ratio and hydration preview.
4. Default-on **Remind me near peak** control, using the remembered preference.
5. Collapsed optional section: flour type, temperature, photo, and notes.
6. Full-width **Save feeding** action.

All amount fields use a decimal keypad hint. Zero, negative, non-numeric, or
missing required values block save with one summary sentence, focus the first
invalid field, and preserve the rest. Photo denial returns to the same form.
A storage failure leaves the sheet and every value open with **Try again**
guidance. Save success returns to Today, announces that the peak window was
updated, and automatically schedules the reminder when enabled. Reminder
permission or scheduling failure is handled after the feeding is safely saved
(FR-002–003, FR-006, FR-009–010, FR-014; NFR-001, NFR-011).

### Understand the peak

The dominant card reads, for example, **Estimated peak — Today, 4:30–6:00
PM**. It pairs the interval with exactly one state:

- **Before peak window** — “Starts in about …”
- **In peak window** — “Mabel may be near peak now”
- **Past peak window** — “Window ended about … ago”

A timeline distinguishes feeding time, current time, and interval without
using color alone. **Why this window?** expands an uncertainty statement,
observable signs, and only the factors actually recorded. Missing flour type
or temperature produces a visibly wider interval and explicitly names the
missing factors. The UI makes no claim about accuracy, safety, or learning
before T005 supplies verified behavior (FR-004–005, FR-008; NFR-002, NFR-009).

### Reminder and observation

**Remind me near peak** is enabled by default in feeding entry and remembers the
user's last choice. Saving schedules the reminder for the interval start with
no separate dashboard setup action. The user can opt out before saving and can
Change or Cancel after success. When notification permission is undetermined,
the feeding saves first, then a contextual rationale precedes the OS prompt.
Denial or scheduling failure shows a recoverable status, never false success,
and never blocks feeding. Editing or deleting the source feeding previews and
applies the reminder consequence (FR-006, FR-014; NFR-011).

The implemented first-use sequence is save feeding, show a local rationale,
then show the OS prompt only after the user continues. **Not now** leaves intent
pending without opening system permission UI. A denied reminder links to system
notification settings; editing and saving retries scheduling. Today shows
“Reminder set” only after the OS returns a scheduled identifier.

**Record observed peak** asks for an absolute date/time, defaulted within the
estimated interval. History then displays estimated versus observed time. The
copy says this records what happened; it does not claim that later estimates
have learned until the threshold is defined by T005 (FR-008).

### History, editing, deletion, and entitlement

History is grouped by local calendar date and ordered newest-first. Each row
shows ratio, optional flour/temperature, estimated interval, and observed peak
when present. Detail reuses feeding entry with **Edit feeding** and exposes
**Delete feeding** below Save. Delete confirmation states that its estimate,
observation, photo, and reminder are also removed (FR-007–009).

Free copy is factual and non-punitive: “Showing your 30 most recent feedings on
Free.” Pro explains multiple active starters and complete retained history.
At the starter limit, users may archive the current starter or view the
one-time Pro offer. Entitlement loss never implies deletion. Export and delete
all data are always visible in Settings and never presented as paid features
(FR-011, FR-013).

The Lifetime Pro sheet distinguishes purchased, pending, cancelled, failed,
restored, not-found, and offline-cache results. It does not hardcode an
unapproved price; the store sheet displays the current localized price before
confirmation. After entitlement loss, the last selected starter remains the
single browsable Free starter and other retained starters are not deleted.

## Screen and State Contract

| Surface | Required states and recovery | Trace |
|---|---|---|
| Today | first use; loading skeleton; before/in/past interval; missing-input wider interval; no saved feeding; offline banner; read/storage failure with retry | FR-004–005, FR-010, FR-014 |
| Feeding sheet | create/edit; live valid preview; invalid field; date in future; photo denied; save in progress; storage failure preserving values; success | FR-002–003, FR-009–010, FR-014 |
| Reminder | default-on and opted-out preference; post-save permission rationale; denied with Settings route; scheduling failure; automatically scheduled; changed; cancelled | FR-006, FR-014, NFR-011 |
| History/detail | empty; populated; newest 30 Free boundary; full Pro history; observed peak absent/present; edit/delete confirmation | FR-007–008, FR-011 |
| Starter management | one active Free; archived starter; Pro multiple starters; rename validation; deletion confirmation | FR-001, FR-011 |
| Optional capability | offline, photo denied, notification denied, purchase unavailable: core logging stays enabled | NFR-011 |
| Appearance | light, dark, 200% text/reflow, reduced motion | NFR-003, NFR-010 |

Loading keeps the page title available to assistive technology and uses a
non-animated fallback under reduced motion. Offline is informational because
local tracking is expected to work. Errors use specific next actions and do
not rely on red alone (FR-010, FR-014).

## Layout and Platform Behavior

- **Small Android:** critical flow fits at 320 logical px with no horizontal
  scroll. Actions stack; amount fields remain one row only while labels and
  values fit, otherwise implementation may switch to a vertical group.
- **Current iPhone:** respect safe areas; bottom sheets use native-feeling drag
  affordance but always provide a labelled Close button.
- **Tablet/wide viewport:** cap reading width near 780 px; the peak card may
  place its timeline beside the interval. Do not stretch controls edge-to-edge.
- **Responsive web:** T004 prototype reflows for review, but mobile tracking is
  not a promised web MVP feature. T008 owns public web IA and calculators.
- Use platform date/time pickers and notification/photo permission dialogs.
  The app supplies a short rationale before the OS prompt and a Settings route
  after denial.

## Accessibility and Visual System

The approved mobile tracking direction is a Cool Quiet Instrument: cool mist
and paper surfaces, deep ink, restrained sage, and supporting slate. It is calm
and tactile without warm amber dominance or decorative analytics. DM Sans is
bundled locally; Regular and Medium carry most interface text, while Semibold
is reserved for titles, actions, and essential status emphasis. The revised
layouts use 24 px screen margins, smaller peak modules, 50 px primary actions,
and more deliberate vertical rhythm.

The implementation source is the five-page Affinity-ready package at
`output/pdf/starter-clock-v2-affinity.pdf`, with editable SVGs, tokens, font
files, and proofs under `output/design/starter-clock-v2/`. This direction
supersedes the earlier warm paper/earthen red mobile prototype styling. T013
owns production integration. T008's public web visual identity is unchanged by
this mobile design approval.

Information hierarchy, text, shape, and labels carry meaning independently of
color. Implementation tokens support semantic surface, text, muted text,
accent, success, warning, danger, line, and focus colors in both appearances.

- Minimum targets are 44×44 pt on iOS/web and 48×48 dp on Android.
- Every icon-only action has a text accessibility label. Visible labels name
  every field; errors are associated with fields and announced.
- Focus follows visual order, remains trapped within an open modal, returns to
  its trigger on close, and never lands behind a sheet.
- The peak heading is first in reading order. Timeline semantics announce fed
  time and interval in text rather than exposing decorative marks.
- Dynamic save, reminder, and error results use polite status announcements;
  blocking validation uses an alert.
- Text reflows without loss at 200%; reduced-motion users receive no pulsing or
  movement required for understanding.

## Prototype and Validation Status

The disposable interactive prototype is at
`docs/prototypes/t004/index.html`. Its scenario control covers first use,
missing inputs, offline, denied permissions, storage failure, the Free starter
limit, and loading. It deliberately does not persist data or implement a peak
formula.

Automated interaction and viewport checks verify mechanics, not usability. The
user completed an owner walkthrough, found the flow and estimated-window
communication clear, requested default-on automatic reminders, and explicitly
waived the unavailable five-participant study on 2026-06-21. The original
protocol remains in `docs/prototypes/t004/usability-test.md` for later use.
NFR-001 and NFR-002 are not reported as passed; their uncertainty is accepted.

## T006 Native Owner Feedback

The 2026-06-22 Android review established these priorities for the current
native flow:

- Switching between Today and History must preserve the themed application
  surface without an intermediate white flash. Navigation should feel
  continuous rather than like a new page load.
- Today should present every unfinished feeding for the selected starter, not
  only the newest feeding. History should contain completed feedings. Before
  implementation, define “completed” explicitly; the current model does not
  establish whether completion is time-based, follows an observed peak, or is
  a deliberate user action. Do not infer this rule from elapsed time alone.
- Easier feeding-input controls are deferred until the core behavior and flow
  are correct. Optional aesthetic changes follow functional-flow validation
  rather than interrupting it.
