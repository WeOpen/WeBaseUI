# Release Runbook

This repository publishes `@webaseui/core` and `@webaseui/svelte` through
GitHub Actions. Do not run `npm publish` from a developer workstation.

## Before The First Release

1. Merge the release workflow at `.github/workflows/release.yml` onto the
   default branch. The npm trusted publisher matches the exact repository and
   workflow path, so an unpushed local workflow is not sufficient.
2. In npm package settings, add a GitHub Actions trusted publisher for both
   packages with these values:
   - Owner: `WeOpen`
   - Repository: `WeBaseUI`
   - Workflow filename: `release.yml`
   - Environment: blank, unless the workflow is later changed to use one
3. Keep the stable job permissions at `contents: write`,
   `pull-requests: write`, and `id-token: write`. The pre-release job needs
   `id-token: write`.
4. Confirm the package access is public and that the npm account can manage
   both package settings. No long-lived npm token belongs in GitHub secrets.

## Stable Flow

1. Add a changeset and merge it to `main`.
2. The release workflow runs the full quality, consumer, browser, and visual
   gates, then creates or updates the Changesets release PR.
3. Merge the release PR. The stable job versions packages, synchronizes the
   lockfile, publishes with OIDC and provenance, and runs the provenance-aware
   registry smoke test.
4. Record the package versions, release commit, workflow run URL, npm
   attestation metadata, and smoke result in the release review issue.

The local version command is deliberately lockfile-aware:

```sh
npm run version-packages
```

It runs `changeset version` followed by a package-lock-only install. The
workflow must be the source of the actual publish.

## Verification

For a published version, verify both packages expose the SLSA provenance
predicate before accepting the release:

```sh
npm view @webaseui/core@VERSION dist.attestations --json
npm view @webaseui/svelte@VERSION dist.attestations --json
npm run check:registry -- --tag=latest --require-provenance
```

The metadata must include:

```json
{
  "provenance": {
    "predicateType": "https://slsa.dev/provenance/v1"
  }
}
```

The default `npm run check:registry -- --tag=latest` remains useful for
historical packages that predate provenance, but it is not a release sign-off.

## Release Candidate Accessibility Sign-Off

Complete [`SCREEN_READER_AUDIT.md`](./SCREEN_READER_AUDIT.md) in both required
environments before calling the candidate an RC:

- macOS VoiceOver with Safari;
- Windows NVDA with Firefox or Chrome.

Record the assistive-technology and browser versions, tester, date, every
scenario result, and linked issues. Axe, keyboard, and browser snapshots are
supporting evidence only and cannot replace these records.
