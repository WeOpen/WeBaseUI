# XueUI

XueUI is an editorial design system built around calm typography, paper-like materials, seal-inspired symbols, and restrained motion. The component implementation currently targets Svelte 5; its tokens and themes are framework-neutral so a React adapter can be added without redesigning the visual language.

## Packages

- `@xueui/core` — CSS design tokens and theme primitives.
- `@xueui/svelte` — 26 typed Svelte 5 components.

## Install

```sh
npm install @xueui/core @xueui/svelte
```

```svelte
<script lang="ts">
  import '@xueui/core/tokens.css';
  import '@xueui/core/theme.css';
  import { XueButton, XueCard } from '@xueui/svelte';
</script>

<XueCard>
  <h2>XueUI</h2>
  <XueButton>Continue</XueButton>
</XueCard>
```

The packages have not been published to npm yet. Until the first release, use this repository as the source of truth and run the local consumer fixture before publishing.

## Development

Requires Node.js 22.13 or newer.

```sh
npm install
npm run check
npm run check:consumer
```

`npm run check` validates the generated package artifacts and public exports. `npm run check:consumer` packs both workspaces and builds an isolated Svelte app from the tarballs, catching errors that workspace links can hide.

For a user-facing change, create a Changeset:

```sh
npm run changeset
```

## Architecture

The framework-neutral layer lives in `@xueui/core`. Framework bindings consume that shared layer and own only component behavior and rendering. The planned React package will therefore be added as `@xueui/react` alongside `@xueui/svelte`, rather than translating Svelte components directly.

## License

[MIT](./LICENSE)
