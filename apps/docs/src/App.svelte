<script lang="ts">
  import { onMount } from 'svelte';
  import DocsFooter from './lib/layout/DocsFooter.svelte';
  import DocsHeader from './lib/layout/DocsHeader.svelte';
  import SearchDialog from './lib/layout/SearchDialog.svelte';
  import ComponentPage from './lib/pages/ComponentPage.svelte';
  import ComponentsPage from './lib/pages/ComponentsPage.svelte';
  import LandingPage from './lib/pages/LandingPage.svelte';
  import ReleasePage from './lib/pages/ReleasePage.svelte';
  import { components } from './lib/data/reference.js';
  import { currentRoute, routeForPath, type DocsRoute } from './lib/router.js';

  function supportedRoute(candidate: DocsRoute): DocsRoute {
    if (candidate.kind !== 'component') return candidate;
    return components.some(({ slug }) => slug === candidate.slug)
      ? candidate
      : { kind: 'components', path: '/components' };
  }

  let route = $state<DocsRoute>(supportedRoute(currentRoute()));
  let dark = $state(false);
  let themeReady = $state(false);
  let mobileNavOpen = $state(false);
  let searchOpen = $state(false);
  let searchOpener = $state<HTMLElement>();

  const selectedComponent = $derived.by(() => {
    if (route.kind !== 'component') return undefined;
    const componentRoute = route as Extract<DocsRoute, { kind: 'component' }>;
    return components.find(({ slug }) => slug === componentRoute.slug);
  });
  const pageTitle = $derived.by(() => {
    if (selectedComponent) return `${selectedComponent.name} - WeBaseUI`;
    if (route.kind === 'components') return 'Components - WeBaseUI';
    if (route.kind === 'release') return 'Release - WeBaseUI';
    return 'WeBaseUI - Svelte component library';
  });

  $effect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (themeReady) localStorage.setItem('webaseui-theme', dark ? 'dark' : 'light');
  });

  function navigate(path: string) {
    const target = new URL(path, window.location.origin);
    const nextRoute = supportedRoute(routeForPath(target.pathname));
    const currentUrl = `${window.location.pathname}${window.location.hash}`;
    const nextUrl = `${nextRoute.path}${target.hash}`;

    if (currentUrl !== nextUrl) history.pushState(null, '', nextUrl);
    route = nextRoute;
    mobileNavOpen = false;
    searchOpen = false;

    requestAnimationFrame(() => {
      if (target.hash) {
        document.querySelector<HTMLElement>(target.hash)?.scrollIntoView();
        return;
      }

      window.scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-route-focus]')?.focus({ preventScroll: true }));
    });
  }

  function openSearch(trigger?: EventTarget | null) {
    const active = trigger instanceof HTMLElement ? trigger : document.activeElement;
    searchOpener = active instanceof HTMLElement ? active : undefined;
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

  onMount(() => {
    const storedTheme = localStorage.getItem('webaseui-theme');
    dark = storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeReady = true;

    if (window.location.pathname !== route.path) history.replaceState(null, '', route.path);

    const handlePopState = () => {
      const nextRoute = supportedRoute(currentRoute());
      route = nextRoute;
      if (window.location.pathname !== nextRoute.path) history.replaceState(null, '', nextRoute.path);
      mobileNavOpen = false;
      searchOpen = false;
    };
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

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="theme-color" content={dark ? '#141413' : '#f5f4ed'} />
</svelte:head>

<DocsHeader
  routeKind={route.kind}
  {dark}
  {mobileNavOpen}
  onNavigate={navigate}
  onToggleMobile={() => (mobileNavOpen = !mobileNavOpen)}
  onToggleTheme={() => (dark = !dark)}
  onOpenSearch={openSearch}
/>

<main>
  {#if route.kind === 'landing'}
    <LandingPage onNavigate={navigate} />
  {:else if route.kind === 'components' || (route.kind === 'component' && !selectedComponent)}
    <ComponentsPage onNavigate={navigate} />
  {:else if route.kind === 'component' && selectedComponent}
    {#key selectedComponent.name}<ComponentPage component={selectedComponent} onNavigate={navigate} />{/key}
  {:else if route.kind === 'release'}
    <ReleasePage onNavigate={navigate} />
  {/if}
</main>

<DocsFooter onNavigate={navigate} />
<SearchDialog open={searchOpen} onClose={closeSearch} onNavigate={navigate} />
