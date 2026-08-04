<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  /*
    The kicker + title + note composition that opens every section of the
    catalogue. Extracted because the same three-element header is repeated nine
    times on /design-system with identical structure.

    The hero keeps its own standalone .ds-kicker: it pairs the kicker with an h1
    and a different layout, so folding it in here would mean a second mode for
    one caller.
  */
  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
    kicker: string;
    title: string;
    note?: string;
    /** Set when a section uses aria-labelledby to point at this heading. */
    headingId?: string;
  }

  let { kicker, title, note = '', headingId, class: className = '', ...rest }: Props = $props();
</script>

<header class={`ds-section-head ${className}`} {...rest}>
  <p class="ds-section-kicker">{kicker}</p>
  <h2 id={headingId}>{title}</h2>
  {#if note}<p class="ds-section-note">{note}</p>{/if}
</header>

<style>
  .ds-section-head {
    display: grid;
    grid-template-columns: 1fr minmax(0, 2fr);
    align-items: end;
    column-gap: 32px;
    margin-bottom: 34px;
  }

  .ds-section-kicker {
    grid-column: 1 / -1;
    margin: 0 0 12px;
    color: var(--brand);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-family: var(--font);
    font-size: clamp(38px, 6vw, 72px);
    font-weight: 500;
    letter-spacing: -.06em;
    line-height: .9;
  }

  .ds-section-note {
    max-width: 280px;
    margin: 0;
    color: var(--ink-muted);
    font-size: 14px;
    line-height: 1.45;
  }

  @media (max-width: 700px) {
    .ds-section-head { display: block; }
    h2 { margin-bottom: 14px; }
  }
</style>
