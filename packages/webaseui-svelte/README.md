# WeBaseUI Svelte

Svelte 5.20+ components for WeBaseUI.

```svelte
<script>
  import '@webaseui/core/theme.css';
  import { WeBaseButton } from '@webaseui/svelte';
</script>

<WeBaseButton label="Save" />
```

## Public API

The versioned state, event, composition, native attribute, and boundary rules
for every component are documented in [API_CONTRACT.md](./API_CONTRACT.md).

All components and their inferred Props types are exported from the package
root. Deep imports are unsupported.

```ts
import type { WeBaseButtonProps, WeBaseCardProps, WeBaseLinkProps } from '@webaseui/svelte';
```

Components forward `class`, `style`, `data-*`, and ARIA attributes to their root
element; native event handlers are forwarded unless they are documented as action
callbacks. WeBaseAlert, WeBaseCard, and WeBaseEmptyState also
accept Svelte 5 snippets while preserving their string-based convenience props.
Form controls preserve that root contract and expose `inputProps`, `textareaProps`,
or `selectProps` for native names, form association, validation, autocomplete, and
control-level event handlers. Dialog and Card actions use `onconfirm`, `oncancel`,
and `onaction`, while EmptyState uses `onclick`; actions without a handler are not
rendered as enabled inert buttons.

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

## Localization and direction

Components inherit `dir` from the document or their nearest ancestor. Visible
copy and accessible labels can be replaced through component props. Numeric
presentation remains consumer-owned through formatting callbacks, so the same
component can use the application's locale without changing its numeric state.

```svelte
<script lang="ts">
  import { WeBasePagination, WeBaseProgress } from '@webaseui/svelte';

  const number = new Intl.NumberFormat('ar-EG', { useGrouping: false });
  let page = 2;
</script>

<div dir="rtl">
  <WeBasePagination
    total={4}
    bind:page
    label="تنقل الصفحات"
    previousLabel="الصفحة السابقة"
    nextLabel="الصفحة التالية"
    getPageLabel={(value) => `الصفحة ${number.format(value)}`}
    formatPage={(value) => number.format(value)}
  />
  <WeBaseProgress
    label="اكتمال الترحيل"
    value={62}
    formatValue={(value) => `${number.format(value)} بالمئة`}
  />
</div>
```
