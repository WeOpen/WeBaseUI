<script lang="ts">
  import ComponentDetail from '../components/ComponentDetail.svelte';
  import ComponentSidebar from '../components/ComponentSidebar.svelte';
  import type { ComponentReference } from '../data/reference.js';

  interface Props {
    component: ComponentReference;
    onNavigate: (path: string) => void;
  }

  let { component, onNavigate }: Props = $props();
</script>

<section class="reference-page" aria-labelledby="reference-title">
  <div class="reference-shell">
    <ComponentSidebar selectedName={component.name} {onNavigate} />
    <ComponentDetail {component} {onNavigate} />
  </div>
</section>
