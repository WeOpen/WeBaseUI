# Support Matrix

This is the frozen 1.0 support contract. Machine-readable values live in
[`support-policy.json`](./support-policy.json) and are checked by
`npm run check:support`. A supported version is part of a continuously tested
range, not a claim that every application toolchain combination is defect-free.

| Surface | 1.0 support position | Current evidence | Status |
| --- | --- | --- | --- |
| Svelte | Peer range `>=5.20.0 <6`; Svelte 4 is out of scope | Packed consumers typecheck and build with Svelte 5.20.0 and the repository-current 5.56.8 | Frozen and validated |
| Node.js | Repository, consumer, and release tooling run on `^22.13.0 || ^24.0.0` | Blocking CI uses 22.13; the weekly compatibility workflow runs the same package gates on Node 24 | Frozen and validated |
| TypeScript | `>=5.5.4 <7` | Packed consumers typecheck with the minimum 5.5.4 and repository-current 6.0.3 compilers | Frozen and validated |
| Vite / Svelte plugin | Vite 6 with plugin 5.1.1 through Vite 8 with plugin 7.2.0 while they remain compatible with supported Svelte 5 | Minimum and current packed-consumer fixtures typecheck and build | Frozen and validated |
| Rendering | SSR-safe module loading and warning-free client hydration | Dedicated server-render and hydration fixtures run in Chromium, Firefox, and WebKit | Frozen and validated |
| Browsers | Chromium-family, Firefox, and Safari/WebKit current and previous stable major releases | Playwright 1.62.1 currently validates Chromium 151.0.7922.34, Firefox 153.0, and WebKit 26.5; the weekly non-blocking job exercises the latest Playwright engines | Frozen policy; pinned engines validated |
| Accessibility modes | WCAG 2.2 AA behavior for keyboard, focus, RTL, forced colors, reduced motion, coarse pointer, 200% reflow, and documented equivalent input | axe, keyboard, layout, and visual suites cover the automated surface | Frozen automated contract; manual screen-reader sign-off required per RC |

## Browser version policy

"Current and previous stable major releases" is evaluated when an RC or minor
release is cut, not when a user first reports an issue. Updating Playwright must
refresh the validated engine versions above and pass all three behavior suites.
Chromium coverage represents Chrome and Edge engine behavior; browser-specific
integration defects are still triaged separately.

## Lifecycle policy

- The latest `0.x` minor is the supported development line until 1.0.
- After 1.0, the latest minor of the current major receives routine fixes. The
  immediately previous major receives critical security fixes for six months
  after the next major is released.
- Security reports are acknowledged within five business days. Confirmed P0
  issues receive an immediate mitigation or release plan; P1 issues receive a
  target release within ten business days unless an upstream dependency blocks it.
- A major release is the normal removal window for deprecated public API.
  Deprecations remain documented and functional for at least one minor release
  before 1.0 and for at least six months after 1.0.
- Node, TypeScript, Svelte, and browser windows are reviewed during every minor
  release review. Dropping a supported version requires a Changeset and migration
  note.

## RC sign-off

The automated support contract is frozen. Before declaring an RC ready, attach
the completed VoiceOver/Safari and NVDA/Firefox or Chrome records from
[`SCREEN_READER_AUDIT.md`](./SCREEN_READER_AUDIT.md), the two external consumer
records from [`ADOPTION_MATRIX.md`](./ADOPTION_MATRIX.md), and a release review
created from the repository issue template.
