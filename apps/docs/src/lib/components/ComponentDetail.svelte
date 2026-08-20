<script lang="ts">
  import { onDestroy } from 'svelte';
  import { WeBaseIcon } from '@webaseui/svelte';
  import ComponentPreview from '../ComponentPreview.svelte';
  import { inlineParts, packageVersion, type ComponentReference } from '../data/reference.js';
  import { copyText } from '../utils/clipboard.js';

  interface Props {
    component: ComponentReference;
    onNavigate: (path: string) => void;
  }

  let { component, onNavigate }: Props = $props();
  let density = $state(64);
  let copied = $state(false);
  let copyTimer: number | undefined;

  const summary = $derived(component.name === 'WeBaseButton'
    ? 'A focused action control with explicit visual and keyboard states.'
    : component.summary);

  async function copyExample() {
    const source = `import { ${component.name} } from '@webaseui/svelte';\n\n${component.example}`;
    if (!await copyText(source)) return;
    copied = true;
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => (copied = false), 1800);
  }

  onDestroy(() => window.clearTimeout(copyTimer));
</script>

<article class="reference-detail" id={`component-${component.slug}`} data-selected-component={component.name} data-route-focus tabindex="-1">
  <nav class="reference-breadcrumb" aria-label="Component breadcrumb"><a href="/components" onclick={(event) => { event.preventDefault(); onNavigate('/components'); }}><WeBaseIcon name="arrow-left" size={17} />All components</a></nav>
  <header class="reference-header"><div><p>{component.group}</p><h1 id="reference-title">{component.name}</h1><p>{#each inlineParts(summary) as part}{#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}{/each}</p></div><span class="reference-version">v{packageVersion}</span></header>

  <section class="preview-panel" aria-labelledby="preview-heading"><header><h2 id="preview-heading">Live specimen</h2><div class="preview-density"><span>Density</span><WeBaseIcon name="minus" size={18} /><input type="range" aria-label="Specimen density" min="20" max="90" bind:value={density} /><WeBaseIcon name="plus" size={18} /></div></header><div class="preview-canvas"><ComponentPreview name={component.name} /></div></section>

  <div class="reference-lower">
    <section class="contract-panel" aria-labelledby="contract-heading"><header><h2 id="contract-heading">Public contract</h2></header><div class="contract-list">{#each component.fields as field}<div class="contract-row"><span class="contract-icon">{#if field.label === 'Props'}<WeBaseIcon name="sliders-horizontal" size={22} />{:else if field.label === 'Events'}<WeBaseIcon name="zap" size={22} />{:else if field.label === 'Keyboard'}<WeBaseIcon name="keyboard" size={22} />{:else}<WeBaseIcon name="scan-square" size={22} />{/if}</span><strong>{field.label}</strong><p>{#each inlineParts(field.value) as part}{#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}{/each}</p><WeBaseIcon name="chevron-right" size={18} /></div>{/each}</div></section>

    <section class="example-panel" aria-labelledby="example-heading"><header><h2 id="example-heading">Usage</h2><button type="button" aria-label={`Copy ${component.name} example`} onclick={copyExample}>{#if copied}<WeBaseIcon name="check" size={16} /> Copied{:else}<WeBaseIcon name="copy" size={16} /> Copy{/if}</button></header><pre role="region" aria-label={`${component.name} usage example`}><code>{`import { ${component.name} } from '@webaseui/svelte';\n\n${component.example}`}</code></pre></section>
  </div>
</article>
