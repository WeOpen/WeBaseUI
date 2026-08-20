# Screen-reader release audit

Complete this audit for every release candidate. Automated axe and keyboard
checks remain mandatory, but they do not replace listening to the accessibility
tree through supported assistive technology.

## Required environments

| Environment | Browser | Input | Required result |
| --- | --- | --- | --- |
| macOS VoiceOver | Safari from a supported stable major | VoiceOver keys and keyboard | All scenarios below pass |
| Windows NVDA | Firefox or Chrome from a supported stable major | NVDA browse/focus modes and keyboard | All scenarios below pass |

Record the operating system, assistive-technology version, browser version,
package version, tester, date, and issue link for every failure. A recording may
supplement the notes, but the written result must identify the announced name,
role, value or state, and focus destination.

## Scenario matrix

| Surface | Procedure | Expected announcement and behavior |
| --- | --- | --- |
| Button and IconButton | Focus, activate, then test disabled, loading, and pressed examples | Name and button role are announced once; disabled, busy, and pressed states are exposed when present |
| Field and Textarea | Read label, help, required, error, count, and disabled states; edit and reset a containing form | Label and description relationships are clear; invalid and required states are announced; editing is not duplicated |
| Check, Radio, Switch, and Slider | Move through each control, change its value, and test disabled or indeterminate states | Role, accessible name, current state or value, group context, and changes are announced |
| Select | Open with keyboard, move through enabled and disabled options, use typeahead, choose an option, and close with Escape | Combobox state, active option, position, disabled state, selection, and collapse are announced; focus returns to the trigger |
| Tabs and Accordion | Traverse with arrow keys, Home, and End; activate or collapse content | Tab/disclosure role, selected or expanded state, position, and associated panel are understandable |
| Dialog | Open from a known button, inspect title and description, cancel with Escape, confirm, and close with the close control | Modal context and title are announced; background content is unavailable; every close path returns focus to the opener |
| Tooltip | Focus and hover the trigger, dismiss with Escape, then move focus away | Trigger description is available without trapping focus; dismissed content is no longer announced |
| Alert and Toast | Trigger info, warning, error, and timed examples; pause a toast by focus or hover | Status or alert copy is announced once without moving focus; time-sensitive content remains available while paused |
| Breadcrumbs, Link, Pagination, and Tag | Navigate landmarks and current/selected states | Navigation labels, destinations, current page, and disabled controls are distinguishable |
| Loader, Progress, Skeleton, and EmptyState | Inspect loading, progress, completed, and empty examples | Decorative output stays silent; meaningful status/value text is announced without repetition |

## Release record

Copy this table for each candidate. `Blocked` requires a linked P0/P1 decision;
an RC cannot pass with a blocked required environment.

The candidate packages prepared for this audit are `@webaseui/core@0.2.0-next.0`
and `@webaseui/svelte@0.4.0-next.0`.

| Candidate | Environment | Versions | Tester and date | Result | Issues |
| --- | --- | --- | --- | --- | --- |
| core@0.2.0-next.0 + svelte@0.4.0-next.0 | VoiceOver / Safari | macOS 26.5.2; Safari 26.5.2; VoiceOver 10 | Pending human test | Pending | None |
| core@0.2.0-next.0 + svelte@0.4.0-next.0 | NVDA / Firefox or Chrome | Windows, browser, and NVDA versions to record | Pending human test | Pending | None |

## Sign-off rules

- Every scenario must pass in both required environments, or have a documented
  browser/assistive-technology defect with an equivalent usable path and an RC
  risk decision.
- Any focus loss, inaccessible name failure, state mismatch, or unavailable
  operation is P0 or P1 until triaged.
- Fixes restart the affected environment and component scenario; changes to
  shared overlay, focus, collection, or form behavior restart both environments.
- Attach the completed table to the minor release review and update the support
  matrix only after both records are complete.
