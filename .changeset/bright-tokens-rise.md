---
"@webaseui/core": minor
"@webaseui/svelte": patch
---

Add a documented three-layer token contract for palette, semantic, and
component values, then migrate form, choice, overlay, feedback, navigation,
selection, and action styles to shared geometry and motion tokens without
changing their rendered defaults. Accordion, Card, Divider, EmptyState,
SectionHeader, and Skeleton presentation values use the same contract. Add an
exact per-component declaration budget and separately audited media-query list
so future hardcoded-value growth requires explicit review. Tighten the example
brand theme's muted ink and hover brand colors so normal text combinations meet
WCAG 2.2 contrast requirements.
