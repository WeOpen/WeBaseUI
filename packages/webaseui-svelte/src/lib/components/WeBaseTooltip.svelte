<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'id'> { label: string; text: string; id?: string; }
  const uid = $props.id();
  let { label, text, id = uid, class: className = '', ...rest }: Props = $props();

  // WCAG 1.4.13 requires hover/focus content to be dismissible without moving
  // the pointer or losing focus. The flag resets once attention leaves.
  let dismissed = $state(false);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || dismissed) return;
    event.stopPropagation();
    dismissed = true;
  }
</script>

<span class={`ds-tooltip-wrap ${className}`} class:is-dismissed={dismissed} {...rest}>
  <button
    type="button"
    aria-describedby={id}
    onkeydown={handleKeydown}
    onmouseleave={() => (dismissed = false)}
    onblur={() => (dismissed = false)}
  >{label}</button>
  <span {id} role="tooltip">{text}</span>
</span>

<style>
  .ds-tooltip-wrap { position: relative; display: inline-flex; }
  button { min-height: 40px; padding: 0 12px; border: 1px dashed var(--brand); color: var(--brand); background: transparent; cursor: pointer; font-family: var(--mono); font-size: 11px; }
  [role='tooltip'] { position: absolute; bottom: calc(100% + 10px); left: 50%; z-index: 2; width: max-content; max-width: 220px; padding: 8px 10px; border: 1px solid var(--brand); color: var(--paper); background: var(--brand); font-size: 12px; line-height: 1.35; opacity: 0; pointer-events: none; transform: translate(-50%, 4px); transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  .ds-tooltip-wrap:hover [role='tooltip'], .ds-tooltip-wrap:focus-within [role='tooltip'] { opacity: 1; transform: translate(-50%, 0); }
  .ds-tooltip-wrap.is-dismissed [role='tooltip'] { opacity: 0; transform: translate(-50%, 4px); }
  button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  @media (prefers-reduced-motion: reduce) { [role='tooltip'] { transition: none; } }
</style>
