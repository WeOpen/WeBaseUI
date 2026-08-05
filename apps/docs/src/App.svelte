<script lang="ts">
  import {
    WeBaseAlert,
    WeBaseBadge,
    WeBaseButton,
    WeBaseCard,
    WeBaseCheck,
    WeBaseDivider,
    WeBaseField,
    WeBaseIcon,
    WeBaseIconButton,
    WeBaseLoader,
    WeBaseLink,
    WeBaseProgress,
    WeBaseRadio,
    WeBaseSectionHeader,
    WeBaseSwitch,
    WeBaseTag,
    WeBaseTextarea,
    WeBaseTooltip
  } from '@webaseui/svelte';

  const components = [
    ['Accordion', 'Disclosure'], ['Alert', 'Feedback'], ['Badge', 'Status'],
    ['Breadcrumbs', 'Navigation'], ['Button', 'Action'], ['Card', 'Surface'],
    ['Check', 'Selection'], ['Dialog', 'Overlay'], ['Divider', 'Structure'],
    ['EmptyState', 'Content'], ['Field', 'Form'], ['Icon', 'Foundation'],
    ['IconButton', 'Action'], ['Link', 'Navigation'], ['Loader', 'Feedback'], ['Pagination', 'Navigation'],
    ['Progress', 'Feedback'], ['Radio', 'Selection'], ['SectionHeader', 'Structure'],
    ['Select', 'Form'], ['Skeleton', 'Feedback'], ['Slider', 'Form'],
    ['Switch', 'Selection'], ['Tag', 'Navigation'], ['Tabs', 'Navigation'], ['Textarea', 'Form'],
    ['Toast', 'Feedback'], ['Tooltip', 'Overlay']
  ] as const;

  const tokens = [
    ['Canvas', '--webase-color-canvas'],
    ['Surface', '--webase-color-surface'],
    ['Ink', '--webase-color-ink'],
    ['Muted ink', '--webase-color-ink-muted'],
    ['Brand', '--webase-color-brand'],
    ['Brand tint', '--webase-color-brand-tint'],
    ['Success', '--webase-color-success'],
    ['Warning', '--webase-color-warning'],
    ['Error', '--webase-color-error']
  ] as const;

  let dark = $state(false);
  let subscribed = $state(true);
  let selected = $state('stable');
  let title = $state('Field notes');
  let notes = $state('Keep the public contract small, visible, and deliberate.');

  $effect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  });
</script>

<svelte:head>
  <meta name="theme-color" content={dark ? '#101722' : '#f5f4ed'} />
</svelte:head>

<header class="site-header">
  <a class="brand" href="#top" aria-label="WeBaseUI home">
    <span class="seal" aria-hidden="true"><WeBaseIcon name="sparkles" size={18} /></span>
    <span><strong>WeBaseUI</strong><small>Svelte component library</small></span>
  </a>
  <nav aria-label="Documentation">
    <a href="#tokens">Tokens</a>
    <a href="#components">Components</a>
    <a href="#install">Install</a>
    <label class="theme-control">
      <span>{dark ? 'Dark' : 'Light'}</span>
      <WeBaseSwitch label="Toggle dark theme" bind:checked={dark} />
    </label>
  </nav>
</header>

