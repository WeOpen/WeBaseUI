# XueUI Svelte

Svelte 5 components for XueUI.

```svelte
<script>
  import '@xueui/core/theme.css';
  import { XueButton } from '@xueui/svelte';
</script>

<XueButton label="Save" />
```

## Public API

All components and their inferred Props types are exported from the package
root. Deep imports are unsupported.

```ts
import type { XueButtonProps, XueCardProps } from '@xueui/svelte';
```

Every component forwards `class`, `style`, `data-*`, ARIA attributes, and native
event handlers to its root element. XueAlert, XueCard, and XueEmptyState also
accept Svelte 5 snippets while preserving their string-based convenience props.

```svelte
<XueCard title="Field note" data-entry-id="note-42" class="featured">
  <p>Custom card content.</p>

  {#snippet footer()}
    <a href="/archive">Open archive</a>
  {/snippet}
</XueCard>
```

See [VERSIONING.md](./VERSIONING.md) for compatibility and deprecation rules.
