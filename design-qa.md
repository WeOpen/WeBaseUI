# Design QA

## Source Visual Truth

- Desktop landing: `docs/UI/ChatGPT Image 2026年8月19日 07_09_00.png` (1487 x 1058 px)
- Mobile landing: `docs/UI/ChatGPT Image 2026年8月19日 07_09_05.png` (853 x 1844 px, normalized to 426 x 922 CSS px for comparison)
- Desktop component reference: `docs/UI/ChatGPT Image 2026年8月19日 07_09_09.png` (1487 x 1058 px)
- Mobile component reference: `docs/UI/ChatGPT Image 2026年8月19日 07_09_13.png` (853 x 1844 px, normalized to 426 x 922 CSS px for comparison)

## Implementation Evidence

- Desktop landing: `qa-implementation-home-desktop.png` (1487 x 1058 px, CSS viewport 1487 x 1058, device scale 1)
- Mobile landing: `qa-implementation-home-mobile.png` (426 x 922 px, CSS viewport 426 x 922, device scale 1)
- Desktop component reference: `qa-implementation-component-desktop.png` (1487 x 1058 px, CSS viewport 1487 x 1058, device scale 1)
- Mobile component reference: `qa-implementation-component-mobile.png` (426 x 922 px, CSS viewport 426 x 922, device scale 1)

## States And Interactions

- Landing page at `/` with `Preview` tab selected and density at 64%.
- Component reference at `/components/button` with `WeBaseButton` selected.
- Verified global search, History API navigation, direct nested-route reloads, component filtering, group expansion, copy feedback, theme switching, mobile navigation, mobile component selection, reduced motion, and no horizontal overflow.
- Browser console check returned no warnings or errors in the final captured tab.

## Comparison

Compared each source visual with its same-state implementation capture using side-by-side composite images during QA. The required fidelity surfaces were reviewed explicitly:

- Typography: editorial display face, compact mono labels, hierarchy, wrapping, and readable mobile scale.
- Spacing and layout: two-column desktop composition, proof rail, Foundation reveal, sticky component sidebar, and mobile vertical rhythm.
- Colors and tokens: paper/surface neutrals, navy brand signal, ink hierarchy, success field, borders, and focus states.
- Image and asset fidelity: the prototypes use UI surfaces and icons rather than raster imagery; implementation uses the existing logo and Lucide-backed `WeBaseIcon` assets.
- Copy and content: hero contract message, component API labels, usage examples, version and install copy.

## Findings

No actionable P0, P1, or P2 mismatches remain after the final responsive pass. The desktop hero height and component-page top padding were tightened to restore the prototype's visible section rhythm. Mobile controls were compressed and the component selector was composed as a single-row control to match the mobile reference. Landing reveals now initialize per mounted node, so returning from a component route cannot leave the landing page partially transparent.

Seven visual baselines affected by the approved prototype pass were reviewed and
regenerated: Alert, Button light/dark/focus, Select mobile/open, and Dialog
open. The other 40 visual cases remained unchanged, and the complete suite
passed after the targeted update.

## Verification

- `npm run check`
- `npm run check:consumer`
- `npm run check:changeset`
- `npm audit --audit-level=high`
- `npm run test:browser` (102 passed across Chromium, Firefox, and WebKit)
- `npm run test:visual` (47 passed)
- Serious and critical Axe checks passed in the docs browser suite.
- `git diff --check` passed.

final result: passed
