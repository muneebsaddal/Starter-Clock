# T004 interactive prototype

Open `index.html` through a local static server. This disposable prototype
tests information architecture and interaction decisions; it is not production
application code and does not define the T005 estimation formula.

Suggested command from the repository root:

```powershell
python -m http.server 4173 --directory docs/prototypes/t004
```

Use the scenario selector to inspect first use, missing-input uncertainty,
offline, permission-denied, storage-failure, free-limit, and loading states.
The normal task path is **Log feeding → leave the default reminder on → Save
feeding → inspect the peak window and scheduled reminder → Why this window?**.
The remembered reminder preference can be disabled before save; permission or
scheduling failure never blocks the feeding. Keyboard users can tab through
every action and press Escape to dismiss a sheet or dialog.