<main id="top">
  <section class="hero">
    <p class="kicker">Public proof / 0.3</p>
    <h1>Interfaces with<br /><em>a registered mark.</em></h1>
    <p class="hero-copy">A compact foundation of namespaced tokens and accessible Svelte 5 components, designed to travel between products without losing its character.</p>
    <div class="hero-actions">
      <WeBaseButton label="Explore components" variant="ink" icon="arrow-down" onclick={() => document.querySelector('#components')?.scrollIntoView({ behavior: 'smooth' })} />
      <a href="https://github.com/WeOpen/WeBaseUI">View source ↗</a>
    </div>
    <dl class="ledger">
      <div><dt>Components</dt><dd>28</dd></div>
      <div><dt>Framework</dt><dd>Svelte 5</dd></div>
      <div><dt>Tokens</dt><dd>--webase-*</dd></div>
      <div><dt>License</dt><dd>MIT</dd></div>
    </dl>
  </section>

  <section id="tokens" class="section">
    <WeBaseSectionHeader kicker="01 / Foundation" title="Tokens" note="The core package is plain CSS. Every public variable uses the --webase-* namespace." />
    <div class="token-grid">
      {#each tokens as [label, token]}
        <article>
          <span class="swatch" style={`--swatch: var(${token})`}></span>
          <strong>{label}</strong>
          <code>{token}</code>
        </article>
      {/each}
    </div>
  </section>

  <section id="components" class="section">
    <WeBaseSectionHeader kicker="02 / Instruments" title="Components" note="The catalogue below is imported from the package root, exactly as a consumer imports it." />

    <div class="specimen-grid">
      <article class="specimen specimen-wide">
        <header><span>Actions</span><WeBaseBadge label="Stable" dot /></header>
        <div class="canvas action-row">
          <WeBaseButton label="Save specimen" variant="ink" icon="check" />
          <WeBaseButton label="Open archive" variant="outline" icon="arrow-up-right" />
          <WeBaseButton label="Add note" variant="quiet" icon="plus" />
          <WeBaseIconButton label="Bookmark" icon="bookmark" bind:pressed={subscribed} />
          <WeBaseLink href="#install" label="Install" variant="action" />
          <WeBaseTag href="#components" label="Navigation" count="02" />
          <WeBaseTooltip label="Details" text="Tooltips remain dismissible with Escape." />
        </div>
      </article>

      <article class="specimen">
        <header><span>Content surface</span><WeBaseBadge label="Composable" /></header>
        <div class="canvas">
          <WeBaseCard eyebrow="Specimen" title="A portable surface">
            <p>Children and footer are Svelte 5 snippets supplied by the consumer.</p>
            {#snippet footer()}<small>Updated 04 Aug</small>{/snippet}
          </WeBaseCard>
        </div>
      </article>

      <article class="specimen">
        <header><span>Feedback</span><WeBaseBadge label="Live" variant="experiment" /></header>
        <div class="canvas feedback-stack">
          <WeBaseAlert title="Package connected" message="The docs app consumes the local public package boundary." tone="success" />
          <WeBaseProgress value={72} label="Contract coverage" />
          <WeBaseLoader label="Checking" />
        </div>
      </article>

      <article class="specimen specimen-wide">
        <header><span>Forms and selection</span><WeBaseBadge label="Keyboard ready" /></header>
        <div class="canvas form-grid">
          <WeBaseField label="Specimen title" bind:value={title} help="Public labels stay concise." />
          <WeBaseTextarea label="Notes" bind:value={notes} />
          <div class="choice-stack">
            <WeBaseCheck label="Receive release notes" bind:checked={subscribed} />
            <WeBaseRadio name="channel" label="Stable channel" value="stable" bind:selected />
            <WeBaseRadio name="channel" label="Preview channel" value="preview" bind:selected />
          </div>
        </div>
      </article>
    </div>

    <WeBaseDivider label="Public exports" />
    <div class="component-index">
      {#each components as [name, group], index}
        <article>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>WeBase{name}</strong>
          <small>{group}</small>
        </article>
      {/each}
    </div>
  </section>

  <section id="install" class="section install">
    <WeBaseSectionHeader kicker="03 / Distribution" title="Install" note="Tokens and framework adapters are versioned independently." />
    <div class="install-grid">
      <pre><code>npm install @webaseui/core @webaseui/svelte</code></pre>
      <pre><code>{`import '@webaseui/core/theme.css';
import { WeBaseButton } from '@webaseui/svelte';`}</code></pre>
    </div>
    <p>React support remains intentionally deferred until a real consumer defines its runtime and accessibility requirements.</p>
  </section>
</main>

<footer>
  <span>WeOpen / WeBaseUI</span>
  <span>Core 0.1.0 · Svelte 0.3.0</span>
</footer>
