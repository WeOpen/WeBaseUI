---
"@webaseui/svelte": patch
---

Share manual-popover synchronization and collision-aware floating positioning
between Select and Tooltip. Overlays now flip and shift within the visual
viewport, follow nested scrolling and resize changes, keep Select trigger width,
and retain a fixed-position fallback when the Popover API is unavailable.
