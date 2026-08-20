<script lang="ts">
  import { WeBaseIcon } from '@webaseui/svelte';
  import { components, groupOrder, type ComponentName } from '../data/reference.js';

  interface Props {
    selectedName: ComponentName;
    onNavigate: (path: string) => void;
  }

  let { selectedName, onNavigate }: Props = $props();
  let query = $state('');
  let expandedGroup = $state<(typeof groupOrder)[number]>(components.find(({ name }) => name === selectedName)?.group ?? 'Action');

  const filtered = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return components;
    return components.filter(({ searchText }) => searchText.includes(normalized));
  });

  $effect(() => {
    const component = components.find(({ name }) => name === selectedName);
    if (component) expandedGroup = component.group;
  });
</script>

<div class="mobile-component-select">
  <WeBaseIcon name="grid-2x2" size={22} />
  <label for="mobile-component">Choose a component</label>
  <select id="mobile-component" value={selectedName} onchange={(event) => {
    const component = components.find(({ name }) => name === event.currentTarget.value);
    if (component) onNavigate(`/components/${component.slug}`);
  }}>
    {#each components as component}<option value={component.name}>{component.name}</option>{/each}
  </select>
  <WeBaseIcon name="chevron-down" size={20} />
</div>

<aside class="reference-sidebar" aria-label="Component index">
  <label class="sidebar-search"><span class="visually-hidden">Filter components</span><WeBaseIcon name="search" size={18} /><input type="search" placeholder="Filter components" bind:value={query} /></label>
  <p class="sidebar-count">{filtered.length} components</p>
  <div class="sidebar-groups">
    {#each groupOrder as group}
      {@const groupComponents = filtered.filter((component) => component.group === group)}
      {#if groupComponents.length > 0}
        {@const groupOpen = expandedGroup === group || Boolean(query.trim())}
        <section class="sidebar-group">
          <button class="sidebar-group-trigger" type="button" aria-expanded={groupOpen} onclick={() => (expandedGroup = group)}>{group}<WeBaseIcon name={groupOpen ? 'chevron-down' : 'chevron-right'} size={14} /></button>
          {#if groupOpen}
            <div>
              {#each groupComponents as component}
                <a href={`/components/${component.slug}`} class:selected={selectedName === component.name} aria-current={selectedName === component.name ? 'page' : undefined} onclick={(event) => { event.preventDefault(); onNavigate(`/components/${component.slug}`); }}>{component.name}</a>
              {/each}
            </div>
          {/if}
        </section>
      {/if}
    {/each}
    {#if filtered.length === 0}<p class="sidebar-empty">No components match this filter.</p>{/if}
  </div>
</aside>
