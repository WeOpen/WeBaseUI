<script lang="ts">
  import { WeBaseIcon } from '@webaseui/svelte';
  import { components, groupOrder, packageVersion } from '../data/reference.js';

  interface Props {
    onNavigate: (path: string) => void;
  }

  let { onNavigate }: Props = $props();
  let query = $state('');
  const filtered = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return components;
    return components.filter(({ searchText }) => searchText.includes(normalized));
  });
</script>

<section class="components-index" aria-labelledby="components-title" data-route-focus tabindex="-1">
  <header class="components-index-heading">
    <div>
      <p class="section-label">Public reference</p>
      <h1 id="components-title">Components.</h1>
      <p>Browse the complete Svelte surface, then open a specimen to inspect its public contract, usage, and behavior.</p>
    </div>
    <span class="reference-version">v{packageVersion}</span>
  </header>

  <label class="components-index-search">
    <span class="visually-hidden">Filter components</span>
    <WeBaseIcon name="search" size={18} />
    <input type="search" placeholder="Filter by name, group, or API field" bind:value={query} />
    <span>{filtered.length} / {components.length}</span>
  </label>

  {#if filtered.length > 0}
    <div class="components-index-groups">
      {#each groupOrder as group}
        {@const groupComponents = filtered.filter((component) => component.group === group)}
        {#if groupComponents.length > 0}
          <section class="components-index-group" aria-labelledby={`group-${group}`}>
            <header><h2 id={`group-${group}`}>{group}</h2><span>{groupComponents.length.toString().padStart(2, '0')}</span></header>
            <div class="components-index-list">
              {#each groupComponents as component}
                <a class="component-index-item" href={`/components/${component.slug}`} onclick={(event) => { event.preventDefault(); onNavigate(`/components/${component.slug}`); }}>
                  <span><strong>{component.shortName}</strong><small>{component.name}</small></span>
                  <span>{component.summary}</span>
                  <WeBaseIcon name="arrow-up-right" size={18} />
                </a>
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="components-index-empty"><WeBaseIcon name="archive-x" size={24} /><strong>No components match this filter</strong><span>Try a component name, prop, binding, or behavior.</span></div>
  {/if}
</section>
