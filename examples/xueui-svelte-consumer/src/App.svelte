<script lang="ts">
  import '@xueui/core/theme.css';
  import { XueAlert, XueButton, XueCard } from '@xueui/svelte';
  import type { XueButtonProps } from '@xueui/svelte';

  const action = {
    label: 'Save specimen',
    variant: 'ink',
    'data-consumer': 'fixture'
  } satisfies XueButtonProps;
</script>

<main>
  <XueAlert title="Tarball installed" message="The public package resolved without workspace links." />
  <XueCard title="Consumer composition" data-surface="fixture">
    <p>This body is supplied through the Svelte 5 children snippet.</p>

    {#snippet footer()}
      <small>Installed artifact / 0.2.0</small>
    {/snippet}
  </XueCard>
  <XueButton {...action} />
</main>

<style>
  :global(body) { margin: 0; color: var(--ink); background: var(--paper); }
  main { display: grid; max-width: 48rem; gap: 2rem; margin: 0 auto; padding: 3rem 1.5rem; }
</style>
