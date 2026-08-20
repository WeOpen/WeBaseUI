<script lang="ts">
  import { WeBaseIcon } from '@webaseui/svelte';
  import { packageVersion } from '../data/reference.js';

  interface Props {
    onNavigate: (path: string) => void;
  }

  let { onNavigate }: Props = $props();

  const releases = [
    { version: packageVersion, date: 'Current', label: 'Patch', notes: ['Improved WeBaseTag small-text contrast in light and dark themes.'] },
    { version: '0.3.1', date: 'Previous', label: 'Patch', notes: ['Declared the package side-effect free so bundlers can tree-shake unused components, styles, and icon code from package-root imports.'] },
    { version: '0.3.0', date: 'Navigation', label: 'Minor', notes: ['Added semantic WeBaseLink and WeBaseTag navigation primitives for application migrations.'] }
  ];
</script>

<section class="release-page" aria-labelledby="release-title" data-route-focus tabindex="-1">
  <header class="release-heading">
    <div>
      <p class="section-label">Version history</p>
      <h1 id="release-title">Release.</h1>
      <p>Small, inspectable changes keep the component contract easy to trust. Read the current channel, then follow the public reference for implementation details.</p>
    </div>
    <div class="release-signal"><WeBaseIcon name="circle-check" size={22} /><span>Current channel</span><strong>v{packageVersion}</strong></div>
  </header>

  <div class="release-timeline">
    {#each releases as release, index}
      <article class="release-entry">
        <div class="release-marker" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span></div>
        <div class="release-entry-copy">
          <header><div><p>{release.date}</p><h2>v{release.version}</h2></div><span>{release.label}</span></header>
          <ul>{#each release.notes as note}<li>{note}</li>{/each}</ul>
        </div>
      </article>
    {/each}
  </div>

  <aside class="release-policy">
    <WeBaseIcon name="scan-square" size={22} />
    <div><strong>Every release is a contract decision.</strong><p>Read the component reference for props, events, keyboard behavior, and the consumer example behind each change.</p></div>
    <a href="/components" onclick={(event) => { event.preventDefault(); onNavigate('/components'); }}>Open components <WeBaseIcon name="arrow-right" size={16} /></a>
  </aside>
</section>
