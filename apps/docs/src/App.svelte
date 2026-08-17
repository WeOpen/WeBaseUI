<script lang="ts">
  import { onMount } from 'svelte';
  import {
    WeBaseAlert,
    WeBaseBadge,
    WeBaseButton,
    WeBaseCard,
    WeBaseIcon,
    WeBaseIconButton,
    WeBaseLink,
    WeBaseSlider,
    WeBaseSwitch,
    WeBaseTabs,
    WeBaseTooltip
  } from '@webaseui/svelte';
  import ComponentPreview from './lib/ComponentPreview.svelte';
  import {
    components,
    groupOrder,
    inlineParts,
    packageVersion,
    type ComponentName
  } from './lib/reference';

  const tokens = [
    { key: 'canvas', label: 'Canvas', token: '--webase-color-canvas' },
    { key: 'surface', label: 'Surface', token: '--webase-color-surface' },
    { key: 'ink', label: 'Ink', token: '--webase-color-ink' },
    { key: 'muted', label: 'Muted ink', token: '--webase-color-ink-muted' },
    { key: 'brand', label: 'Brand', token: '--webase-color-brand' },
    { key: 'tint', label: 'Brand tint', token: '--webase-color-brand-tint' },
    { key: 'success', label: 'Success', token: '--webase-color-success' },
    { key: 'warning', label: 'Warning', token: '--webase-color-warning' },
    { key: 'error', label: 'Error', token: '--webase-color-error' }
  ] as const;

  const installCommand = 'npm install @webaseui/core @webaseui/svelte';
  const importCode = `import '@webaseui/core/theme.css';
import { WeBaseButton } from '@webaseui/svelte';`;

  let dark = $state(false);
  let themeReady = $state(false);
  let mobileNavOpen = $state(false);
  let searchOpen = $state(false);
  let searchQuery = $state('');
  let referenceQuery = $state('');
  let selectedName = $state<ComponentName>('WeBaseButton');
  let copiedTarget = $state('');
  let heroTab = $state(0);
  let heroDensity = $state(64);
  let heroSaved = $state(false);
  let searchDialog = $state<HTMLDialogElement>();
  let searchInput = $state<HTMLInputElement>();
  let searchOpener = $state<HTMLElement>();
  let copyTimer: number | undefined;

  const selectedComponent = $derived(components.find(({ name }) => name === selectedName) ?? components[0]!);
  const filteredComponents = $derived.by(() => {
    const query = referenceQuery.trim().toLocaleLowerCase();
    if (!query) return components;
    return components.filter(({ searchText }) => searchText.includes(query));
  });
  const searchResults = $derived.by(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return components.slice(0, 8);
    return components.filter(({ searchText }) => searchText.includes(query)).slice(0, 12);
  });

  $effect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (themeReady) localStorage.setItem('webaseui-theme', dark ? 'dark' : 'light');
  });

  $effect(() => {
    const dialog = searchDialog;
    if (!dialog) return;

    if (searchOpen && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => searchInput?.focus());
    } else if (!searchOpen && dialog.open) {
      dialog.close();
    }
  });

  function openSearch(seed = '', trigger?: EventTarget | null) {
    const active = trigger instanceof HTMLElement ? trigger : document.activeElement;
    searchOpener = active instanceof HTMLElement ? active : undefined;
    searchQuery = seed;
    searchOpen = true;
    mobileNavOpen = false;
  }

  function closeSearch() {
    const opener = searchOpener;
    searchOpen = false;
    requestAnimationFrame(() => {
      if (!opener?.isConnected) return;
      opener.focus({ preventScroll: true });
      if (searchOpener === opener) searchOpener = undefined;
    });
  }

  function scrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  function selectComponent(name: ComponentName, scroll = true) {
    const component = components.find((item) => item.name === name);
    if (!component) return;

    selectedName = name;
    searchOpen = false;
    mobileNavOpen = false;
    history.replaceState(null, '', `#component-${component.slug}`);

    requestAnimationFrame(() => {
      const target = document.getElementById(`component-${component.slug}`);
      if (scroll) target?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      target?.focus({ preventScroll: true });
    });
  }

  function selectFromHash() {
    const slug = window.location.hash.match(/^#component-([a-z]+)$/)?.[1];
    if (!slug) return;
    const component = components.find((item) => item.slug === slug);
    if (component) selectedName = component.name;
  }

  function fallbackCopy(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }

  async function copyText(key: string, text: string) {
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) copied = fallbackCopy(text);
    if (!copied) return;

    copiedTarget = key;
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      if (copiedTarget === key) copiedTarget = '';
    }, 1800);
  }

  onMount(() => {
    const storedTheme = localStorage.getItem('webaseui-theme');
    dark = storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeReady = true;
    selectFromHash();

    const handleHashChange = () => selectFromHash();
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const editing = target?.matches('input, textarea, select, [contenteditable="true"]');
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k';

      if (shortcut || (!editing && event.key === '/')) {
        event.preventDefault();
        openSearch();
      } else if (event.key === 'Escape' && mobileNavOpen) {
        mobileNavOpen = false;
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('keydown', handleKeydown);

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let observer: IntersectionObserver | undefined;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
    } else {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer?.unobserve(entry.target);
        }
      }, { threshold: 0.14 });
      revealElements.forEach((element) => observer?.observe(element));
    }

    return () => {
      window.clearTimeout(copyTimer);
      observer?.disconnect();
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <meta name="theme-color" content={dark ? '#141413' : '#f5f4ed'} />
</svelte:head>

<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="#top" aria-label="WeBaseUI home">
      <img class="brand-logo" src="/logo.svg" alt="" width="38" height="41" />
    </a>

      <button class="search-trigger" type="button" aria-label="Search documentation" onclick={(event) => openSearch('', event.currentTarget)}>
      <WeBaseIcon name="search" size={16} />
      <span>Search the contract</span>
      <kbd>Ctrl K</kbd>
    </button>

    <nav class="primary-nav" aria-label="Documentation">
      <a href="#tokens">Tokens</a>
      <a href="#components">Components</a>
      <a href="#install">Install</a>
    </nav>

    <div class="header-actions">
      <div class="theme-control">
        <span>{dark ? 'Dark' : 'Light'}</span>
        <WeBaseSwitch label="Toggle dark theme" bind:checked={dark} />
      </div>
      <button class="mobile-menu-button" type="button" aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" onclick={() => (mobileNavOpen = !mobileNavOpen)}>
        {mobileNavOpen ? 'Close' : 'Menu'}
      </button>
    </div>
  </div>

  {#if mobileNavOpen}
    <nav class="mobile-navigation" id="mobile-navigation" aria-label="Mobile documentation">
      <a href="#tokens" onclick={() => (mobileNavOpen = false)}>Tokens</a>
      <a href="#components" onclick={() => (mobileNavOpen = false)}>Components</a>
      <a href="#install" onclick={() => (mobileNavOpen = false)}>Install</a>
      <button type="button" onclick={(event) => openSearch('', event.currentTarget)}>Search components</button>
    </nav>
  {/if}
</header>

<main id="top">
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy-block">
      <h1 id="hero-title"><span>Build with</span><em>a visible contract.</em></h1>
      <p class="hero-copy">Accessible Svelte 5 components, named tokens, and a public contract designed to move between products.</p>
      <div class="hero-actions">
        <WeBaseButton label="Explore reference" variant="ink" icon="arrow-down" onclick={() => document.querySelector('#components')?.scrollIntoView({ behavior: scrollBehavior() })} />
        <WeBaseLink href="#install" label="Install packages" variant="action" />
      </div>
    </div>

    <div class="hero-stage" aria-label="Interactive WeBaseUI specimen">
      <h2 class="visually-hidden">Interactive component specimen</h2>
      <div class="stage-card">
        <WeBaseCard eyebrow="Live specimen" title="Reference desk" variant="paper">
          <div class="hero-card-content">
            <WeBaseTabs items={['Contract', 'Preview', 'Release']} panels={['Public behavior', 'Real components', 'Versioned changes']} bind:active={heroTab} />
            <WeBaseSlider label="Interface density" bind:value={heroDensity} />
          </div>
          {#snippet footer()}
            <small>Three browser engines</small>
            <WeBaseBadge label="SSR ready" variant="canonical" />
          {/snippet}
        </WeBaseCard>
      </div>

      <div class="stage-alert">
        <WeBaseAlert title="Contract verified" message="All 28 public exports are indexed." tone="success" />
      </div>

      <div class="stage-actions">
        <WeBaseButton label={heroSaved ? 'Saved' : 'Save specimen'} variant={heroSaved ? 'outline' : 'ink'} icon="check" onclick={() => (heroSaved = !heroSaved)} />
        <WeBaseIconButton label="Bookmark specimen" icon="bookmark" bind:pressed={heroSaved} />
        <WeBaseTooltip label="Details" text="Every specimen is imported from the package root." />
      </div>
    </div>
  </section>

  <section class="proof-rail" aria-label="Library baseline" data-reveal>
    <dl>
      <div><dt>Components</dt><dd>28</dd></div>
      <div><dt>Runtime</dt><dd>Svelte 5</dd></div>
      <div><dt>Engines</dt><dd>3</dd></div>
      <div><dt>License</dt><dd>MIT</dd></div>
    </dl>
  </section>

  <section id="tokens" class="page-section tokens-section" data-reveal>
    <header class="section-heading">
      <p class="section-label">Foundation</p>
      <h2>Tokens carry the identity.</h2>
      <p>Semantic variables keep color, type, focus, and motion coherent across every framework surface.</p>
    </header>

    <div class="token-composition">
      <div class="token-poster" aria-hidden="true">
        <span class="poster-canvas"></span>
        <span class="poster-brand"></span>
        <span class="poster-ink"></span>
        <span class="poster-signal"></span>
        <strong>--webase-*</strong>
      </div>

      <div class="token-index" aria-label="Public color tokens">
        {#each tokens as token}
          <article class={`token-chip token-${token.key}`}>
            <span class="token-swatch" style={`--token-swatch: var(${token.token})`}></span>
            <div>
              <strong>{token.label}</strong>
              <code>{token.token}</code>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section id="components" class="page-section components-section" data-reveal>
    <header class="section-heading components-heading">
      <h2>Reference Desk</h2>
      <p>Search, inspect, and exercise every public component against the versioned API contract.</p>
      <button type="button" class="section-search-button" onclick={(event) => openSearch('', event.currentTarget)}>
        <WeBaseIcon name="search" size={17} />
        Search all 28 components
      </button>
    </header>

    <div class="mobile-component-select">
      <label for="mobile-component">Choose a component</label>
      <select id="mobile-component" value={selectedName} onchange={(event) => selectComponent((event.currentTarget as HTMLSelectElement).value as ComponentName)}>
        {#each components as component}
          <option value={component.name}>{component.name}</option>
        {/each}
      </select>
    </div>

    <div class="reference-shell">
      <aside class="reference-sidebar" aria-label="Component index">
        <label class="sidebar-search">
          <span class="visually-hidden">Filter components</span>
          <WeBaseIcon name="search" size={15} />
          <input type="search" placeholder="Filter components" bind:value={referenceQuery} />
        </label>
        <p class="sidebar-count">{filteredComponents.length} of {components.length}</p>

        <div class="sidebar-groups">
          {#each groupOrder as group}
            {@const groupComponents = filteredComponents.filter((component) => component.group === group)}
            {#if groupComponents.length > 0}
              <section class="sidebar-group">
                <h3>{group}</h3>
                <div>
                  {#each groupComponents as component}
                    <button
                      type="button"
                      class:selected={selectedName === component.name}
                      aria-current={selectedName === component.name ? 'true' : undefined}
                      onclick={() => selectComponent(component.name, false)}
                    >
                      {component.shortName}
                    </button>
                  {/each}
                </div>
              </section>
            {/if}
          {/each}

          {#if filteredComponents.length === 0}
            <p class="sidebar-empty">No components match this filter.</p>
          {/if}
        </div>
      </aside>

      {#key selectedComponent.name}
        <article
          class="reference-detail"
          id={`component-${selectedComponent.slug}`}
          data-selected-component={selectedComponent.name}
          tabindex="-1"
        >
          <header class="reference-header">
            <div>
              <p>{selectedComponent.group}</p>
              <h3>{selectedComponent.name}</h3>
              <p>
                {#each inlineParts(selectedComponent.summary) as part}
                  {#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}
                {/each}
              </p>
            </div>
            <span class="reference-version">v{packageVersion}</span>
          </header>

          <section class="preview-panel" aria-labelledby="preview-heading">
            <header>
              <h4 id="preview-heading">Live specimen</h4>
              <span>Package root import</span>
            </header>
            <div class="preview-canvas">
              <ComponentPreview name={selectedComponent.name} />
            </div>
          </section>

          <div class="reference-lower">
            <section class="contract-panel" aria-labelledby="contract-heading">
              <header>
                <h4 id="contract-heading">Public contract</h4>
                <span>{selectedComponent.fields.length} fields</span>
              </header>
              <dl class="contract-grid">
                {#each selectedComponent.fields as field}
                  <div class:contract-wide={field.label === 'Props' || field.label === 'Boundary'}>
                    <dt>{field.label}</dt>
                    <dd>
                      {#each inlineParts(field.value) as part}
                        {#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}
                      {/each}
                    </dd>
                  </div>
                {/each}
              </dl>
            </section>

            <section class="example-panel" aria-labelledby="example-heading">
              <header>
                <h4 id="example-heading">Usage</h4>
                <button type="button" aria-label={`Copy ${selectedComponent.name} example`} onclick={() => copyText(`example-${selectedComponent.name}`, `import { ${selectedComponent.name} } from '@webaseui/svelte';\n\n${selectedComponent.example}`)}>
                  {#if copiedTarget === `example-${selectedComponent.name}`}
                    <WeBaseIcon name="check" size={14} /> Copied
                  {:else}
                    Copy
                  {/if}
                </button>
              </header>
              <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
              <pre role="region" aria-label={`${selectedComponent.name} usage example`} tabindex="0"><code>{`import { ${selectedComponent.name} } from '@webaseui/svelte';\n\n${selectedComponent.example}`}</code></pre>
            </section>
          </div>
        </article>
      {/key}
    </div>
  </section>

  <section id="install" class="page-section install-section" data-reveal>
    <header class="section-heading">
      <h2>Install the boundary.</h2>
      <p>Tokens and Svelte components are versioned independently, then verified together in a clean consumer.</p>
    </header>

    <div class="install-composition">
      <article class="install-primary">
        <header>
          <span>Packages</span>
          <button type="button" aria-label="Copy install command" onclick={() => copyText('install', installCommand)}>
            {#if copiedTarget === 'install'}<WeBaseIcon name="check" size={14} /> Copied{:else}Copy{/if}
          </button>
        </header>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <pre role="region" aria-label="Installation command" tabindex="0"><code>{installCommand}</code></pre>
        <p>@webaseui/svelte v{packageVersion}</p>
      </article>

      <article class="install-import">
        <header>
          <span>Import</span>
          <button type="button" aria-label="Copy import example" onclick={() => copyText('import', importCode)}>
            {#if copiedTarget === 'import'}<WeBaseIcon name="check" size={14} /> Copied{:else}Copy{/if}
          </button>
        </header>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <pre role="region" aria-label="Import example" tabindex="0"><code>{importCode}</code></pre>
      </article>

      <aside class="install-notes" aria-label="Release guarantees">
        <div><strong>Type</strong><span>Generated declarations</span></div>
        <div><strong>Render</strong><span>SSR and hydration fixture</span></div>
        <div><strong>Input</strong><span>Keyboard and native form paths</span></div>
        <div><strong>Engines</strong><span>Chromium, Firefox, WebKit</span></div>
      </aside>
    </div>
  </section>
</main>

<footer>
  <a class="footer-brand" href="#top"><img src="/logo.svg" alt="" width="30" height="32" /> <span>WeBaseUI</span></a>
  <nav aria-label="Footer">
    <a href="https://github.com/WeOpen/WeBaseUI">GitHub</a>
    <a href="#components">Reference</a>
    <span>MIT License</span>
  </nav>
</footer>

<dialog
  class="search-dialog"
  bind:this={searchDialog}
  aria-labelledby="search-heading"
  onclose={() => (searchOpen = false)}
  onkeydown={(event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    closeSearch();
  }}
  onclick={(event) => { if (event.target === searchDialog) closeSearch(); }}
>
  <div class="search-panel">
    <header>
      <div>
        <p>Global search</p>
        <h2 id="search-heading">Search the public contract</h2>
      </div>
      <WeBaseIconButton label="Close search" icon="x" onclick={closeSearch} />
    </header>

    <label class="search-input">
      <span class="visually-hidden">Search components and API fields</span>
      <WeBaseIcon name="search" size={20} />
      <input bind:this={searchInput} type="search" placeholder="Try dialog, binding, or form" bind:value={searchQuery} />
      <kbd>Esc</kbd>
    </label>

    <div class="search-results" aria-live="polite">
      <p>{searchQuery ? `${searchResults.length} matches` : 'Browse components'}</p>
      {#if searchResults.length > 0}
        <ul>
          {#each searchResults as component}
            <li>
              <button type="button" onclick={() => selectComponent(component.name)}>
                <span><strong>{component.name}</strong><small>{component.group}</small></span>
                <span>
                  {#each inlineParts(component.summary) as part}
                    {#if part.code}<code>{part.text}</code>{:else}{part.text}{/if}
                  {/each}
                </span>
                <WeBaseIcon name="arrow-right" size={16} />
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="search-empty">
          <WeBaseIcon name="archive-x" size={24} />
          <strong>No contract found</strong>
          <span>Try a component name, prop, binding, or behavior.</span>
        </div>
      {/if}
    </div>
  </div>
</dialog>
