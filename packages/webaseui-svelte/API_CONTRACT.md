# WeBaseUI Svelte public API contract

This document is the versioned 0.4 baseline for the public component API. It
describes the behavior consumers may depend on in addition to the generated
TypeScript declarations.

## Shared rules

### Naming and state

- Boolean state uses `open`, `checked`, `selected`, `pressed`, `disabled`, and
  `loading` according to the rendered control.
- Value state uses `value`. Indexed collections use `active`, `open`, or `page`
  because those names describe the component state rather than a data value.
- Mutable public state is implemented with Svelte `$bindable`. A consumer may
  bind it, update it programmatically, or pass an initial value without binding.
- Components normalize invalid public state to a documented safe value. They do
  not keep rendering a selection that is absent from the current collection.

### Events and callbacks

- Public callbacks use Svelte 5 callback props named `on*`.
- Native events on an inner form control remain available through `inputProps`,
  `selectProps`, or `textareaProps`.
- A component callback runs once for the semantic action it names. Incidental
  bubbling from a child element must not be reported as a second semantic action.
- Dialog action callbacks may call `preventDefault()` to keep the dialog open.

### Native attributes and precedence

- Remaining props are spread onto the documented root element.
- `inputProps`, `selectProps`, and `textareaProps` target the inner native form
  control. They own attributes that are not already modeled by a component prop.
- Component props win when the same owned attribute is also present in a native
  prop bag. Owned attributes include value state, `id`, `disabled`, `required`,
  input type, form association, range limits, and validation relationships.
- `class` on the component styles the root. `class` inside a native prop bag
  styles the native control.

### Composition and accessible copy

- A snippet replaces its corresponding string convenience prop. It does not
  render in addition to the string.
- Action controls render only when an actionable callback or an action snippet
  is present. Components do not render enabled inert buttons.
- Default labels are conveniences, not localization locks. Publicly visible or
  assistive copy has a prop when the component supplies a default string.
- Visible numeric copy uses `format*` callbacks when the component supplies a
  default notation. Callbacks receive normalized numeric state and may use the
  consumer's `Intl.NumberFormat`; native numeric values and ARIA ranges remain
  language-independent.
- Generated IDs use Svelte `$props.id()` and may be overridden with `id` when a
  stable relationship is required.

### Direction and high contrast

- Components inherit the nearest computed `direction`; consumers may set
  `dir="rtl"` on the document or any component ancestor without passing a
  component-specific direction prop.
- Layout uses logical inline properties. Directional keyboard behavior follows
  the rendered inline direction, and anchored overlays interpret `start` and
  `end` against that direction.
- `@webaseui/core/tokens.css` maps semantic colors, focus rings, borders, and
  state colors to operating-system colors while `forced-colors: active` is in
  effect. Components do not require color alone to communicate focus or state.

## Component matrix

Every component listed here is exported from `@webaseui/svelte`.

### WeBaseAccordion

- Props: `items` (required), `open=0`, `id=generated`,
  `formatIndex=(index) => two-digit index`, plus root `div` attributes.
- Binding: `open`.
- Composition: no snippets or semantic callbacks.
- Boundary: `open=-1` means all panels are closed. Empty items and invalid,
  fractional, negative-below-`-1`, or out-of-range indexes normalize to `-1`.
- Keyboard: `ArrowDown` and `ArrowUp` move focus with wrapping; `Home` and
  `End` move to the first and last trigger without changing the open panel.

### WeBaseAlert

- Props: `title` (required), `message=''`, `tone='info'`, `dismissible=false`,
  `dismissLabel='Dismiss alert'`, `open=true`, plus root `div` attributes.
- Binding: `open`.
- Snippets: `children` replaces `message`; `actions` supplies action controls.
- Boundary: the root is removed when `open=false`; error tone uses `role=alert`
  and other tones use `role=status`.

### WeBaseBadge

- Props: `label` (required), `variant='canonical'`, `dot=false`, plus root `span`
  attributes.
- Binding and callbacks: none.
- Boundary: the optional dot is decorative and never supplies the label.

### WeBaseBreadcrumbs

- Props: `items` (required), `label='Breadcrumb'`, plus root `nav` attributes.
- Binding and callbacks: none.
- Boundary: the final item renders as the current page even when it has `href`;
  earlier items render as links only when `href` is present.

### WeBaseButton

- Props: `label` (required), `variant='outline'`, `size='md'`, `type='button'`,
  `disabled=false`, `loading=false`, `loadingLabel='Working'`, `icon`,
  `full=false`, `onclick`, plus native button attributes on the root.
- Binding: none. Callback: `onclick`.
- Boundary: loading replaces the label, shows the loader icon, sets
  `aria-busy=true`, and disables the native button.

### WeBaseCard

- Props: `title` (required), `eyebrow='Specimen'`, `body=''`, `variant='paper'`,
  `meta=''`, `action=''`, `onaction`, plus root `article` attributes.
- Binding: none.
- Snippets: `children` replaces `body`; `footer` replaces meta and action output.
- Callback: `onaction`.
- Boundary: the fallback action button exists only when both `action` and
  `onaction` are provided.

