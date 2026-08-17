# 1.0 RC readiness

This is the release-candidate audit for the current repository state. It is
deliberately evidence-based: a documented process is not marked passed until a
command, artifact, or human record exists.

| Gate | Evidence | Status on 2026-08-17 |
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
| npm publication, provenance, post-publish smoke | [`RELEASE_RUNBOOK.md`](./RELEASE_RUNBOOK.md), local `.github/workflows/release.yml`, OIDC configuration, and `scripts/registry-smoke.mjs --require-provenance`; the enforced mode correctly rejects current `@webaseui/core@0.1.0` for missing SLSA provenance. GitHub API returns 404 for `release.yml` on `origin/main`, local `npm whoami` is unauthenticated, and latest packages expose npm signatures but no release provenance attestation | Pending publishing the workflow, repository/npm trust setup, and one live release |

## Required final sign-off

The repository is not a 1.0 RC until the two pending rows have direct evidence:

1. Attach completed VoiceOver/Safari and NVDA/Firefox or Chrome records. The
   audit cannot be inferred from axe or browser snapshots.
2. Configure npm trusted publishing for both packages and the exact release
   workflow, run one candidate or stable publication from GitHub Actions, verify
   provenance, and let the post-publish registry smoke pass.

The current public registry smoke is still useful: it proves the existing
`latest` packages install without workspace links. It is not provenance proof
for the next release and does not close the live publication row.
