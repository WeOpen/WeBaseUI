<script lang="ts">
  import {
    WeBaseAccordion,
    WeBaseAlert,
    WeBaseBadge,
    WeBaseBreadcrumbs,
    WeBaseButton,
    WeBaseCard,
    WeBaseCheck,
    WeBaseDialog,
    WeBaseDivider,
    WeBaseEmptyState,
    WeBaseField,
    WeBaseIcon,
    WeBaseIconButton,
    WeBaseLink,
    WeBaseLoader,
    WeBasePagination,
    WeBaseProgress,
    WeBaseRadio,
    WeBaseSectionHeader,
    WeBaseSelect,
    WeBaseSkeleton,
    WeBaseSlider,
    WeBaseSwitch,
    WeBaseTag,
    WeBaseTabs,
    WeBaseTextarea,
    WeBaseToast,
    WeBaseTooltip
  } from '@webaseui/svelte';
  import type { ComponentName } from './data/reference';

  interface Props {
    name: ComponentName;
  }

  let { name }: Props = $props();

  const accordionItems = [
    { title: 'Public contract', content: 'Props, bindings, callbacks, and boundaries stay visible.' },
    { title: 'Consumer surface', content: 'Examples import components from the package root.' },
    { title: 'Release gate', content: 'Cross-browser and accessibility checks run before publish.' }
  ];
  const breadcrumbItems = [
    { label: 'Docs', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Button' }
  ];
  const selectOptions = [
    { label: 'Stable', value: 'stable' },
    { label: 'Preview', value: 'preview' },
    { label: 'Archived', value: 'archived', disabled: true }
  ];

  let accordionOpen = $state(0);
  let alertOpen = $state(true);
  let cardActions = $state(0);
  let checked = $state(true);
  let indeterminate = $state(false);
  let dialogOpen = $state(false);
  let emptyActions = $state(0);
  let fieldValue = $state('Reference desk');
  let iconPressed = $state(false);
  let page = $state(2);
  let radioSelected = $state('stable');
  let selectValue = $state('stable');
  let sliderValue = $state(64);
  let switchChecked = $state(true);
  let tab = $state(0);
  let textareaValue = $state('Keep the public contract small, visible, and deliberate.');
  let toastOpen = $state(false);
</script>

<div class="component-preview" data-preview-component={name}>
  {#if name === 'WeBaseAccordion'}
    <WeBaseAccordion items={accordionItems} bind:open={accordionOpen} />
  {:else if name === 'WeBaseAlert'}
    {#if alertOpen}
      <WeBaseAlert title="Contract verified" message="The package boundary matches the published reference." tone="success" dismissible bind:open={alertOpen} />
    {:else}
      <WeBaseButton label="Show alert" variant="outline" icon="plus" onclick={() => (alertOpen = true)} />
    {/if}
  {:else if name === 'WeBaseBadge'}
    <div class="preview-row">
      <WeBaseBadge label="Stable" variant="canonical" dot />
      <WeBaseBadge label="One-off" variant="one-off" />
      <WeBaseBadge label="Experiment" variant="experiment" />
    </div>
  {:else if name === 'WeBaseBreadcrumbs'}
    <WeBaseBreadcrumbs items={breadcrumbItems} />
  {:else if name === 'WeBaseButton'}
    <div class="button-specimen-grid">
      <div><span>Primary</span><WeBaseButton label="Save changes" variant="ink" /></div>
      <div><span>Outline</span><WeBaseButton label="Cancel" variant="outline" /></div>
      <div><span>Disabled</span><WeBaseButton label="Not available" variant="outline" disabled /></div>
      <div><span>Loading</span><WeBaseButton label="Saving..." loadingLabel="Saving..." variant="ink" loading /></div>
      <div><span>Icon leading</span><WeBaseButton label="Download" variant="ink" icon="arrow-down" /></div>
    </div>
  {:else if name === 'WeBaseCard'}
    <div class="preview-card-width">
      <WeBaseCard eyebrow="Component" title="A portable surface" action="Run action" onaction={() => (cardActions += 1)}>
        <p>Children and footer remain owned by the consumer. Action count: {cardActions}.</p>
        {#snippet footer()}<small>Package root import</small>{/snippet}
      </WeBaseCard>
    </div>
  {:else if name === 'WeBaseCheck'}
    <div class="preview-stack">
      <WeBaseCheck label="Receive release notes" description="Published changes only." bind:checked />
      <WeBaseCheck label="Mixed selection" bind:checked bind:indeterminate />
      <WeBaseButton label="Toggle mixed state" variant="text" onclick={() => (indeterminate = !indeterminate)} />
    </div>
  {:else if name === 'WeBaseDialog'}
    <WeBaseButton label="Open dialog" variant="ink" onclick={() => (dialogOpen = true)} />
    <WeBaseDialog bind:open={dialogOpen} kicker="Reference dialog" title="Publish this contract?" message="Consumers will depend on the documented behavior." confirmLabel="Publish" />
  {:else if name === 'WeBaseDivider'}
    <div class="preview-stack">
      <WeBaseDivider label="Public exports" />
      <div class="vertical-divider-demo"><span>Core</span><WeBaseDivider vertical /><span>Svelte</span></div>
    </div>
  {:else if name === 'WeBaseEmptyState'}
    <WeBaseEmptyState title="No matching components" message="Clear the filter or choose another category." actionLabel="Clear filter" onclick={() => (emptyActions += 1)} />
    {#if emptyActions > 0}<p class="preview-note" role="status">Action received.</p>{/if}
  {:else if name === 'WeBaseField'}
    <div class="preview-field-width">
      <WeBaseField label="Specimen title" help="Visible labels remain concise." bind:value={fieldValue} />
    </div>
  {:else if name === 'WeBaseIcon'}
    <div class="icon-shelf" aria-label="Lucide icon examples">
      <span><WeBaseIcon name="archive" size={22} /><small>archive</small></span>
      <span><WeBaseIcon name="bookmark" size={22} /><small>bookmark</small></span>
      <span><WeBaseIcon name="search" size={22} /><small>search</small></span>
      <span><WeBaseIcon name="settings-2" size={22} /><small>settings-2</small></span>
      <span><WeBaseIcon name="sparkles" size={22} /><small>sparkles</small></span>
    </div>
  {:else if name === 'WeBaseIconButton'}
    <div class="preview-row">
      <WeBaseIconButton label="Bookmark component" icon="bookmark" bind:pressed={iconPressed} />
      <WeBaseIconButton label="Open settings" icon="settings-2" />
      <WeBaseIconButton label="Disabled action" icon="archive" disabled />
    </div>
  {:else if name === 'WeBaseLink'}
    <div class="preview-row">
      <WeBaseLink href="/components" label="Component index" variant="back" />
      <WeBaseLink href="/#install" label="Install" variant="action" />
      <WeBaseLink href="https://github.com/WeOpen/WeBaseUI" label="Source" variant="inline" />
    </div>
  {:else if name === 'WeBaseLoader'}
    <WeBaseLoader label="Checking contract" />
  {:else if name === 'WeBasePagination'}
    <WeBasePagination total={8} bind:page />
  {:else if name === 'WeBaseProgress'}
    <div class="preview-stack preview-field-width">
      <WeBaseProgress label="Contract coverage" value={72} />
      <WeBaseProgress label="Browser baseline" value={100} tone="success" compact />
    </div>
  {:else if name === 'WeBaseRadio'}
    <div class="preview-stack">
      <WeBaseRadio name="preview-channel" label="Stable channel" value="stable" description="Recommended for production." bind:selected={radioSelected} />
      <WeBaseRadio name="preview-channel" label="Preview channel" value="preview" description="Use for early validation." bind:selected={radioSelected} />
    </div>
  {:else if name === 'WeBaseSectionHeader'}
    <WeBaseSectionHeader kicker="Reference" title="Public components" note="A focused heading with an optional supporting note." />
  {:else if name === 'WeBaseSelect'}
    <div class="preview-field-width">
      <WeBaseSelect label="Release channel" options={selectOptions} help="Archived channels stay unavailable." bind:value={selectValue} />
    </div>
  {:else if name === 'WeBaseSkeleton'}
    <div class="preview-card-width"><WeBaseSkeleton rows={3} media label="Loading component reference" /></div>
  {:else if name === 'WeBaseSlider'}
    <div class="preview-field-width"><WeBaseSlider label="Interface density" bind:value={sliderValue} /></div>
  {:else if name === 'WeBaseSwitch'}
    <WeBaseSwitch label="Release notifications" description="Only meaningful package changes." bind:checked={switchChecked} />
  {:else if name === 'WeBaseTag'}
    <div class="preview-row">
      <WeBaseTag label="Navigation" count="05" selected />
      <WeBaseTag label="Feedback" count="06" variant="brand" />
      <WeBaseTag label="Overlay" href="/components" variant="outline" />
    </div>
  {:else if name === 'WeBaseTabs'}
    <WeBaseTabs items={['Contract', 'Behavior', 'Release']} panels={['Public props and bindings.', 'Documented interaction boundaries.', 'Versioned change policy.']} bind:active={tab} />
  {:else if name === 'WeBaseTextarea'}
    <div class="preview-field-width"><WeBaseTextarea label="Implementation notes" help="Keep the example consumer-owned." bind:value={textareaValue} /></div>
  {:else if name === 'WeBaseToast'}
    <div class="preview-stack">
      <WeBaseButton label="Show toast" variant="ink" onclick={() => (toastOpen = true)} />
      <WeBaseToast bind:open={toastOpen} title="Saved locally" message="The specimen is ready for review." />
    </div>
  {:else if name === 'WeBaseTooltip'}
    <div class="preview-row">
      <WeBaseTooltip label="Hover or focus" text="Escape dismisses the visible tooltip." />
      <WeBaseTooltip label="Keyboard ready" text="Focus and pointer behavior share one contract." />
    </div>
  {/if}
</div>

<style>
  .component-preview { min-width: 0; }
  .preview-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
  .button-specimen-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 22px 18px; }
  .button-specimen-grid > div { display: grid; gap: 9px; justify-items: start; }
  .button-specimen-grid > div > span { color: var(--ink-muted); font-family: var(--mono); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; }
  .preview-stack { display: grid; gap: 16px; }
  .preview-card-width { width: min(520px, 100%); }
  .preview-field-width { width: min(460px, 100%); }
  .preview-note { margin: 12px 0 0; color: var(--ink-muted); font-family: var(--mono); font-size: 10px; }
  .vertical-divider-demo { display: flex; min-height: 82px; align-items: center; gap: 18px; color: var(--ink-muted); font-family: var(--mono); font-size: 11px; text-transform: uppercase; }
  .icon-shelf { display: grid; grid-template-columns: repeat(5, minmax(82px, 1fr)); gap: 10px; }
  .icon-shelf > span { display: grid; min-height: 92px; place-items: center; align-content: center; gap: 10px; border: 1px solid var(--hairline); color: var(--brand); background: color-mix(in srgb, var(--brand-tint) 26%, var(--surface)); }
  .icon-shelf small { color: var(--ink-muted); font-family: var(--mono); font-size: 9px; }

  @media (max-width: 1100px) and (min-width: 681px) {
    .button-specimen-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 680px) {
    .button-specimen-grid { grid-template-columns: 1fr; }
    .button-specimen-grid > div { justify-items: stretch; text-align: center; }
    .button-specimen-grid > div :global(.ds-button) { width: 100%; justify-content: center; }
    .icon-shelf { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .icon-shelf > span:last-child { grid-column: 1 / -1; }
  }
</style>
