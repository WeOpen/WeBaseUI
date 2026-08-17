---
name: Minor release review
about: Record adoption, defects, accessibility, compatibility, and package-size evidence after a minor release
title: "[release review] "
labels: "release"
assignees: ""
---

## Release identity

- Package versions:
- Release commit and workflow run:
- npm provenance attestations:
- Registry smoke result:

## Quality evidence

- Blocking CI, browser, visual, SSR/hydration, consumer, audit, and size runs:
- Manual VoiceOver/Safari audit record:
- Manual NVDA/Firefox or Chrome audit record:
- Open P0 defects:
- Open P1 defects:

## Adoption review

- External consumers checked or upgraded:
- API escape hatches or component bypasses:
- Theme overrides that required copied component CSS:
- SSR, hydration, routing, or form-integration issues:
- Missing capability backed by a real workflow:

## Performance and compatibility

- Package and consumer bundle changes from the previous baseline:
- Changes above the 5% review threshold and rationale:
- Weekly Node, Svelte, TypeScript, Vite, and browser warnings:
- Dependency additions, removals, or license changes:

## Follow-up

List each accepted action with an owner and target milestone. Link rejected or
deferred requests to the API, accessibility, maintenance-cost, or consumer
evidence that supports the decision.
