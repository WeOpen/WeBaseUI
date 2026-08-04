# Contributing

Keep framework-neutral tokens in `packages/xueui-core` and Svelte-specific behavior in `packages/xueui-svelte`. Public components must be exported from the package root and remain usable with native element attributes.

Before opening a pull request:

```sh
npm run check
npm run check:consumer
npm audit --audit-level=high
```

Add a Changeset for changes that affect a published package. Documentation-only and repository-maintenance changes do not require one.
