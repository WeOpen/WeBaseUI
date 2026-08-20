<script lang="ts">
  import { WeBaseIcon } from '@webaseui/svelte';

  interface Props {
    onNavigate: (path: string) => void;
  }

  let { onNavigate }: Props = $props();

  function navigate(event: MouseEvent, path: string) {
    event.preventDefault();
    onNavigate(path);
  }
</script>

<footer>
  <a class="footer-brand" href="/" onclick={(event) => navigate(event, '/') }>
    <img src="/logo.svg" alt="" width="30" height="32" />
    <span>WeBaseUI</span>
  </a>
  <nav aria-label="Footer">
    <a href="https://github.com/WeOpen/WeBaseUI">GitHub</a>
    <a href="/components" onclick={(event) => navigate(event, '/components')}>Reference</a>
    <span>MIT License</span>
  </nav>
</footer>
