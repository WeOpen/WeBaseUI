# ADR 0001: Three-layer public token contract

- Status: Accepted
- Date: 2026-08-06
- Scope: `@webaseui/core` and all framework bindings

## Context

The core package already exposed color, typography, shadow, and motion custom
properties. They were useful, but their roles were mixed together. A consumer
could not tell whether a value was a raw palette choice, a semantic surface,
or a component geometry contract. Component styles also repeated control
heights, radii, and overlay layers in several files.

## Decision

`tokens.css` exposes three layers in one stable `--webase-*` namespace:

1. Primitive tokens contain palette slots, spacing, sizes, type scales, z-index
   levels, and motion values.
2. Semantic tokens map those values to roles such as canvas, surface, ink,
   border, brand, and status.
3. Component tokens define reusable geometry and layering for controls,
   buttons, choices, switches, selects, dialogs, tooltips, feedback, and
   navigation components.

Consumers should override semantic or component tokens. Primitive values are
available for advanced themes, but are not the preferred customization point.
The existing short aliases such as `--brand`, `--surface`, and `--focus-ring`
remain mapped to semantic tokens during the 1.x compatibility window.

Dark mode changes the primitive palette slots under
`:root[data-theme='dark']`; semantic and component relationships stay intact.
This keeps theme changes from requiring a second copy of component CSS.

The token contract is enforced with an exact component-style literal budget.
The checker counts signed `px`, `em`, `rem`, `ms`, `s`, and `deg` values in
public component declarations and compares them with
`docs/component-style-literal-baseline.json`. The current declaration count is
zero. Media-query conditions are extracted and checked separately; their three
pixel breakpoints remain explicit because custom properties cannot be used in
media-query conditions. Any change must update the baseline deliberately.

Not every one-off presentation value becomes a public token. Values are
promoted when they represent shared interaction geometry, themeable component
geometry, layering, typography, or motion. Unique editorial layout values can
remain local until another component or consumer demonstrates a shared need.
Responsive breakpoints remain a small, separately audited exception.

## Consequences

- New components can consume a named geometry token instead of inventing a
  one-off size or layer value.
- Brand themes can override semantic colors without copying component styles.
- The token checker validates required layers, references, and dark palette
  overrides, plus the exact component literal budget, as part of
  `npm run check`.
- Removing a compatibility alias is a breaking change and requires a
  Changeset plus a migration note.

## Alternatives considered

- **Separate files per layer**: rejected for now because a single import is a
  smaller consumer contract and preserves the current `theme.css` entrypoint.
- **Only semantic tokens**: rejected because spacing, type, and geometry need
  shared primitives to prevent drift.
- **Component-local variables only**: rejected because they cannot support
  cross-framework themes or a documented public override surface.
