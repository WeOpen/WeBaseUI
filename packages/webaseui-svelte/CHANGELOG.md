# Changelog

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
