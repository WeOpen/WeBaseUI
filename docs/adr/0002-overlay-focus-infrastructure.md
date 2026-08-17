# ADR 0002: Platform-first internal overlay and focus infrastructure

- Status: Accepted
- Date: 2026-08-08
- Scope: `@webaseui/svelte` overlay components and future framework bindings

## Context

Dialog, Select, and Tooltip already implement related behavior: dismissal,
focus handling, body scroll locking, and layer ordering. Keeping these concerns
inside each component would make Menu, Popover, Combobox, and Drawer repeat the
same edge cases. Publishing a headless primitive API now would also freeze an
abstraction before existing components have proved it.

## Decision

WeBaseUI will build a small internal overlay layer and adopt it incrementally:

1. Modal dialogs continue to use the native `<dialog>` top layer for focus
   trapping, Escape handling, background inertness, and focus restoration.
2. Body scroll locking is reference counted per document. Nested overlays do
   not restore scrolling until the final lock releases, and the consumer's
   previous inline overflow value is preserved.
3. Pointer-outside listening is shared. Components still decide whether an
   outside action is cancellable and which callback it represents.
4. Non-modal overlays remain anchored in their component DOM and use
   `popover="manual"` as a platform-first top-layer mechanism when supported.
   A shared fixed-position collision primitive supplies the fallback and keeps
   the DOM ancestry intact; components must not create one-off document-body
   portals.
5. Layer ordering stays in `@webaseui/core` component tokens. Native dialog top
   layer behavior is not emulated with an arbitrarily larger z-index.
6. Floating placement prefers the requested side, flips when the opposite side
   has more room, shifts inside the visual viewport, matches Select trigger
   width, constrains available height, and auto-updates on scroll, resize,
   visual viewport changes, and anchor/floating `ResizeObserver` events.
7. Inline `start` and `end` placement resolve from the anchor's computed
   direction. RTL support is inherited from the DOM rather than duplicated as
   component props, and logical alignment remains collision constrained.
8. Internal helpers are not exported from the package root. Public exposure is
   deferred until Dialog, Select, Tooltip, and at least one new overlay all use
   the same contracts without component-specific escape hatches.

Focus Scope, explicit focus restoration, Portal, and Presence remain planned
internal primitives. They should be added only when an existing component needs
them and can supply browser tests for the behavior.

## Consequences

- Dialog scroll locking now behaves correctly when overlays are nested.
- Select uses the same pointer-outside registration and short-lived typeahead
  contracts future overlays and composite widgets can reuse.
- Select and Tooltip now share manual-popover synchronization and floating
  collision behavior, including visual viewport offsets and nested scroll
  containers. Their inline alignment follows the anchor's inherited direction.
  Browsers without the Popover API use the same DOM with a fixed fallback rather
  than losing theme inheritance.
- SSR remains safe because the helpers access documents only when called after
  component mounting or dialog creation.
- Future overlay work has a defined migration order without committing 1.0 to
  an unproven low-level public API.

## Alternatives considered

- **Adopt a third-party headless library immediately**: deferred because the
  current native dialog behavior is strong, and dependency/API cost should be
  justified by collision positioning or composite widgets we cannot maintain.
- **Portal every overlay to `document.body`**: rejected because it complicates
  theming, SSR, containment, and nested ownership before positioning needs are
  proven.
- **Keep utilities component-local**: rejected because nested scroll locks and
  pointer-outside cleanup are cross-component invariants, not visual details.
