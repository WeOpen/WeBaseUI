<script lang="ts">
  import { WeBaseIcon, WeBaseIconButton } from '@webaseui/svelte';
  import { components, inlineParts } from '../data/reference.js';

  interface Props {
    open: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
  }

  let { open, onClose, onNavigate }: Props = $props();
  let dialog = $state<HTMLDialogElement>();
  let input = $state<HTMLInputElement>();
  let query = $state('');

  const results = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return components.slice(0, 8);
    return components.filter(({ searchText }) => searchText.includes(normalized)).slice(0, 12);
  });

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      query = '';
      dialog.showModal();
      requestAnimationFrame(() => input?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  function choose(slug: string) {
    onClose();
    onNavigate(`/components/${slug}`);
  }
</script>

<dialog
  class="search-dialog"
  bind:this={dialog}
  aria-labelledby="search-heading"
  onclose={onClose}
  onkeydown={(event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    onClose();
  }}
  onclick={(event) => { if (event.target === dialog) onClose(); }}
>
  <div class="search-panel">
    <header>
      <div>
        <p>Global search</p>
        <h2 id="search-heading">Search the public contract</h2>
      </div>
      <WeBaseIconButton label="Close search" icon="x" onclick={onClose} />
    </header>

    <label class="search-input">
      <span class="visually-hidden">Search components and API fields</span>
      <WeBaseIcon name="search" size={20} />
      <input bind:this={input} type="search" placeholder="Try dialog, binding, or form" bind:value={query} />
      <kbd>Esc</kbd>
    </label>

    <div class="search-results" aria-live="polite">
      <p>{query ? `${results.length} matches` : 'Browse components'}</p>
      {#if results.length > 0}
        <ul>
          {#each results as component}
            <li>
              <button type="button" onclick={() => choose(component.slug)}>
                <span><strong>{component.name}</strong><small>{component.group}</small></span>
                <span>{#each inlineParts(component.summary) as part}{#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}{/each}</span>
                <WeBaseIcon name="arrow-right" size={16} />
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="search-empty">
          <WeBaseIcon name="archive-x" size={24} />
          <strong>No contract found</strong>
          <span>Try a component name, prop, binding, or behavior.</span>
        </div>
      {/if}
    </div>
  </div>
</dialog>
