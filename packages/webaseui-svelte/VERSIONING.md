# WeBaseUI Versioning and Deprecation Policy

WeBaseUI packages follow Semantic Versioning. During the pre-1.0 period, the
project uses a stricter policy than SemVer requires so consumers can adopt it
without surprise.

## Version changes

- Patch: compatible fixes, accessibility corrections, documentation, and
  internal refactoring without public API changes.
- Minor: backward-compatible components, props, tokens, exports, and behavior.
- Major: removal or incompatible change to a documented public contract.
- Before 1.0, an unavoidable breaking change may ship in a minor release only
  when the changelog labels it clearly and provides a migration path.

`@webaseui/core` and framework adapters may version independently. A framework
adapter declares the compatible core range in its package manifest.

## Public contracts

The following are public API and require version review:

- package-root exports and named Props types;
- documented props, defaults, bindings, snippets, and root attribute behavior;
- `--webase-*` CSS custom properties and theme selectors;
- keyboard behavior, focus management, ARIA relationships, and live regions;
- supported Svelte peer dependency ranges. The package currently requires Svelte 5.20 or newer because it uses the stable `$props.id()` rune.

Internal component paths, `ds-*` implementation classes, private helpers, and
undocumented markup structure are not public API.

## Deprecation

1. Introduce the replacement before deprecating the old API.
2. Mark the old API in documentation and type declarations when practical.
3. Keep both paths working for at least one minor release before 1.0 and until
   the next major release after 1.0.
4. Add a changelog migration example and test both paths during the transition.
5. Avoid runtime warnings for render-frequency APIs unless the warning is
   development-only and emitted once.

Accessibility fixes may adjust undocumented DOM structure in a patch release,
but must preserve the documented interaction contract and pass browser tests.

## Automated publication

The `Release` GitHub Actions workflow is the only supported publication path.
Its quality jobs run the complete package, consumer, browser, and visual gates
before the Changesets action creates a release PR or publishes a merged release.
The publish job grants `id-token: write`, upgrades npm to a trusted-publishing
compatible version, and sets `NPM_CONFIG_PROVENANCE=true`; npm must be configured
in advance to trust this repository and workflow for each package. No long-lived
`NPM_TOKEN` is stored in GitHub secrets.

After a stable publish, the workflow resolves both packages from the `latest`
dist-tag and builds the registry consumer fixture. Manual `workflow_dispatch`
runs can select `next` or `canary`; those runs enter Changesets pre-release mode,
publish with the selected dist-tag, and run the same registry smoke test. Stable
and pre-release tags are independent and are never overwritten by a local
`npm publish` command.