### WeBaseCheck

- Props: `label` (required), `checked=false`, `disabled=false`,
  `indeterminate=false`, `description=''`, `inputProps={}`, plus root `label`
  attributes.
- Bindings: `checked`, `indeterminate`.
- Native target: `inputProps` applies to the checkbox.
- Boundary: a user change clears `indeterminate` before forwarding the native
  `change` callback.

### WeBaseDialog

- Props: `open=false`, `title='A quiet confirmation'`,
  `message='Dialogs keep consequential actions in focus.'`, `id=generated`,
  `confirmLabel='Confirm'`, `cancelLabel='Cancel'`, `closeLabel='Close dialog'`,
  `kicker='Dialog / modal'`, plus native dialog attributes on the root.
- Binding: `open`.
- Callbacks: `onconfirm`, `oncancel`, `onclick`, `onclose`.
- Boundary: native `showModal()` owns focus containment, Escape, background
  inertness, and focus restoration. Programmatic `open=false` does not report a
  confirm or cancel action. Preventing an action callback keeps the dialog open.

### WeBaseDivider

- Props: `label=''`, `vertical=false`, plus root attributes.
- Binding and callbacks: none.
- Root: horizontal mode renders a `div` separator; vertical mode renders an
  aria-hidden `span`.

### WeBaseEmptyState

- Props: `kicker='Empty / archive'`, `title='No notes in this drawer'`,
  `message='Start a new note or adjust the current filters.'`,
  `actionLabel='Create note'`, `onclick`, plus root `section` attributes.
- Binding: none.
- Snippets: `children` replaces `message`; `actions` replaces the fallback action.
- Boundary: the fallback action button exists only when `onclick` is provided.

### WeBaseField

- Props: `label` (required), `id=generated`, `placeholder=''`, `help=''`,
  `error=''`, `type='text'`, `value=''`, `required=false`, `disabled=false`,
  `readonly=false`, `requiredLabel='Required'`, `inputProps={}`, plus root `label`
  attributes.
- Binding: `value`.
- Native target: `inputProps` applies to the inner input.
- Boundary: `error` takes precedence over help text and sets the effective
  `aria-invalid` and `aria-describedby` relationship.

### WeBaseIcon

- Props: `name` (required), `size=18`, `strokeWidth=1.7`, `fill='none'`,
  `ariaHidden=true`, plus supported Lucide SVG attributes.
- Binding and callbacks: none.
- Boundary: names are limited to the exported `WeBaseIconName` union. Interface
  icons are decorative by default; consumers must opt out of `ariaHidden` when
  an icon itself carries meaning.

### WeBaseIconButton

- Props: `label` (required), `icon='arrow-up-right'`, `pressed=undefined`,
  `disabled=false`, `onclick`, plus native button attributes on the root.
- Binding: `pressed`. Callback: `onclick`.
- Boundary: undefined `pressed` represents a momentary button. A boolean value
  exposes toggle-button state through `aria-pressed`.

### WeBaseLink

- Props: `href` (required), `label=''`, `variant='inline'`, `icon`,
  `iconPosition` derived from the variant, plus native anchor attributes.
- Binding: none.
- Snippet: `children` replaces `label`.
- Boundary: `back` defaults to `arrow-left`; `action` defaults to
  `arrow-up-right`; explicit `icon` and `iconPosition` win.

### WeBaseLoader

- Props: `label='Loading'`, plus root `div` attributes.
- Binding and callbacks: none.
- Boundary: the root is a named `role=status`; animation becomes static under
  reduced motion.

### WeBasePagination

- Props: `total=5`, `page=1`, `label='Pagination'`,
  `previousLabel='Previous page'`, `nextLabel='Next page'`,
  `getPageLabel=(page) => 'Page {page}'`,
  `formatPage=(page) => two-digit page`, plus root `nav` attributes.
- Binding: `page`.
- Boundary: `total` becomes an integer page count with a minimum of one. `page`
  is clamped to the inclusive range `1..pageCount`.

### WeBaseProgress

- Props: `value=62`, `label='Progress'`, `tone='brand'`, `compact=false`,
  `formatValue=(value) => '{value}%'`, plus root `div` attributes.
- Binding and callbacks: none.
- Boundary: the rendered and announced value is clamped to `0..100`.

### WeBaseRadio

- Props: `name`, `label`, and `value` (required), `selected=''`,
  `disabled=false`, `description=''`, `inputProps={}`, plus root `label`
  attributes.
- Binding: `selected`.
- Native target: `inputProps` applies to the radio input.
- Boundary: radios that share `name` and the same bound `selected` value behave
  as one native group and participate in form serialization.

### WeBaseSectionHeader

- Props: `kicker` and `title` (required), `note=''`, `headingId`, plus root
  `header` attributes.
- Binding, callbacks, and snippets: none.
- Boundary: `headingId` is the supported hook for a parent section using
  `aria-labelledby`.

### WeBaseSelect

