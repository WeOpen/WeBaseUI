<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import WeBaseIcon from './WeBaseIcon.svelte';

  interface Item { title: string; content: string; }
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> { items: Item[]; open?: number; id?: string; }

  const uid = $props.id();
  let { items, open = $bindable(0), id = uid, class: className = '', ...rest }: Props = $props();
  let root: HTMLDivElement;

  function toggle(index: number) {
    open = open === index ? -1 : index;
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = root.querySelectorAll<HTMLButtonElement>('.ds-accordion-trigger');
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowDown' ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }
</script>

<div class={`ds-accordion ${className}`} bind:this={root} {...rest}>
  {#each items as item, index (index)}
    <section class:open={open === index}>
      <h3>
        <button
          class="ds-accordion-trigger"
          type="button"
          id={`${id}-trigger-${index}`}
          aria-expanded={open === index}
          aria-controls={`${id}-panel-${index}`}
          onclick={() => toggle(index)}
          onkeydown={(event) => handleKeydown(event, index)}
        >
          <span><small>{String(index + 1).padStart(2, '0')}</small>{item.title}</span>
          <WeBaseIcon name="chevron-down" size={18} strokeWidth={1.6} />
        </button>
      </h3>
      <!-- Panels stay mounted so each trigger's aria-controls resolves to a real element. -->
      <div class="ds-accordion-panel" id={`${id}-panel-${index}`} role="region" aria-labelledby={`${id}-trigger-${index}`} hidden={open !== index}>
        <p>{item.content}</p>
      </div>
    </section>
  {/each}
</div>

<style>
  .ds-accordion { border-top: 1px solid var(--hairline-strong); }
  section { border-bottom: 1px solid var(--hairline-strong); }
  h3 { margin: 0; }
  .ds-accordion-trigger { display: flex; width: 100%; min-height: 58px; align-items: center; justify-content: space-between; gap: 18px; padding: 0 4px; border: 0; color: var(--ink); background: transparent; cursor: pointer; font-family: var(--font); font-size: 18px; text-align: left; }
  .ds-accordion-trigger > span { display: flex; align-items: center; gap: 16px; }
  small { color: var(--brand); font-family: var(--mono); font-size: 9px; letter-spacing: .1em; }
  .ds-accordion-trigger :global(svg) { flex: none; color: var(--brand); transition: transform var(--duration-ui) var(--ease-out); }
  section.open .ds-accordion-trigger :global(svg) { transform: rotate(180deg); }
  .ds-accordion-trigger:hover { color: var(--brand); }
  .ds-accordion-trigger:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-accordion-panel { padding: 0 44px 20px; animation: ds-accordion-in var(--duration-ui) var(--ease-out) both; }
  .ds-accordion-panel[hidden] { display: none; }
  p { max-width: 58ch; margin: 0; color: var(--ink-muted); font-size: 14px; line-height: 1.55; }
  @keyframes ds-accordion-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-accordion-trigger :global(svg), .ds-accordion-panel { animation: none; transition: none; } }
</style>
