# Contributing

Keep framework-neutral tokens in `packages/webaseui-core` and Svelte-specific behavior in `packages/webaseui-svelte`. Public components must be exported from the package root and remain usable with native element attributes.

Before opening a pull request:

```sh
npm run check
npm run check:consumer
npm run test:unit
npm run test:browser
npm run test:visual
npm run check:size
npm run check:support
npm run check:changeset
npm audit --audit-level=high
```

The unit command includes the repository's 90% V8 coverage gate for core state utilities. Coverage drops fail locally and in CI through `npm run check`.

Visual baselines live beside the Playwright visual spec. Review intentional design changes before running `npm run test:visual:update`, then include the updated PNG files in the same pull request as the component change.

Add a Changeset for changes that affect a published package. Documentation-only and repository-maintenance changes do not require one.

Stable releases are prepared and published by `.github/workflows/release.yml`.
Do not run `npm publish` locally. Use the workflow's manual `next` or `canary`
channel only when a pre-release is needed; it uses OIDC trusted publishing and
finishes with a registry install/build smoke test that requires SLSA provenance.

The default review owner is recorded in `.github/CODEOWNERS`. Public API,
token, accessibility, release, and support-policy changes require that review
or an explicitly documented maintainer handoff.

Every release candidate also requires the two manual assistive-technology passes
in `docs/SCREEN_READER_AUDIT.md`. After each minor release, open a release review
from the repository issue template and record adoption, P0/P1 defects, package
size, compatibility warnings, and follow-up ownership.