- Props: `label` and `options` (required), `id=generated`, first option value as
  the initial `value`, `help=''`, `error=''`, `disabled=false`, `name`, `form`,
  `required=false`, `placeholder='Select an option'`, `selectProps={}`, plus root
  `div` attributes.
- Binding: `value`.
- Native target: `selectProps` applies to the synchronized native select.
- Boundary: option values must be unique. Disabled options are not selectable.
  A value absent from `options` displays the placeholder and the native select
  has no selected option. `name` and `form` preserve native form behavior.
- Positioning: the listbox stays in the component DOM, uses the native manual
  Popover top layer when available, and falls back to fixed positioning. It
  matches the trigger width, flips above the trigger when the viewport has more
  room there, shifts horizontally inside the visual viewport, and follows the
  anchor through scroll, resize, and size changes.
- Direction: trigger content, the selection mark, option motion, and listbox
  inline alignment follow the nearest computed direction. In RTL, the listbox
  `start` edge is its right edge and remains aligned to the trigger's right edge.
- Keyboard: printable characters open and highlight an enabled prefix match.
  Characters typed within 500ms form a query; repeating one character cycles
  through matching options, while disabled matches are skipped.

### WeBaseSkeleton

- Props: `rows=3`, `media=true`, `label='Loading content'`, plus root `div`
  attributes.
- Binding and callbacks: none.
- Boundary: `rows` is a non-negative integer count. Animation becomes static
  under reduced motion.

### WeBaseSlider

- Props: `label` (required), `value=48`, `min=0`, `max=100`, `step=1`,
  `unit='%'`, `id=generated`, `disabled=false`,
  `formatValue=(value, unit) => '{value}{unit}'`, `inputProps={}`, plus root
  `label` attributes.
- Binding: `value`.
- Native target: `inputProps` applies to the range input.
- Boundary: non-finite limits and values normalize safely, `max` remains greater
  than `min`, step stays positive, and value is clamped to the effective range.

### WeBaseSwitch

- Props: `label` (required), `checked=false`, `disabled=false`,
  `description=''`, `inputProps={}`, plus root `label` attributes.
- Binding: `checked`.
- Native target: `inputProps` applies to the checkbox with `role=switch`.

### WeBaseTabs

- Props: `items` (required), `active=0`, `panels=[]`, `label='Tabs'`,
  `id=generated`, plus root `div` attributes.
- Binding: `active`.
- Boundary: empty items normalize `active` to `-1`. Invalid indexes normalize to
  `0` when items exist. Missing panel text falls back to the corresponding item.
- Keyboard: `ArrowLeft` and `ArrowRight` move focus with wrapping and activate
  the focused tab; their previous/next meaning reverses in RTL. `Home` and `End`
  activate the first and last tab.

### WeBaseTag

- Props: `label` (required), `href`, `variant='neutral'`, `count`,
  `selected=false`, plus supported anchor metadata and root attributes.
- Binding and callbacks: none.
- Root: an `a` when `href` is present, otherwise a `span`.

### WeBaseTextarea

- Props: `label` (required), `id=generated`, `placeholder=''`, `value=''`,
  `help=''`, `maxLength=240`, `error=''`, `required=false`, `disabled=false`,
  `readonly=false`, `requiredLabel='Required'`,
  `formatCount=(current, maximum) => '{current} / {maximum}'`,
  `textareaProps={}`, plus root `label` attributes.
- Binding: `value`.
- Native target: `textareaProps` applies to the textarea.
- Boundary: `error` takes precedence over help text; the visible counter uses
  the bound value and effective maximum length.

### WeBaseToast

- Props: `open=false`, `title='Saved locally'`,
  `message='The specimen is ready for review.'`, `tone='success'`, `duration=0`,
  `dismissLabel='Dismiss notification'`, plus root live-region attributes.
- Binding: `open`.
- Boundary: duration at or below zero is persistent. Pointer hover and keyboard
  focus pause a positive countdown. Error tone uses an assertive live region.

### WeBaseTooltip

- Props: `label` and `text` (required), `id=generated`, plus root `span`
  attributes.
- Binding and callbacks: none.
- Boundary: hover and focus show a dismissible tooltip. Escape dismisses visible
  content without moving focus, including when the tooltip was opened by hover;
  dismissal resets after pointer leave and blur. The tooltip remains hoverable
  while the pointer moves into its content.
- Positioning: the tooltip stays in the component DOM, uses the native manual
  Popover top layer when available, and falls back to fixed positioning. It
  flips between top and bottom, shifts horizontally inside the visual viewport,
  follows the trigger through scroll, resize, and size changes, and resolves
  inline alignment against the trigger's computed direction.

## Change policy

- Adding an optional prop with a compatible default is normally minor.
- Fixing behavior to match this contract is normally patch unless consumers are
  known to depend on the incorrect behavior.
- Removing or renaming a prop, binding, callback, snippet, root element, native
  attribute target, or documented boundary behavior requires a deprecation
  window and a major-version review.
- Every incompatible change requires a Changeset and a migration example.
