# Adoption and Upgrade Matrix

This document records which applications currently consume WeBaseUI, what was
actually verified, and which adoption claims are still pending. It is an
evidence log, not a list of intended integrations.

## Status at 2026-08-17

| Consumer | Runtime | WeBaseUI packages | Role | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| xue (external checkout) | SvelteKit / Svelte 5 | `@webaseui/core@0.1.0`, `@webaseui/svelte@0.3.2` | External production-oriented SvelteKit consumer | `npm run check` passed with 0 Svelte diagnostics; package imports and design-system routes are present | Verified |
| FruitsAI/Fig at `3f37914` (disposable checkout) | SvelteKit / Svelte 5.56.6 / Cloudflare adapter | Registry `@webaseui/core@0.1.0`, `@webaseui/svelte@0.3.2` | External content, navigation, and search consumer trial | Button and Field replaced real category/search controls; check, lint, SSR build, Chromium interaction, axe, mobile reflow, and tree-shaking checks passed | Verified external trial |
| Sebastian1com/evaluacion-sveltekit-crud at `673cd63` (disposable checkout) | SvelteKit / Svelte 5.43.14 / form actions | Workspace candidate tarballs with version fields `0.1.0` / `0.3.2` | External create/read/update/delete workflow trial | Field, Textarea, and Button preserved native names, FormData, enhanced action submission, SSR build, axe subtree, mobile reflow, and tree shaking | Verified candidate trial |
| `examples/webaseui-svelte-consumer` | Vite / Svelte 5 | Registry-resolved package versions | Maintainer fixture for packed-artifact and registry smoke checks | `npm run check:registry -- --tag=latest` installed both packages from npm and built the fixture without workspace links | Verified fixture |
| WeMail | React | Does not consume `@webaseui/svelte` | Separate React application | Repository architecture is React; no Svelte package boundary exists | Not applicable |
| Fangcun | Next.js / React | Does not consume `@webaseui/svelte` | Separate React application | Repository architecture is React; no Svelte package boundary exists | Not applicable |

The two React applications remain useful product contexts, but they do not
count toward the Svelte consumer requirement. A future React adapter must first
meet the framework-neutral token and behavior contracts; this matrix must not be
used to imply that adapter work has started.

## Reproducible checks

Run these from the WeBaseUI repository:

```sh
npm run check:consumer
npm run check:registry -- --tag=latest
```

The registry smoke test resolves the current `latest` dist-tag for both public
packages, installs those versions into a temporary copy of the maintainer
fixture, builds it, and fails if either package resolves to this workspace.

Run the external consumer check without changing its working tree:

```sh
cd /Users/willxue/will/github/xue
npm ls @webaseui/core @webaseui/svelte --depth=0
npm run check
```

At the status date above, this produced:

```text
@webaseui/core@0.1.0
@webaseui/svelte@0.3.2
svelte-check found 0 errors and 0 warnings
```

The xue checkout already contains unrelated user changes. Adoption checks are
read-only and must not reset, clean, or otherwise overwrite that worktree.

## Upgrade rehearsal

The historical xue upgrade below satisfies the pre-1.0 minor-to-minor rehearsal.
Repeat the same process for every future minor in a disposable branch or
worktree:

```sh
npm install @webaseui/core@<new-core-minor> @webaseui/svelte@<new-svelte-minor>
npm run check
npm run test:e2e
npm run build
```

Record the previous and new versions, any deprecation output, changed token or
component behavior, bundle-size result, and the exact rollback command. Do not
use a workspace link for this rehearsal; the purpose is to exercise the public
registry artifacts and the consumer's package boundary.

### 2026-08-17 xue minor upgrade rehearsal

The historical xue commit `2cf5bdd` was archived into a disposable checkout. It
was pinned to `@webaseui/svelte@0.2.0` and passed the baseline `npm run check`
and `npm run build`. The same checkout then upgraded to exact registry versions
`@webaseui/core@0.1.0` and `@webaseui/svelte@0.3.2`:

| Check | Result |
| --- | --- |
| `npm ls @webaseui/core @webaseui/svelte --depth=0` | Exact `0.1.0` / `0.3.2` |
| `npm run check` | Passed; 0 Svelte diagnostics |
| `npm run build` | Passed; static production build generated |
| `npm run test:e2e` | 59/59 passed, including Chromium, Firefox smoke, and WebKit smoke |

The original xue checkout was never modified. To roll back a real branch after
this rehearsal, restore its manifest and lockfile, then reinstall:

```sh
git restore package.json package-lock.json
npm ci
```

## 2026-08-17 Fig registry adoption trial

