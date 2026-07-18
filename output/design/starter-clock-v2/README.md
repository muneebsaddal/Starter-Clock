# Starter Clock - Cool Quiet design package

This revision replaces the warm amber/cream direction with cooler sage, slate, ink, and mist neutrals. Layouts have smaller hero regions, 24px screen margins, 50px primary actions, lighter typography, and clearer vertical rhythm.

## Files

- `00-design-system.svg` - color, type, spacing, and component reference
- `01-today-light.svg` - revised Today screen in light mode
- `02-log-feeding.svg` - faster, denser feeding entry with honest optional states
- `03-after-save.svg` - confirmation and next-step guidance
- `04-today-dark.svg` - revised Today screen in dark mode
- `../../pdf/starter-clock-v2-affinity.pdf` - five-page Affinity-ready presentation
- `tokens.json` - implementation-ready design tokens
- `fonts/` - DM Sans variable and static instances plus the SIL Open Font License
- `previews/` - rendered PNG proofs used for visual QA

## Affinity workflow

1. Install `fonts/DMSans-Variable.ttf` before opening the source files.
2. Open the PDF in Affinity Designer for a complete five-page document, or open an individual SVG for a single editable screen.
3. Keep imported text as text when Affinity asks. Named SVG groups preserve the main layout sections.

## Typography decision

DM Sans was selected from the supplied shortlist. It has softer geometry than Montserrat, less product-brand specificity than SF Pro or Geist, broader practical availability than Axiforma, and better long-form UI suitability than Unbounded. Most interface text uses Regular or Medium; Semibold is reserved for titles and actions.
