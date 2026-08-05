# WeBaseUI Svelte

Svelte 5 components for WeBaseUI.

```svelte
<script>
  import '@webaseui/core/theme.css';
  import { WeBaseButton } from '@webaseui/svelte';
</script>

<WeBaseButton label="Save" />
```

## Public API

All components and their inferred Props types are exported from the package
root. Deep imports are unsupported.

```ts
import type { WeBaseButtonProps, WeBaseCardProps, WeBaseLinkProps } from '@webaseui/svelte';
```

Every component forwards `class`, `style`, `data-*`, ARIA attributes, and native
event handlers to its root element. WeBaseAlert, WeBaseCard, and WeBaseEmptyState also
accept Svelte 5 snippets while preserving their string-based convenience props.

```svelte
<WeBaseCard title="Field note" data-entry-id="note-42" class="featured">
  <p>Custom card content.</p>

  {#snippet footer()}
    <a href="/archive">Open archive</a>
  {/snippet}
</WeBaseCard>
```

See [VERSIONING.md](./VERSIONING.md) for compatibility and deprecation rules.

Navigation primitives preserve anchor semantics instead of styling links as buttons:

```svelte
<WeBaseLink href="/archive" label="Back to archive" variant="back" />
<WeBaseTag href="/blog/tags/design" label="Design" count={4} />
```
