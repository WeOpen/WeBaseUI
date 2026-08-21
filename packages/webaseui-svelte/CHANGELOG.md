# Changelog

## 0.4.0

### Minor Changes

- 468da09: Include package license files, add native form-control props and Select form participation, and make Dialog, Card, and EmptyState actions explicitly actionable.
- 468da09: Add consumer-controlled numeric formatting callbacks to Accordion, Pagination,
  Progress, Slider, and Textarea. Existing visual defaults remain unchanged while
  localized consumers can use Intl.NumberFormat or domain-specific notation.

### Patch Changes

- c106ed6: Expand the public Lucide icon name set used by the documentation navigation,
  component contracts, status summaries, and theme controls.
- 468da09: Add a documented three-layer token contract for palette, semantic, and
  component values, then migrate form, choice, overlay, feedback, navigation,
  selection, and action styles to shared geometry and motion tokens without
  changing their rendered defaults. Accordion, Card, Divider, EmptyState,
  SectionHeader, and Skeleton presentation values use the same contract. Add an
  exact per-component declaration budget and separately audited media-query list
  so future hardcoded-value growth requires explicit review. Tighten the example
  brand theme's muted ink and hover brand colors so normal text combinations meet
  WCAG 2.2 contrast requirements.
- 468da09: Map semantic tokens to system colors in forced-colors mode so component
  surfaces, borders, focus rings, and state colors remain distinguishable. Make
  direction-sensitive component layout use logical properties, align Select and
  Tooltip floating content from the anchor's inherited direction, and reverse
  Tabs horizontal arrow semantics in RTL.
- 468da09: Unify Tabs and Accordion keyboard navigation through a tested internal roving
  focus helper, preserving wrapping and Home/End behavior while normalizing
  state against the latest dynamic collection.
- 468da09: Expose the EmptyState kicker as a localization prop and make long labels wrap
  inside alerts, empty states, tabs, form labels, links, and card actions. Mirror
  directional action icons and slider progress in RTL.
- 468da09: Make Select typeahead refine multi-character queries, cycle repeated-character
  matches, skip disabled options, and clean up its reset timer through a reusable
  internal controller.
- 468da09: Share manual-popover synchronization and collision-aware floating positioning
  between Select and Tooltip. Overlays now flip and shift within the visual
  viewport, follow nested scrolling and resize changes, keep Select trigger width,
  and retain a fixed-position fallback when the Popover API is unavailable.
- 468da09: Make Dialog body scroll locking safe for nested overlays, restore opener focus
  consistently across Chromium, Firefox, and WebKit, and reuse a shared,
  cleaned-up pointer-outside listener for Select dismissal.
- 468da09: Add a public minimum interactive target token, reduced-motion coverage for
  Field and Pagination, touch-safe hover behavior, and 24px hit areas for
  choice controls, sliders, navigation links, breadcrumbs, and card actions.
- Updated dependencies [468da09]
- Updated dependencies [468da09]
- Updated dependencies [468da09]
- Updated dependencies [468da09]
  - @webaseui/core@0.2.0

## 0.3.2

### Patch Changes

- Improve WeBaseTag small-text contrast in light and dark themes.

## 0.3.1

### Patch Changes

- Declare the package side-effect free so bundlers can tree-shake unused components, styles, and icon code from package-root imports.

## 0.3.0

### Minor Changes

- Add semantic `WeBaseLink` and `WeBaseTag` navigation primitives for application migrations.

## 0.2.0 - 2026-08-04

### Added

- Named `WeBase*Props` types for every component from the package root.
- Svelte 5 `Snippet` composition points for Alert, Card, and EmptyState.
- Root-element `class`, `style`, `data-*`, ARIA, and native event forwarding.
- A documented versioning and deprecation policy.

### Compatibility

All 0.1.0 string props, defaults, bindings, visual states, and interaction
behavior remain supported.

## 0.1.0 - 2026-08-04

- Initial workspace package containing 26 Svelte 5 components.
- Root-only component exports with generated type declarations.
