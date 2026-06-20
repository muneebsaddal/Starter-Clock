# Starter Clock UX Flow

**Status:** Constraints only; core flow deferred to T004
**Last updated:** 2026-06-21

This document is the canonical owner of screens, user flows, interaction
states, and accessibility decisions.

## Experience Principles

- Answer “when will it peak?” immediately.
- Make a feeding loggable in under 15 seconds.
- Use plain language and progressive disclosure.
- Be calm, tactile, legible, and distinctive rather than dashboard-heavy.
- Respect native behavior while maintaining one product identity.
- Support light and dark appearance, accessible contrast and touch targets,
  small Android screens, and current iPhone sizes.

## Candidate Core Flow

```text
First launch -> Create starter -> Log feeding -> View peak window ->
Optionally schedule reminder -> Record observed peak -> Review history
```

This is a design hypothesis. T004 must validate it against T002 research and
T003 requirements, then specify navigation, fields, progressive disclosure,
editing, deletion, and recovery behavior.

## Required States for T004

T004 must cover empty, loading, error, permission-denied, offline, missing
input, first-use, free-limit, and Pro-entitlement states. It must also define
how estimate uncertainty and influential inputs are explained without false
precision.