FruitsAI/Fig commit `3f37914a76a0ae2a0c04f9f29c84529285816990`
was cloned into a disposable directory. Exact public registry packages were
installed, core tokens and theme CSS were layered before the application's own
theme, and the article category buttons and search field were replaced with
`WeBaseButton` and `WeBaseField`. The source checkout at
`/Users/willxue/will/FruitsAI/Fig` was not modified.

| Check | Result |
| --- | --- |
| `npm run check` | Passed; 0 errors and 0 warnings |
| `npm run lint` | Passed; Prettier and ESLint clean |
| `npm run build` | Passed; SvelteKit SSR and Cloudflare adapter output generated |
| Chromium interaction | Five category controls, search filtering, existing lightbox open/close, and pressed state passed |
| Accessibility and mobile | 0 serious/critical axe violations with reduced motion; no horizontal overflow at 390 x 844 |
| Tree shaking | Field and Button output present; Select, Dialog, and Tooltip signatures absent |
| Total client JS/CSS gzip | 79,717 B baseline to 83,214 B integrated, +3,497 B (+4.4%) |

The published confirmation-oriented Dialog does not replace Fig's media
lightbox, which needs arbitrary image, caption, and future zoom behavior. That
remains an application composition rather than a forced component bypass. A
generic media-dialog proposal needs another concrete consumer and its own API
and accessibility specification.

## 2026-08-17 CRUD candidate adoption trial

Public repository `Sebastian1com/evaluacion-sveltekit-crud` commit
`673cd6347b57c4ad51bfe7d334056c4e15a28046` was cloned into a disposable
directory. Unlike the Fig trial, it installed tarballs packed from this
workspace so the unreleased native form-prop contract could be exercised. The
tarball version fields remain `0.1.0` / `0.3.2`; this evidence must not be
misread as a registry release.

The create form used `WeBaseField`, `WeBaseTextarea`, and `WeBaseButton` while
the host application's existing edit/delete flows remained intact:

| Check | Result |
| --- | --- |
| Candidate artifact boundary | Installed local tarballs; no workspace symlink or deep component import |
| Svelte check | Svelte Check 4.3.4 with TypeScript 5.9.3 passed; 0 errors and 0 warnings |
| SSR production build | Passed with Svelte 5.43.14 and Vite 7.2.4 |
| Native form contract | `inputProps.name=title` and `textareaProps.name=body` appeared in `FormData`; max length and submit type were preserved |
| Enhanced action | A real SvelteKit `?/crear` form action returned HTTP 200 |
| Accessibility and mobile | Candidate form subtree had 0 serious/critical axe violations; no horizontal overflow at 390 x 844; no browser console errors |
| Tree shaking | Field, Textarea, and Button output present; Select, Dialog, and Tooltip signatures absent |
| Total client JS/CSS gzip | 37,097 B baseline to 49,165 B integrated, +12,068 B (+32.5%) |

The percentage increase is large because the host is a very small unstyled
demo and this is its first complete theme plus component dependency. The
absolute delta and absence of unused overlay code are the useful signals; the
result is recorded for review rather than normalized into the repository's
existing consumer baseline. A full-page axe scan also found the host's
pre-existing missing document title, so the component result is scoped to the
integrated form subtree and does not claim the host application is globally
accessible.

The two-application and content/navigation plus form/CRUD adoption profiles are
now covered by external application trials. This closes the technical 1.0
adoption gate; it does not replace registry publication, provenance, release
smoke, or the manual assistive-technology sign-off.

## Adoption feedback ledger

Update this table after each minor release or upgrade rehearsal.

| Area | Current observation | Follow-up |
| --- | --- | --- |
| API escape hatches | All three external trials used package-root imports; the CRUD form validated native prop bags without wrapper DOM workarounds | Record any new root or native-prop escape hatch before adding a component |
| Theme overrides | xue and Fig layer application composition CSS over shared tokens; neither copied component CSS | Record token overrides that require component CSS copies; prefer a new semantic token |
| SSR and routing | xue E2E/build, Fig Cloudflare SSR build, and the CRUD form-action build passed | Repeat the relevant consumer build during each minor upgrade |
| Bundle impact | Fig added 4.4% total client gzip; the tiny CRUD demo added 32.5% on first theme adoption while unused overlays remained tree-shaken | Keep repository size gates authoritative and review absolute external deltas after each minor |
| Missing capability | Fig's media lightbox remains application-specific; no second consumer currently justifies a generic media dialog or a React adapter | Require a concrete second workflow plus API/a11y proposal before expanding the public surface |
