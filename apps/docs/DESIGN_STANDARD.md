# WeBaseUI Documentation Design Standard

This document is the design gate for the public documentation site. It applies to every route, component specimen, transition, illustration, and content change in `apps/docs`.

## Design read

The site is an interactive editorial exhibition for designers and frontend engineers. It combines a precise component reference with kinetic typography, asymmetric composition, restrained material depth, and physically motivated motion.

- `DESIGN_VARIANCE: 9`
- `MOTION_INTENSITY: 8`
- `VISUAL_DENSITY: 4`
- Stack: Svelte 5, native CSS, WeBaseUI components, Lucide icons

## Hard rules

### Icons

- Use Lucide for every interface icon.
- Prefer `WeBaseIcon` and WeBaseUI components that render Lucide internally.
- Do not hand-write SVG paths or mix icon families.
- Do not replace an icon with a Unicode arrow, dingbat, or pictographic symbol.
- `logo.svg` is a brand asset and is the only SVG exception in the page chrome.

### No emoji

- Do not use emoji in visible copy, navigation, labels, examples, status messages, empty states, metadata, or decoration.
- Express meaning with a Lucide icon plus clear text when an icon is useful.

### Award-level finish

- Hold the visual system to the finish expected from Awwwards, FWA, and CSS Design Awards daily winners.
- Treat typography, spacing, responsive composition, transitions, loading behavior, focus states, and copy as one designed system.
- Do not ship default framework layouts, generic three-card rows, decorative glass panels, or effects without a content purpose.

### Creative freedom

- Treat the browser as an interactive art canvas.
- Use asymmetric grids, kinetic type, scroll storytelling, spatial transitions, and experimental composition when they clarify hierarchy or narrative.
- Preserve stable navigation, searchable reference content, selectable text, copyable code, and predictable keyboard behavior.

### Immersive coherence

- The page must feel authored as one continuous experience, not assembled from unrelated showcase blocks.
- Component specimens must be real, interactive package imports rather than fake screenshots.
- Advanced rendering must be lazy, optional, and disposable without losing content or functionality.

## Motion contract

- Every animation must communicate hierarchy, storytelling, feedback, or state change.
- Animate only `transform` and `opacity` during continuous motion.
- Do not update Svelte state on every scroll frame.
- Prefer CSS scroll-driven animation or IntersectionObserver for lightweight reveals.
- Use a dedicated animation library only when native CSS cannot express the interaction reliably.
- All motion must collapse to a static or instant equivalent under `prefers-reduced-motion: reduce`.
- Avoid perpetual motion unless it communicates an active system state.

## Accessibility and performance guardrails

- Meet WCAG 2.2 AA for content and controls.
- Maintain visible focus and full keyboard access through every experimental layout.
- Preserve readable order when CSS layout is removed.
- Keep LCP below 2.5 seconds, INP below 200 milliseconds, and CLS below 0.1 at the 75th percentile target.
- Reserve media dimensions and avoid loading heavy rendering logic above the fold unless it is the hero's primary content.
- Support Chromium, Firefox, WebKit, narrow mobile viewports, zoom, dark mode, forced colors, and reduced motion.

## Review checklist

- [ ] All interface icons come from Lucide.
- [ ] No emoji, pictographic symbols, inline SVG icons, or Unicode arrow icons appear in source or visible copy.
- [ ] The page uses real WeBaseUI component specimens.
- [ ] The primary message and first action fit in the initial viewport.
- [ ] The information architecture remains understandable without animation.
- [ ] Each major section uses a deliberate composition rather than repeating one layout pattern.
- [ ] Motion has a documented purpose and reduced-motion fallback.
- [ ] Light and dark themes maintain the same hierarchy and contrast.
- [ ] Mobile layout is explicitly composed, not only stacked by accident.
- [ ] Keyboard, screen reader, zoom, contrast, and Core Web Vitals checks pass.
