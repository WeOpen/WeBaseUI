<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> { items: string[]; active?: number; panels?: string[]; label?: string; id?: string; }
  const uid = $props.id();
  let { items, active = $bindable(0), panels = [], label = 'Example tabs', id = uid, class: className = '', ...rest }: Props = $props();
  let root: HTMLDivElement;

  function handleKeydown(event: KeyboardEvent, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowRight' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    active = next;
    root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
</script>

<div class={`ds-tabs ${className}`} bind:this={root} {...rest}>
  <div class="ds-tab-list" role="tablist" aria-label={label}>
    {#each items as item, index (index)}
      <button type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabindex={active === index ? 0 : -1} class:active={active === index} onclick={() => (active = index)} onkeydown={(event) => handleKeydown(event, index)}>{item}</button>
    {/each}
  </div>
  <!-- Every panel stays mounted so each tab's aria-controls resolves to a real element. -->
  {#each items as item, index (index)}
    <div class="ds-tab-panel" id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabindex="0" hidden={active !== index}>{panels[index] ?? 'Showing'} <strong>{item}</strong>{panels[index] ? '' : ' specimen.'}</div>
  {/each}
</div>

<style>
  .ds-tabs { display: grid; gap: 14px; }
  .ds-tab-list { display: flex; flex-wrap: wrap; gap: 4px; border-bottom: 1px solid var(--hairline-strong); }
  .ds-tab-list button { min-height: 42px; padding: 0 12px; border: 0; border-bottom: 2px solid transparent; color: var(--ink-muted); background: transparent; cursor: pointer; font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-tab-list button:hover, .ds-tab-list button.active { border-bottom-color: var(--brand); color: var(--brand); }
  .ds-tab-list button:focus-visible, .ds-tab-panel:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-tab-panel { padding: 18px; border: 1px solid var(--hairline); background: var(--surface); color: var(--ink-muted); font-size: 15px; }
  .ds-tab-panel[hidden] { display: none; }
  .ds-tab-panel strong { color: var(--brand); font-family: var(--font); font-weight: 600; }
</style>
