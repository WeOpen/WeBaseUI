<script lang="ts">
  import {
    WeBaseAlert,
    WeBaseButton,
    WeBaseIcon,
    WeBaseLink,
    WeBaseSlider,
    WeBaseTabs
  } from '@webaseui/svelte';
  import { packageVersion } from '../data/reference.js';
  import { copyText } from '../utils/clipboard.js';
  import { reveal } from '../actions/reveal.js';

  interface Props {
    onNavigate: (path: string) => void;
  }

  let { onNavigate }: Props = $props();

  const foundationGroups = [
    { label: 'Neutral', values: ['0', '50', '100', '200', '300'], colors: ['#faf9f5', '#f5f4ed', '#e8e6dc', '#d8d5c9', '#b9b6ad'] },
    { label: 'Navy', values: ['50', '100', '200', '300', '600', '900'], colors: ['#eef2f7', '#d6e0ed', '#afc2da', '#7696bb', '#2d5a8a', '#1b365d'] },
    { label: 'Ink', values: ['900', '700', '500', '300', '100'], colors: ['#141413', '#504e49', '#85837d', '#c9c7be', '#faf9f5'] },
    { label: 'Success', values: ['50', '200', '600'], colors: ['#edf5f0', '#9bc8b1', '#3f7658'] }
  ];
  const installCommand = 'npm install @webaseui/core @webaseui/svelte';
  const importCode = `import '@webaseui/core/theme.css';
import { WeBaseButton } from '@webaseui/svelte';`;

  let copiedTarget = $state('');
  let heroTab = $state(1);
  let heroDensity = $state(64);
  let copyTimer: number | undefined;

  async function copy(key: string, text: string) {
    if (!await copyText(text)) return;
    copiedTarget = key;
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      if (copiedTarget === key) copiedTarget = '';
    }, 1800);
  }
</script>

<section class="landing-page" data-route-focus tabindex="-1">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy-block">
      <h1 id="hero-title"><span>Build with</span><em>a visible contract.</em></h1>
      <p class="hero-copy">Accessible Svelte 5 components, named tokens, and a public contract designed to move between products.</p>
      <div class="hero-actions">
        <WeBaseButton label="Explore reference" variant="ink" icon="arrow-right" onclick={() => onNavigate('/components/button')} />
        <WeBaseLink href="#install" label="Install packages" variant="action" icon="arrow-down" />
      </div>
    </div>

    <div class="hero-stage" aria-label="Interactive WeBaseUI specimen">
      <h2 class="visually-hidden">Interactive component specimen</h2>
      <article class="reference-desk">
        <header class="desk-header">
          <strong>Reference desk</strong>
          <div><WeBaseIcon name="book-open" size={22} /><WeBaseIcon name="code-2" size={22} /></div>
        </header>
        <div class="desk-tabs">
          <WeBaseTabs items={['Contract', 'Preview', 'Release']} panels={['Public behavior', 'Real components', 'Versioned changes']} bind:active={heroTab} />
        </div>
        <div class="desk-body">
          <div class="density-line"><span>Interface density</span><strong>Comfortable</strong></div>
          <WeBaseSlider label="Interface density" bind:value={heroDensity} />
          <div class="density-labels"><span>Compact</span><span>Spacious</span></div>
          <div class="verified-alert"><WeBaseAlert title="Contract verified" message="" tone="success" /></div>
        </div>
        <footer class="desk-footer">
          <span><WeBaseIcon name="box" size={22} />28 public exports</span>
          <span><WeBaseIcon name="server" size={22} />SSR ready</span>
          <code>v{packageVersion}</code>
        </footer>
      </article>
    </div>
  </section>

  <section class="proof-rail" aria-label="Library baseline" data-reveal use:reveal>
    <dl>
      <div><WeBaseIcon name="grid-2x2" size={25} /><dt>Components</dt><dd>28</dd></div>
      <div><WeBaseIcon name="code-2" size={25} /><dt>Runtime</dt><dd>Svelte 5</dd></div>
      <div><WeBaseIcon name="box" size={25} /><dt>Engines</dt><dd>3</dd></div>
      <div><WeBaseIcon name="file-text" size={25} /><dt>License</dt><dd>MIT</dd></div>
    </dl>
  </section>

  <section id="tokens" class="foundation-section" data-reveal use:reveal>
    <div class="section-heading foundation-heading">
      <div><h2>Foundation</h2></div>
      <WeBaseLink href="/components" label="View components" variant="action" icon="arrow-right" onclick={(event) => { event.preventDefault(); onNavigate('/components'); }} />
    </div>
    <div class="foundation-grid">
      {#each foundationGroups as group}
        <section class="foundation-group" aria-label={`${group.label} color tokens`}>
          <h3>{group.label}</h3>
          <div class="swatch-row">
            {#each group.values as value, index}
              <div class="swatch-item"><span style={`background: ${group.colors[index]}`}></span><code>{value}</code></div>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  </section>

  <section id="install" class="install-section" data-reveal use:reveal>
    <div class="section-heading"><p class="section-label">Start here</p><h2>Install the boundary.</h2><p>Tokens and Svelte components are versioned independently, then verified together in a clean consumer.</p></div>
    <div class="install-composition">
      <article class="install-primary"><header><span>Packages</span><button type="button" aria-label="Copy install command" onclick={() => copy('install', installCommand)}>{#if copiedTarget === 'install'}<WeBaseIcon name="check" size={14} /> Copied{:else}<WeBaseIcon name="copy" size={14} /> Copy{/if}</button></header><pre role="region" aria-label="Installation command"><code>{installCommand}</code></pre><p>@webaseui/svelte v{packageVersion}</p></article>
      <article class="install-import"><header><span>Import</span><button type="button" aria-label="Copy import example" onclick={() => copy('import', importCode)}>{#if copiedTarget === 'import'}<WeBaseIcon name="check" size={14} /> Copied{:else}<WeBaseIcon name="copy" size={14} /> Copy{/if}</button></header><pre role="region" aria-label="Import example"><code>{importCode}</code></pre></article>
    </div>
  </section>
</section>
