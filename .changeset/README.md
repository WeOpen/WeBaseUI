# Changesets

Add a changeset for every user-visible WeBaseUI package change:

```sh
npm run changeset
```

Select only packages whose published contract changes. Documentation-only site
changes do not need a changeset. Pull requests that change publishable package
files are checked automatically, and releases publish the resulting versions to npm.

The `Release` workflow creates or updates the release PR on `main`. After that PR
is merged, the same workflow versions packages and synchronizes `package-lock.json`,
then publishes both packages with npm trusted publishing,
OIDC, and provenance enabled, then installs the published versions in the registry
smoke fixture. The stable action uses `commitMode: github-api`, so it does not
depend on persisted checkout credentials. `workflow_dispatch` supports `next`
and `canary` pre-release tags; pre-release publication never runs from a local
shell. The exact npm trusted-publisher setup and provenance verification steps
live in [`docs/RELEASE_RUNBOOK.md`](../docs/RELEASE_RUNBOOK.md).
