<script lang="ts">
  import {
    WeBaseAlert,
    WeBaseButton,
    WeBaseCheck,
    WeBaseField,
    WeBaseIconButton,
    WeBaseLink,
    WeBasePagination,
    WeBaseRadio,
    WeBaseSelect,
    WeBaseSlider,
    WeBaseSwitch,
    WeBaseTabs,
    WeBaseTag,
    WeBaseTextarea,
    WeBaseToast
  } from '@webaseui/svelte';

  const channels = [
    { label: 'Stable', value: 'stable' },
    { label: 'Preview', value: 'preview' }
  ];

  let errorSelect = $state('');
  let disabledSelect = $state('stable');
  let disabledSlider = $state(72);
  let disabledRadio = $state('stable');
  let navigationPage = $state(1);
  let navigationTab = $state(0);
</script>

<div class="visual-states" aria-label="Visual interaction state fixtures">
  <section data-testid="action-state-matrix" aria-labelledby="action-state-heading">
    <h2 id="action-state-heading">Action state matrix</h2>
    <div class="state-grid action-grid">
      <div class="state-cell"><span>Hover</span><WeBaseButton label="Hover action" variant="ink" icon="check" /></div>
      <div class="state-cell"><span>Disabled</span><WeBaseButton label="Disabled action" variant="outline" disabled /></div>
      <div class="state-cell"><span>Loading</span><WeBaseButton label="Loading action" loading loadingLabel="Loading" /></div>
      <div class="state-cell"><span>Pressed</span><WeBaseIconButton label="Pressed icon action" icon="bookmark" pressed /></div>
      <div class="state-cell"><span>Disabled icon</span><WeBaseIconButton label="Disabled icon action" icon="archive" disabled /></div>
    </div>
  </section>

  <section data-testid="form-error-state-matrix" aria-labelledby="form-error-heading">
    <h2 id="form-error-heading">Form error state matrix</h2>
    <div class="form-grid">
      <WeBaseField label="Project name" value="" error="Project name is required." />
      <WeBaseSelect label="Required channel" options={channels} bind:value={errorSelect} error="Choose a required channel." />
      <div class="wide"><WeBaseTextarea label="Release notes" value="Incomplete notes" error="Add a migration note before publishing." /></div>
    </div>
  </section>

  <section data-testid="form-disabled-state-matrix" aria-labelledby="form-disabled-heading">
    <h2 id="form-disabled-heading">Form disabled state matrix</h2>
    <div class="form-grid">
      <WeBaseField label="Locked project" value="Published contract" disabled />
      <WeBaseSelect label="Locked channel" options={channels} bind:value={disabledSelect} disabled />
      <WeBaseTextarea label="Locked notes" value="This release is immutable." disabled />
      <WeBaseSlider label="Locked coverage" bind:value={disabledSlider} disabled />
    </div>
  </section>

  <section data-testid="selection-disabled-state-matrix" aria-labelledby="selection-disabled-heading">
    <h2 id="selection-disabled-heading">Selection disabled state matrix</h2>
    <div class="selection-grid">
      <WeBaseCheck label="Release notes" description="Unavailable for archived releases." checked disabled />
      <WeBaseRadio name="disabled-channel" label="Stable channel" value="stable" bind:selected={disabledRadio} disabled />
      <WeBaseSwitch label="Automatic publish" description="Managed by release policy." checked disabled />
    </div>
  </section>

  <section data-testid="feedback-tone-state-matrix" aria-labelledby="feedback-tone-heading">
    <h2 id="feedback-tone-heading">Feedback tone state matrix</h2>
    <div class="feedback-grid">
      <WeBaseAlert title="Release blocked" message="Resolve the contract errors before publishing." tone="error" dismissible />
      <WeBaseAlert title="Review required" message="The package-size baseline changed." tone="warning" />
      <WeBaseToast open title="Publish failed" message="The registry rejected this release." tone="error" />
    </div>
  </section>

  <section data-testid="navigation-state-matrix" aria-labelledby="navigation-state-heading">
    <h2 id="navigation-state-heading">Navigation state matrix</h2>
    <div class="navigation-stack">
      <WeBasePagination total={4} bind:page={navigationPage} />
      <WeBaseTabs items={['Contract', 'Behavior', 'Release']} panels={['Contract panel', 'Behavior panel', 'Release panel']} bind:active={navigationTab} />
      <div class="navigation-row">
        <WeBaseLink href="#form-heading" label="Back to form" variant="action" />
        <WeBaseTag label="Selected filter" selected />
      </div>
    </div>
  </section>
</div>

<style>
  .visual-states { display: grid; gap: 32px; }
  section { display: grid; gap: 18px; padding: 24px; border: 1px solid var(--hairline-strong); background: var(--surface); }
  h2 { margin: 0; color: var(--ink); font-family: var(--font); font-size: 24px; font-weight: 500; }
  .state-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
  .state-cell { display: grid; min-width: 0; align-content: start; justify-items: start; gap: 10px; }
  .state-cell > span { color: var(--ink-muted); font-family: var(--mono); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
  .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
  .wide { grid-column: 1 / -1; }
  .selection-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; align-items: center; }
  .feedback-grid, .navigation-stack { display: grid; gap: 16px; }
  .navigation-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }

  @media (max-width: 760px) {
    .state-grid, .form-grid, .selection-grid { grid-template-columns: 1fr; }
    .wide { grid-column: auto; }
  }
</style>
