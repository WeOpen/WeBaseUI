<script lang="ts">
  import { WeBaseIcon, WeBaseIconButton, WeBaseSwitch } from '@webaseui/svelte';

  interface Props {
    routeKind: 'landing' | 'components' | 'component' | 'release';
    dark: boolean;
    mobileNavOpen: boolean;
    onNavigate: (path: string) => void;
    onToggleMobile: () => void;
    onToggleTheme: () => void;
    onOpenSearch: (event?: EventTarget | null) => void;
  }

  let {
    routeKind,
    dark,
    mobileNavOpen,
    onNavigate,
    onToggleMobile,
    onToggleTheme,
    onOpenSearch
  }: Props = $props();

  function navigate(event: MouseEvent, path: string) {
    event.preventDefault();
    onNavigate(path);
  }
</script>

<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/" aria-label="WeBaseUI home" onclick={(event) => navigate(event, '/')}>
      <img class="brand-logo" src="/logo.svg" alt="" width="38" height="41" />
    </a>

    <button class="search-trigger" type="button" aria-label="Search documentation" onclick={(event) => onOpenSearch(event.currentTarget)}>
      <WeBaseIcon name="search" size={20} strokeWidth={1.6} />
      <span>Search the contract</span>
      <kbd>Ctrl K</kbd>
    </button>

    <nav class="primary-nav" aria-label="Documentation">
      <a href="/components" class:active={routeKind === 'components' || routeKind === 'component'} onclick={(event) => navigate(event, '/components')}>Components</a>
      <a href="/release" class:active={routeKind === 'release'} onclick={(event) => navigate(event, '/release')}>Release</a>
    </nav>

    <div class="header-actions">
      <span class="theme-control">
        <WeBaseIcon name="sun" size={18} class="theme-sun" />
        <WeBaseSwitch label="Toggle dark theme" checked={dark} onchange={onToggleTheme} />
        <WeBaseIcon name="moon" size={18} class="theme-moon" />
      </span>
      <button class="mobile-menu-button" type="button" aria-label={mobileNavOpen ? 'Close menu' : 'Menu'} aria-expanded={mobileNavOpen} aria-controls="mobile-navigation" onclick={onToggleMobile}>
        <WeBaseIcon name={mobileNavOpen ? 'x' : 'menu'} size={27} />
      </button>
    </div>
  </div>

  {#if mobileNavOpen}
    <nav class="mobile-navigation" id="mobile-navigation" aria-label="Mobile documentation">
      <a href="/components" onclick={(event) => navigate(event, '/components')}>Components</a>
      <a href="/release" onclick={(event) => navigate(event, '/release')}>Release</a>
      <button type="button" onclick={(event) => onOpenSearch(event.currentTarget)}>Search components</button>
    </nav>
  {/if}
</header>
