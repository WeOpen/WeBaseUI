<script lang="ts">
  import { onMount } from 'svelte';
  import '@webaseui/core/theme.css';
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
    WeBaseTabs,
    WeBaseTag,
    WeBaseTextarea,
    WeBaseToast,
    WeBaseTooltip
  } from '@webaseui/svelte';

  const accordionItems = [
    { title: 'Server render', content: 'The disclosure content is present in the server response.' },
    { title: 'Client hydrate', content: 'The same component tree becomes interactive on the client.' }
  ];
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'SSR fixture' }
  ];
  const selectOptions = [
    { label: 'Stable', value: 'stable' },
    { label: 'Preview', value: 'preview' }
  ];

  let clicks = $state(0);
  let checkValue = $state(true);
  let dialogOpen = $state(false);
  let fieldValue = $state('Server value');
  let iconPressed = $state(false);
  let pageValue = $state(2);
  let radioValue = $state('standard');
  let selectValue = $state('stable');
  let sliderValue = $state(40);
  let switchValue = $state(true);
  let tabValue = $state(0);
  let textareaValue = $state('Hydration keeps the initial text.');
  let toastOpen = $state(true);

  onMount(() => {
    document.documentElement.dataset.hydrated = 'true';
    return () => {
      delete document.documentElement.dataset.hydrated;
    };
  });
</script>

<main data-testid="ssr-root" data-server-rendered="true">
  <header>
    <WeBaseIcon name="sparkles" />
    <h1>SSR hydration fixture</h1>
    <WeBaseBadge label="28 components" />
  </header>

  <section data-component="WeBaseButton">
    <WeBaseButton label="Increment hydrated count" onclick={() => (clicks += 1)} />
    <output data-testid="hydration-count">{clicks}</output>
  </section>

  <section class="grid">
    <div data-component="WeBaseAccordion"><WeBaseAccordion items={accordionItems} /></div>
    <div data-component="WeBaseAlert"><WeBaseAlert title="Server rendered alert" message="This status survives hydration." /></div>
    <div data-component="WeBaseBreadcrumbs"><WeBaseBreadcrumbs items={breadcrumbs} /></div>
    <div data-component="WeBaseCard"><WeBaseCard title="Hydrated card" body="The article root is stable." /></div>
    <div data-component="WeBaseCheck"><WeBaseCheck label="Include fixture" bind:checked={checkValue} /></div>
    <div data-component="WeBaseDialog">
      <button type="button" onclick={() => (dialogOpen = true)}>Open SSR dialog</button>
      <WeBaseDialog bind:open={dialogOpen} title="Hydrated dialog" />
    </div>
    <div data-component="WeBaseDivider"><WeBaseDivider label="SSR boundary" /></div>
    <div data-component="WeBaseEmptyState"><WeBaseEmptyState title="No hydration issues" /></div>
    <div data-component="WeBaseField"><WeBaseField label="Server field" bind:value={fieldValue} /></div>
    <div data-component="WeBaseIconButton"><WeBaseIconButton label="Bookmark fixture" icon="bookmark" bind:pressed={iconPressed} /></div>
    <div data-component="WeBaseLink"><WeBaseLink href="#ssr-root" label="Return to fixture" variant="back" /></div>
    <div data-component="WeBaseLoader"><WeBaseLoader label="Hydrating" /></div>
    <div data-component="WeBasePagination"><WeBasePagination total={4} bind:page={pageValue} /></div>
    <div data-component="WeBaseProgress"><WeBaseProgress value={64} label="Fixture progress" /></div>
    <div data-component="WeBaseRadio"><WeBaseRadio name="ssr-plan" label="Standard" value="standard" bind:selected={radioValue} /></div>
    <div data-component="WeBaseSectionHeader"><WeBaseSectionHeader kicker="Contract" title="Stable markup" note="Server and client use the same tree." /></div>
    <div data-component="WeBaseSelect"><WeBaseSelect label="Release channel" options={selectOptions} bind:value={selectValue} /></div>
    <div data-component="WeBaseSkeleton"><WeBaseSkeleton rows={2} /></div>
    <div data-component="WeBaseSlider"><WeBaseSlider label="Coverage" bind:value={sliderValue} /></div>
    <div data-component="WeBaseSwitch"><WeBaseSwitch label="Enable hydration" bind:checked={switchValue} /></div>
    <div data-component="WeBaseTabs"><WeBaseTabs items={['Server', 'Client']} panels={['Server panel', 'Client panel']} bind:active={tabValue} /></div>
    <div data-component="WeBaseTag"><WeBaseTag label="SSR" count={28} selected /></div>
    <div data-component="WeBaseTextarea"><WeBaseTextarea label="Hydration note" bind:value={textareaValue} /></div>
    <div data-component="WeBaseToast"><WeBaseToast bind:open={toastOpen} title="Hydrated" message="The live region was rendered on the server." /></div>
    <div data-component="WeBaseTooltip"><WeBaseTooltip label="SSR help" text="This description is available after hydration." /></div>
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) { margin: 0; color: var(--ink); background: var(--paper); font-family: var(--font); }
  main { display: grid; max-width: 1100px; gap: 24px; margin: 0 auto; padding: 32px 20px 80px; }
  header, section { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
  h1 { margin: 0; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
  .grid > div { min-width: 0; padding: 16px; border: 1px solid var(--hairline); }
  button { min-height: 40px; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
</style>
