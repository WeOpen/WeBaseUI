<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import {
    autoUpdateFloatingPosition,
    positionFloatingElement,
    readCssPixel
  } from '../internal/floating-position.js';
  import { synchronizeManualPopover } from '../internal/popover.js';

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'id'> { label: string; text: string; id?: string; }
  type SpanPointerEvent = PointerEvent & { currentTarget: EventTarget & HTMLSpanElement };
  type SpanFocusEvent = FocusEvent & { currentTarget: EventTarget & HTMLSpanElement };
  const uid = $props.id();
  let {
    label,
    text,
    id = uid,
    class: className = '',
    onpointerover,
    onpointerout,
    onfocusin,
    onfocusout,
    ...rest
  }: Props = $props();

  let root: HTMLSpanElement;
  let trigger: HTMLButtonElement;
  let tooltip: HTMLSpanElement;
  let pointerWithin = $state(false);
  let focusWithin = $state(false);
  let dismissed = $state(false);
  let visible = $derived((pointerWithin || focusWithin) && !dismissed);

  function dismiss(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !visible) return;
    event.stopPropagation();
    dismissed = true;
  }

  function resetDismissalIfInactive() {
    if (!pointerWithin && !focusWithin) dismissed = false;
  }

  function handlePointerOver(event: PointerEvent) {
    pointerWithin = true;
    onpointerover?.(event as SpanPointerEvent);
  }

  function handlePointerOut(event: PointerEvent) {
    onpointerout?.(event as SpanPointerEvent);
    if (root.contains(event.relatedTarget as Node | null)) return;
    pointerWithin = false;
    resetDismissalIfInactive();
  }

  function handleFocusIn(event: FocusEvent) {
    focusWithin = true;
    onfocusin?.(event as SpanFocusEvent);
  }

  function handleFocusOut(event: FocusEvent) {
    onfocusout?.(event as SpanFocusEvent);
    if (root.contains(event.relatedTarget as Node | null)) return;
    focusWithin = false;
    resetDismissalIfInactive();
  }

  $effect(() => {
    if (!tooltip) return;
    synchronizeManualPopover(tooltip, visible);
    if (!visible || !trigger) return;

    return autoUpdateFloatingPosition(trigger, tooltip, () => {
      positionFloatingElement(trigger, tooltip, {
        side: 'top',
        align: 'center',
        offset: readCssPixel(tooltip, '--webase-component-tooltip-offset'),
        viewportPadding: readCssPixel(tooltip, '--webase-component-overlay-viewport-padding'),
        maxWidth: readCssPixel(tooltip, '--webase-component-tooltip-max-width')
      });
    });
  });

  $effect(() => {
    if (!visible || !tooltip) return;
    const targetDocument = tooltip.ownerDocument;
    targetDocument.addEventListener('keydown', dismiss);
    return () => targetDocument.removeEventListener('keydown', dismiss);
  });
</script>

<span
  bind:this={root}
  class={`ds-tooltip-wrap ${className}`}
  class:is-open={visible}
  onpointerover={handlePointerOver}
  onpointerout={handlePointerOut}
  onfocusin={handleFocusIn}
  onfocusout={handleFocusOut}
  {...rest}
>
  <button
    bind:this={trigger}
    type="button"
    aria-describedby={visible ? id : undefined}
  >{label}</button>
  <span bind:this={tooltip} {id} role="tooltip" popover="manual" hidden={!visible}>{text}</span>
</span>

<style>
  .ds-tooltip-wrap { display: inline-flex; }
  button { min-height: var(--webase-size-control-md); padding: 0 var(--webase-space-6); border: var(--webase-component-control-border-width) dashed var(--brand); color: var(--brand); background: transparent; cursor: pointer; font-family: var(--mono); font-size: var(--webase-font-size-label); }
  [role='tooltip'] { position: fixed; inset: auto; z-index: var(--webase-component-tooltip-z-index); box-sizing: border-box; width: max-content; max-width: var(--webase-component-tooltip-max-width); max-height: none; overflow: auto; margin: 0; padding: var(--webase-component-tooltip-padding-block) var(--webase-component-tooltip-padding-inline); border: var(--webase-component-control-border-width) solid var(--brand); color: var(--paper); background: var(--brand); font-size: var(--webase-font-size-caption); line-height: var(--webase-line-height-meta); pointer-events: auto; transform-origin: bottom center; animation: ds-tooltip-in var(--duration-fast) var(--ease-out) both; }
  [role='tooltip'][data-side='bottom'] { transform-origin: top center; animation-name: ds-tooltip-in-bottom; }
  [role='tooltip'][hidden] { display: none; }
  button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  @keyframes ds-tooltip-in { from { opacity: 0; transform: translateY(var(--webase-component-tooltip-enter-offset)); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ds-tooltip-in-bottom { from { opacity: 0; transform: translateY(calc(var(--webase-component-tooltip-enter-offset) * -1)); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { [role='tooltip'] { animation: none; } }
</style>
