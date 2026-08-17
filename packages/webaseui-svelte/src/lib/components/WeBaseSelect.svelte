<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLAttributes, HTMLSelectAttributes } from 'svelte/elements';
  import {
    autoUpdateFloatingPosition,
    positionFloatingElement,
    readCssPixel
  } from '../internal/floating-position.js';
  import { listenForPointerOutside } from '../internal/overlay.js';
  import { synchronizeManualPopover } from '../internal/popover.js';
  import { findSelectedOptionIndex } from '../internal/select-state.js';
  import { createTypeaheadController } from '../internal/typeahead.js';
  import type { WeBaseSelectOption } from '../types.js';
  import { findEnabledIndex as findEnabledCollectionIndex } from '../utils/collection.js';
  import WeBaseIcon from './WeBaseIcon.svelte';

  type NativeSelectProps = Omit<HTMLSelectAttributes, 'children' | 'disabled' | 'form' | 'id' | 'multiple' | 'name' | 'required' | 'size' | 'value'>;

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
    label: string;
    id?: string;
    options: WeBaseSelectOption[];
    value?: string;
    help?: string;
    error?: string;
    disabled?: boolean;
    name?: string;
    form?: string;
    required?: boolean;
    placeholder?: string;
    selectProps?: NativeSelectProps;
  }

  const uid = $props.id();
  let {
    label,
    id = uid,
    options,
    value = $bindable(options[0]?.value ?? ''),
    help = '',
    error = '',
    disabled = false,
    name,
    form,
    required = false,
    placeholder = 'Select an option',
    selectProps = {},
    class: className = '',
    ...rest
  }: Props = $props();

  let open = $state(false);
  let highlightedIndex = $state(0);
  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let menu: HTMLDivElement;
  let nativeSelect: HTMLSelectElement;
  const typeahead = createTypeaheadController<number>({
    setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    clearTimeout: (handle) => window.clearTimeout(handle)
  });

  const menuId = $derived(`${id}-menu`);
  const descriptionId = $derived(`${id}-${error ? 'error' : 'help'}`);

  function findEnabledIndex(start: number, direction: 1 | -1) {
    return findEnabledCollectionIndex(options, start, direction);
  }

  function selectedIndex() {
    return findSelectedOptionIndex(options, value);
  }

  function selectedOption() {
    return options.find((option) => option.value === value);
  }

  function openMenu(index = selectedIndex()) {
    if (disabled || !options.length) return;
    const nextIndex = options[index]?.disabled ? findEnabledIndex(index, 1) : index;
    if (nextIndex < 0) return;
    highlightedIndex = Math.min(Math.max(nextIndex, 0), options.length - 1);
    open = true;
  }

  function closeMenu(restoreFocus = false) {
    open = false;
    highlightedIndex = selectedIndex();
    if (restoreFocus) trigger?.focus();
  }

  function chooseOption(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    const changed = value !== option.value;
    value = option.value;
    highlightedIndex = index;
    closeMenu(true);
    if (changed && nativeSelect) {
      nativeSelect.value = option.value;
      nativeSelect.dispatchEvent(new Event('input', { bubbles: true }));
      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (disabled || !options.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu(open ? findEnabledIndex(highlightedIndex + 1, 1) : selectedIndex());
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(open ? findEnabledIndex(highlightedIndex - 1, -1) : selectedIndex());
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      highlightedIndex = findEnabledIndex(0, 1);
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      highlightedIndex = findEnabledIndex(options.length - 1, -1);
    } else if ((event.key === 'Enter' || event.key === ' ') && !open) {
      event.preventDefault();
      openMenu();
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      chooseOption(highlightedIndex);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === 'Tab' && open) {
      closeMenu();
    } else {
      const match = typeahead.search(
        options,
        open ? highlightedIndex : selectedIndex(),
        event.key,
        (option) => option.label,
        (option) => option.disabled === true
      );
      if (match !== undefined && match >= 0) openMenu(match);
    }
  }

  onMount(() => {
    const stopListeningForPointerOutside = listenForPointerOutside(root, () => {
      if (open) closeMenu();
    });
    return () => {
      typeahead.reset();
      stopListeningForPointerOutside();
    };
  });

  $effect(() => {
    if (!menu) return;
    synchronizeManualPopover(menu, open);
    if (!open || !trigger) return;

    return autoUpdateFloatingPosition(trigger, menu, () => {
      positionFloatingElement(trigger, menu, {
        side: 'bottom',
        align: 'start',
        offset: readCssPixel(menu, '--webase-component-select-menu-offset'),
        viewportPadding: readCssPixel(menu, '--webase-component-overlay-viewport-padding'),
        matchAnchorWidth: true,
        maxHeight: readCssPixel(menu, '--webase-component-select-menu-max-height')
      });
    });
  });
</script>

<div class={`ds-select ${className}`} bind:this={root} {...rest}>
  <span class="ds-select-label" id={`${id}-label`}>{label}</span>
  <select
    {...selectProps}
    bind:this={nativeSelect}
    class={`ds-select-native ${selectProps.class ?? ''}`}
    id={`${id}-native`}
    {name}
    {form}
    {required}
    {disabled}
    bind:value
    tabindex={-1}
    aria-hidden="true"
  >
    {#each options as option (option.value)}
      <option value={option.value} disabled={option.disabled}>{option.label}</option>
    {/each}
  </select>
  <button
    {id}
    bind:this={trigger}
    class="ds-select-trigger"
    class:is-open={open}
    type="button"
    role="combobox"
    aria-labelledby={`${id}-label`}
    aria-controls={menuId}
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error || help ? descriptionId : undefined}
    aria-activedescendant={open && highlightedIndex >= 0 ? `${menuId}-${highlightedIndex}` : undefined}
    {disabled}
    onclick={() => (open ? closeMenu() : openMenu())}
    onkeydown={handleKeydown}
  >
    <span class="ds-select-value">{selectedOption()?.label ?? placeholder}</span>
    <WeBaseIcon class="ds-select-chevron" name="chevron-down" size={18} strokeWidth={1.6} />
  </button>

  <!-- The listbox stays mounted so the trigger's aria-controls resolves while collapsed. -->
  <div
    bind:this={menu}
    class="ds-select-menu"
    id={menuId}
    role="listbox"
    aria-labelledby={`${id}-label`}
    popover="manual"
    hidden={!open}
  >
    {#each options as option, index (option.value)}
      <button
        id={`${menuId}-${index}`}
        class="ds-select-option"
        class:is-highlighted={highlightedIndex === index}
        class:is-selected={value === option.value}
        type="button"
        role="option"
        tabindex="-1"
        aria-selected={value === option.value}
        aria-disabled={option.disabled ? 'true' : undefined}
        disabled={option.disabled}
        onclick={() => chooseOption(index)}
        onmouseenter={() => { if (!option.disabled) highlightedIndex = index; }}
      >
        <span>{option.label}</span>
        {#if value === option.value}
          <WeBaseIcon class="ds-select-check" name="check" size={16} strokeWidth={1.8} />
        {/if}
      </button>
    {/each}
  </div>
  {#if error}<span class="ds-select-error" id={descriptionId}>{error}</span>{:else if help}<span class="ds-select-help" id={descriptionId}>{help}</span>{/if}
</div>

<style>
  .ds-select {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--webase-space-4);
    min-width: 0;
  }

  .ds-select-label {
    min-width: 0;
    color: var(--ink);
    font-family: var(--sans);
    font-size: var(--webase-font-size-label);
    letter-spacing: var(--webase-letter-spacing-label);
    overflow-wrap: anywhere;
    text-transform: uppercase;
  }

  .ds-select-native {
    position: absolute;
    top: var(--webase-component-button-height-sm);
    inset-inline-start: 0;
    width: var(--webase-component-visually-hidden-size);
    height: var(--webase-component-visually-hidden-size);
    opacity: 0;
    pointer-events: none;
  }

  .ds-select-native:focus + .ds-select-trigger {
    outline: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  .ds-select-trigger {
    position: relative;
    display: flex;
    width: 100%;
    min-height: var(--webase-component-control-height);
    align-items: center;
    justify-content: space-between;
    gap: var(--webase-space-6);
    padding-block: 0;
    padding-inline: var(--webase-component-control-padding-inline) var(--webase-component-select-trigger-padding-right);
    border: var(--webase-component-control-border-width) solid var(--hairline-strong);
    border-radius: var(--webase-component-control-radius);
    color: var(--ink);
    background: var(--surface);
    cursor: pointer;
    font-family: var(--font);
    font-size: var(--webase-component-control-font-size);
    text-align: start;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background-color var(--duration-ui) var(--ease-out),
      box-shadow var(--duration-ui) var(--ease-out);
  }

  .ds-select-trigger.is-open {
    border-color: var(--brand);
    background: color-mix(in srgb, var(--brand-tint) 36%, var(--surface));
  }

  .ds-select-trigger.is-open {
    box-shadow: var(--webase-component-control-focus-shadow-offset) var(--webase-component-control-focus-shadow-offset) 0 color-mix(in srgb, var(--brand) 16%, transparent);
  }

  .ds-select-trigger:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
  }

  .ds-select-trigger[aria-invalid='true'] { border-color: var(--status-error); box-shadow: var(--webase-component-control-focus-shadow-offset) var(--webase-component-control-focus-shadow-offset) 0 color-mix(in srgb, var(--status-error) 14%, transparent); }
  .ds-select-trigger:disabled { cursor: not-allowed; opacity: .55; }

  .ds-select-value {
    min-width: 0;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .ds-select-trigger :global(.ds-select-chevron) {
    position: absolute;
    top: 50%;
    inset-inline-end: var(--webase-component-control-padding-inline);
    color: var(--brand);
    pointer-events: none;
    transform: translateY(-50%);
    transition: transform var(--duration-ui) var(--ease-out), color var(--duration-fast) var(--ease-out);
  }

  .ds-select-trigger.is-open :global(.ds-select-chevron) {
    transform: translateY(-50%) rotate(var(--webase-component-select-chevron-open-rotation));
  }

  .ds-select-menu {
    position: fixed;
    inset: auto;
    z-index: var(--webase-component-overlay-z-index);
    display: grid;
    box-sizing: border-box;
    max-height: var(--webase-component-select-menu-max-height);
    overflow-y: auto;
    margin: 0;
    padding: var(--webase-component-select-menu-padding);
    border: var(--webase-component-control-border-width) solid var(--hairline-strong);
    background:
      var(--webase-component-select-menu-pattern-image)
        0 0 / var(--webase-component-select-menu-pattern-size) var(--webase-component-select-menu-pattern-size),
      var(--surface);
    box-shadow: var(--webase-component-select-menu-shadow-offset) var(--webase-component-select-menu-shadow-offset) 0 color-mix(in srgb, var(--brand) 15%, transparent), var(--whisper-shadow);
    transform-origin: top center;
    animation: ds-select-menu-in var(--duration-ui) var(--ease-out) both;
  }

  .ds-select-menu[data-side='top'] {
    transform-origin: bottom center;
    animation-name: ds-select-menu-in-top;
  }

  .ds-select-menu[hidden] {
    display: none;
  }

  .ds-select-option {
    display: flex;
    min-height: var(--webase-component-select-option-height);
    align-items: center;
    justify-content: space-between;
    gap: var(--webase-space-8);
    padding: 0 var(--webase-component-select-option-padding-inline);
    border: 0;
    color: var(--ink);
    background: transparent;
    cursor: pointer;
    font-family: var(--font);
    font-size: var(--webase-component-select-option-font-size);
    text-align: start;
    transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
  }

  .ds-select-option.is-highlighted {
    color: var(--brand);
    background: color-mix(in srgb, var(--brand-tint) 70%, transparent);
    transform: translateX(var(--webase-component-select-option-hover-offset));
  }

  .ds-select-option.is-selected {
    color: var(--brand);
  }

  :global([dir='rtl']) .ds-select-option.is-highlighted {
    transform: translateX(calc(var(--webase-component-select-option-hover-offset) * -1));
  }

  .ds-select-option :global(.ds-select-check) {
    flex: none;
    animation: ds-select-check-in var(--duration-fast) var(--ease-out) both;
  }

  .ds-select-help, .ds-select-error { color: var(--ink-muted); font-size: var(--webase-component-control-help-font-size); line-height: var(--webase-component-control-help-line-height); }
  .ds-select-error { color: var(--status-error); }

  @keyframes ds-select-menu-in {
    from { opacity: 0; transform: translateY(var(--webase-component-select-menu-enter-offset)) scaleY(.98); }
    to { opacity: 1; transform: translateY(0) scaleY(1); }
  }

  @keyframes ds-select-menu-in-top {
    from { opacity: 0; transform: translateY(calc(var(--webase-component-select-menu-enter-offset) * -1)) scaleY(.98); }
    to { opacity: 1; transform: translateY(0) scaleY(1); }
  }

  @keyframes ds-select-check-in {
    from { opacity: 0; transform: scale(.65) rotate(var(--webase-component-select-check-enter-rotation)); }
    to { opacity: 1; transform: scale(1) rotate(0); }
  }

  @media (hover: hover) and (pointer: fine) {
    .ds-select-trigger:hover { border-color: var(--brand); background: color-mix(in srgb, var(--brand-tint) 36%, var(--surface)); }
    .ds-select-option:hover { color: var(--brand); background: color-mix(in srgb, var(--brand-tint) 70%, transparent); transform: translateX(var(--webase-component-select-option-hover-offset)); }
    :global([dir='rtl']) .ds-select-option:hover { transform: translateX(calc(var(--webase-component-select-option-hover-offset) * -1)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-select-trigger,
    .ds-select-trigger :global(.ds-select-chevron),
    .ds-select-option,
    .ds-select-menu,
    .ds-select-option :global(.ds-select-check) { animation: none; transition: none; }
  }
</style>
