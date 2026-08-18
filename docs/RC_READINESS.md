# 1.0 RC readiness

This is the release-candidate audit for the current repository state. It is
deliberately evidence-based: a documented process is not marked passed until a
command, artifact, or human record exists.

| Gate | Evidence | Status on 2026-08-18 |
| --- | --- | --- |
| Public API, token, and keyboard contract | `npm run check:api-contract`, `npm run check:tokens`, 28 component references, `API_CONTRACT.md`; fresh-install `npm run check` passed on 2026-08-17 | Passed in local CI-equivalent rerun |
| Chromium, Firefox, WebKit behavior | `npm run test:browser` with pinned Playwright engines (84/84 passed); `actionlint` validates workflow matrix | Passed in local CI-equivalent rerun |
| Automated accessibility | axe browser fixtures, `npm run check:contrast`, forced-colors/reduced-motion/coarse-pointer suites; included in 84/84 browser pass | Passed in local CI-equivalent rerun |
| Manual screen-reader audit | [`SCREEN_READER_AUDIT.md`](./SCREEN_READER_AUDIT.md) has VoiceOver/Safari and NVDA/Firefox-or-Chrome procedures | Pending human records |
| SSR, hydration, and tree shaking | `tests/ssr`, browser SSR spec, minimum/current consumer fixture, external Fig and CRUD trials; fresh-install consumer check passed | Passed in local CI-equivalent rerun |
| Support window | [`support-policy.json`](./support-policy.json), `npm run check:support`, Node 22/24 compatibility jobs | Ready |
| Visual and package-size gates | 47 Playwright visual tests passed; `npm run check:visual-baselines`, `docs/package-size-baseline.json`, 5% gate | Passed in local CI-equivalent rerun |
| P0/P1 and security | GitHub open issues: none; Dependabot alerts: none; security advisories: none; fresh-install `npm audit --audit-level=high`: 0 | Ready at local audit time; recheck immediately before release |
| Migration, versioning, security, and contribution policy | `VERSIONING.md`, `ADOPTION_MATRIX.md`, `SECURITY.md`, `CONTRIBUTING.md`, PR and issue templates | Ready |
| External consumers | xue minor upgrade, Fig registry trial, CRUD candidate tarball trial; content/navigation and form/CRUD profiles covered | Ready |
| npm publication, provenance, post-publish smoke | GitHub Actions release run `32084203280` published `@webaseui/core@0.2.0-next.0` and `@webaseui/svelte@0.4.0-next.0` through npm trusted publishing. Both packages expose the SLSA v1 provenance predicate, and the provenance-aware registry consumer smoke passed after npm completed dist-tag propagation. `scripts/registry-smoke.mjs` now retries bounded dist-tag and attestation lookups for that propagation window. | Passed for the `next` candidate; verify `latest` again after stable release |

## Required final sign-off

The repository is not a 1.0 RC until the pending manual audit row has direct evidence:

1. Attach completed VoiceOver/Safari and NVDA/Firefox or Chrome records. The
   audit cannot be inferred from axe or browser snapshots.

The publishing gate now has direct candidate evidence. Stable release PR #9
remains intentionally open until the screen-reader records are complete. After
that merge, rerun the same provenance and registry consumer checks against
`latest` before declaring the stable release complete.
