<script lang="ts">
  import '@webaseui/core/theme.css';
  import { WeBaseAlert, WeBaseButton, WeBaseCard } from '@webaseui/svelte';
  import type { WeBaseButtonProps } from '@webaseui/svelte';

  const action = {
    label: 'Save specimen',
    variant: 'ink',
    'data-consumer': 'fixture'
  } satisfies WeBaseButtonProps;
</script>

<main>
  <WeBaseAlert title="Tarball installed" message="The public package resolved without workspace links." />
  <WeBaseCard title="Consumer composition" data-surface="fixture">
    <p>This body is supplied through the Svelte 5 children snippet.</p>

    {#snippet footer()}
      <small>Installed artifact / 0.2.0</small>
    {/snippet}
  </WeBaseCard>
  <WeBaseButton {...action} />
</main>

<style>
  :global(body) { margin: 0; color: var(--ink); background: var(--paper); }
  main { display: grid; max-width: 48rem; gap: 2rem; margin: 0 auto; padding: 3rem 1.5rem; }
</style>
