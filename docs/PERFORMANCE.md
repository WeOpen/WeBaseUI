# Performance and package-size baseline

The repository keeps a measured baseline in
[`package-size-baseline.json`](./package-size-baseline.json). It records the
packed sizes of `@webaseui/core` and `@webaseui/svelte`, the shipped Svelte
source footprint, each public component's source footprint, and the gzip sizes
of the consumer fixture's JavaScript and CSS output.

Run the gate with:

```sh
npm run check:size
```

An intentional change that increases a tracked metric by more than 5% must
include a short explanation in the pull request. After review, refresh the
numbers explicitly:

```sh
npm run size:update
```

The baseline is a change detector, not a universal performance score. The
consumer bundle is the most useful signal for application impact; packed and
source sizes explain what changed inside the published artifacts.

## Reviewed baseline changes

### 2026-08-16: publish the core changelog

`@webaseui/core` now ships an initial `CHANGELOG.md` and includes it in its
package `files` allowlist. The current dry-run tarballs are 6,556 B for core
and 40,732 B for Svelte, compared with the tracked 6,412 B and 40,289 B
baselines. Both remain below the 5% growth gate; the baseline is intentionally
not reset so the next package change is measured against the pre-changelog
artifact.

### 2026-08-09: complete component token migration

The component token contract moved geometry, typography, focus, and motion
values out of all 28 component declaration blocks. The public custom-property
names increase CSS text size while leaving JavaScript unchanged:

| Metric | Previous | Current | Change |
| --- | ---: | ---: | ---: |
| Core CSS gzip | 2,854 B | 3,716 B | +862 B |
| Consumer CSS gzip | 3,572 B | 4,450 B | +878 B |
| Consumer JS gzip | 21,156 B | 21,156 B | 0 B |
| Svelte tarball | 31,026 B | 31,456 B | +430 B |

This is an intentional theme-extensibility cost: consumers can now override
shared interaction and component geometry without copying component CSS. The
5% growth gate continues from the updated baseline; further token additions
should demonstrate reuse or a concrete theming requirement.
