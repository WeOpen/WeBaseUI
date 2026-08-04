# XueUI Versioning and Deprecation Policy

XueUI packages follow Semantic Versioning. During the pre-1.0 period, the
project uses a stricter policy than SemVer requires so consumers can adopt it
without surprise.

## Version changes

- Patch: compatible fixes, accessibility corrections, documentation, and
  internal refactoring without public API changes.
- Minor: backward-compatible components, props, tokens, exports, and behavior.
- Major: removal or incompatible change to a documented public contract.
- Before 1.0, an unavoidable breaking change may ship in a minor release only
  when the changelog labels it clearly and provides a migration path.

`@xueui/core` and framework adapters may version independently. A framework
adapter declares the compatible core range in its package manifest.

## Public contracts

The following are public API and require version review:

- package-root exports and named Props types;
- documented props, defaults, bindings, snippets, and root attribute behavior;
- `--xue-*` CSS custom properties and theme selectors;
- keyboard behavior, focus management, ARIA relationships, and live regions;
- supported Svelte peer dependency ranges.

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
