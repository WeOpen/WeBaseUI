# WeBaseUI Core

Framework-neutral design tokens and light/dark themes for WeBaseUI. The public
token contract is intentionally layered so themes can change without copying
component CSS.

```css
@import '@webaseui/core/theme.css';
```

Set `data-theme="dark"` on the document root to select the dark theme. Public
custom properties use the `--webase-*` namespace.

## Token layers

`tokens.css` provides three layers:

- **Primitives**: palette slots, spacing, sizes, typography, z-index, and
  motion values such as `--webase-space-8`, `--webase-size-control-lg`, and
  the WCAG 2.2 minimum target `--webase-size-target-min`.
- **Semantics**: roles consumed by applications, such as
  `--webase-color-surface`, `--webase-color-ink`,
  `--webase-color-brand`, and `--webase-interactive-target-min`.
- **Components**: reusable geometry and layering, such as
  `--webase-component-control-height`,
  `--webase-component-button-height`, and
  `--webase-component-dialog-width`.

The component layer also covers shared focus shadows, visually hidden native
controls, helper text, feedback geometry, navigation controls, motion offsets,
and overlay presentation. Representative extension points include:

| Token family | Default role |
| --- | --- |
| `--webase-component-control-*` | Field geometry, help text, and focus feedback |
| `--webase-component-choice-*` | Check, radio, and switch spacing |
| `--webase-component-select-*` | Trigger, menu, option, and open-state motion |
| `--webase-component-overlay-*` | Shared layer order and viewport collision padding |
| `--webase-component-dialog-*` | Modal width, spacing, shadow, and entrance motion |
| `--webase-component-alert-*` | Feedback spacing, icon, and dismiss control |
| `--webase-component-toast-*` | Live-region width, spacing, and entrance motion |
| `--webase-component-accordion-*` | Disclosure trigger, indentation, and open motion |
| `--webase-component-card-*` | Editorial card geometry, shadow, and hover offset |
| `--webase-component-empty-*` | Empty-state canvas, mark, and title rhythm |
| `--webase-component-section-header-*` | Fluid section heading scale and measure |
| `--webase-component-skeleton-*` | Placeholder geometry and shimmer motion |

Primitive typography now includes `--webase-font-size-overline: 10px`,
`--webase-line-height-help: 1.4`, and shared metadata/kicker tracking. These
defaults preserve the original rendered values while giving themes a single
override point.

Override semantic or component tokens for a brand theme:

```css
:root[data-theme='brand'] {
  --webase-color-brand: #315c52;
  --webase-color-brand-light: #477665;
  --webase-color-brand-tint: #e7f0ec;
}
```

An executable version of this example is available as
`@webaseui/core/brand-theme.css`.

The existing short aliases (`--brand`, `--surface`, `--focus-ring`, and
related names) remain compatibility mappings. New code should prefer the
namespaced tokens.

The complete layering decision is recorded in
[`docs/adr/0001-token-layers.md`](../../docs/adr/0001-token-layers.md).
Component source literal usage is tracked by
[`docs/component-style-literal-baseline.json`](../../docs/component-style-literal-baseline.json)
and validated by `npm run check:tokens`. Component declarations currently have
no direct signed `px`, `em`, `rem`, `ms`, `s`, or `deg` literals. The three
responsive pixel breakpoints are tracked separately because custom properties
cannot be used in media-query conditions. Any change requires an explicit
baseline review.

`npm run check:contrast` resolves semantic colors for the light, dark, and
example brand themes. It enforces WCAG 2.2 contrast for normal text and the
separate non-text threshold for status icons and control boundaries.
