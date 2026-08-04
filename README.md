# WeBaseUI

WeBaseUI is an editorial design system built around calm typography, paper-like materials, seal-inspired symbols, and restrained motion. The component implementation currently targets Svelte 5; its tokens and themes are framework-neutral so a React adapter can be added without redesigning the visual language.

## Packages

- `@webaseui/core` — CSS design tokens and theme primitives.
- `@webaseui/svelte` — 26 typed Svelte 5 components.

## Install

```sh
npm install @webaseui/core @webaseui/svelte
```

```svelte
<script lang="ts">
  import '@webaseui/core/tokens.css';
  import '@webaseui/core/theme.css';
  import { WeBaseButton, WeBaseCard } from '@webaseui/svelte';
</script>

<WeBaseCard>
  <h2>WeBaseUI</h2>
  <WeBaseButton>Continue</WeBaseButton>
</WeBaseCard>
```

The packages have not been published to npm yet. Until the first release, use this repository as the source of truth and run the local consumer fixture before publishing.

All public component and Props exports use the `WeBase*` prefix. Public design tokens use the `--webase-*` namespace.

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

The framework-neutral layer lives in `@webaseui/core`. Framework bindings consume that shared layer and own only component behavior and rendering. The planned React package will therefore be added as `@webaseui/react` alongside `@webaseui/svelte`, rather than translating Svelte components directly.

## License

[MIT](./LICENSE)
