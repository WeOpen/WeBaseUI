# Changelog

## 0.2.0

### Minor Changes

- 468da09: Add a documented three-layer token contract for palette, semantic, and
  component values, then migrate form, choice, overlay, feedback, navigation,
  selection, and action styles to shared geometry and motion tokens without
  changing their rendered defaults. Accordion, Card, Divider, EmptyState,
  SectionHeader, and Skeleton presentation values use the same contract. Add an
  exact per-component declaration budget and separately audited media-query list
  so future hardcoded-value growth requires explicit review. Tighten the example
  brand theme's muted ink and hover brand colors so normal text combinations meet
  WCAG 2.2 contrast requirements.
- 468da09: Add a public minimum interactive target token, reduced-motion coverage for
  Field and Pagination, touch-safe hover behavior, and 24px hit areas for
  choice controls, sliders, navigation links, breadcrumbs, and card actions.

### Patch Changes

- 468da09: Include package license files, add native form-control props and Select form participation, and make Dialog, Card, and EmptyState actions explicitly actionable.
- 468da09: Map semantic tokens to system colors in forced-colors mode so component
  surfaces, borders, focus rings, and state colors remain distinguishable. Make
  direction-sensitive component layout use logical properties, align Select and
  Tooltip floating content from the anchor's inherited direction, and reverse
  Tabs horizontal arrow semantics in RTL.

All notable changes to `@webaseui/core` are documented here.

## 0.1.0 - 2026-08-16

- Initial public release of the framework-neutral WeBaseUI tokens and themes.
- Added light, dark, forced-colors, and brand-theme CSS entry points.
