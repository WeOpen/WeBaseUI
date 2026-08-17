---
"@webaseui/svelte": patch
---

Make Select typeahead refine multi-character queries, cycle repeated-character
matches, skip disabled options, and clean up its reset timer through a reusable
internal controller.
