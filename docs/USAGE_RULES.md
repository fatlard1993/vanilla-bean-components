# Usage Rules

How the components are meant to be chosen and combined in an app. The component READMEs say what each one does; this says which one to reach for, and what a misuse looks like. It is written for two readers: a person learning the library, and an audit that reads an app's source and reports where it strays.

The rules were drawn from the apps built on this library, not invented: each settled rule is a pattern most of them already follow. Where the apps disagreed, the question was settled and the library changed to match (dialog button order, error toasts, toggles); what is still undecided is listed under [Open questions](#open-questions), and an audit flags neither side of it.

Each rule has an id, a status and a check:

- **settled**: most apps follow it, or the apps disagreed and it was decided; the library agrees, and a deviation is a finding
- **proposed**: the library intends it but few apps show it yet, or it waits on a library change; report, don't fail
- **lint**: a static pattern can find it, and `eslint.usage.config.cjs` does, as the warning `vbc/<id>`, in an app that spreads it into its lint config (it is opt-in). It sees one file at a time, so it finds a component only where that file shows what it is (made there, or through the file's own `styled()` or subclass of it); the audit covers the rest. It leaves test files and `devTools` folders alone
- **audit**: it takes judgment about what the code is for
- **since 7.2**: the rule leans on something added in that version. On an app with an older install, report it as "upgrade, then fix", not as a failure: the fix may not exist there yet.

A view a framework or shared package supplies is audited once, in that package. An app is audited for what it passes in and for the views it builds; a finding the app could fix through an option the framework gives is the app's.

A game's play screens, and a screen built picture-first for players who don't read, may take their own layout, sizes and choice controls: layout.view-shape, the sizes in structure.theme-tokens, action.label-wording and form.single-choice don't bind them. The rules on naming, pressing, focus and reporting failure still do.

A pattern counts wherever it is written, whether lint finds it or the audit does. When an app's own helper produces it (an `element()` that builds raw fields, a `button()` that sets `.disabled`, a `Screen()` that builds every view's bar by hand), report it once at the helper with the number of call sites, not at each caller and not as clean.

## Overlays and feedback

The choice, by what the moment is:

| The moment | Reach for |
| --- | --- |
| A yes-or-no question before a consequential action | `Dialog.confirm` |
| Creating or editing a record in a dialog (including settings, a login dialog) | FormDialog; on a page of its own, a Form |
| Showing something to read or work through: a viewer, an import, a confirm that needs a checkbox | Dialog |
| A quick-entry panel on a phone, opened from a floating button (`removeOnClose` if it's made for one use) | BottomSheet |
| The outcome of an action taken outside a dialog | Notify |
| A list or view with nothing to show: loading, empty, no match, failed | EmptyState |
| A menu off a button or a right-click | ContextMenu |

**overlay.confirm-not-handbuilt** · settled · audit: Ask a yes-or-no question with `Dialog.confirm`, not a Dialog given two buttons and a resolver.

**overlay.confirm-wording** · settled · audit: The header is the question ("Delete this bookmark?") and `confirmLabel` is the verb ("Delete"). Never "OK" or "Yes": a verb says what will happen, so the answer doesn't depend on reading the header.

**overlay.danger-before-irreversible** · settled · audit: An action that can't be undone (a delete with no undo, a dropped stash, an overwrite) is confirmed first, and the confirm carries `intent: 'danger'`. A delete or overwrite that happens on press with no confirm and no undo is a finding, whatever its color; so is danger coloring set through `style` or a class instead of `intent`. One that can be undone is not confirmed: it is toasted with Undo (overlay.notify-undo). Confirming and then offering Undo asks twice.

**overlay.button-order** · settled · since 7.2 · audit: Wherever a set of buttons ends an edit or a question (a dialog's footer, an inline Save/Cancel pair), the safe way out comes before the action: Cancel, then the verb, the main verb last. `Dialog.confirm` and FormDialog order theirs so (FormDialog: Delete, Cancel, Save, with Delete set apart); a dialog's own `buttons` array follows suit, and an extra action ("Mark resolved") sits between Cancel and the main verb.

**overlay.record-in-formdialog** · settled · audit: A dialog that creates or edits a record is a FormDialog. Save/Delete/Cancel built on a plain Dialog loses what FormDialog gives: it stays open when the save fails, and shows why. A dialog that lists many records is a Dialog; editing one of them opens a FormDialog, or a Form inside the row. A settings panel whose changes take effect as they're made, with no Save, is a Dialog of labelled fields and a Close; FormDialog is for changes that wait for Save. Don't mix the two in one dialog.

**overlay.save-failure-in-form** · settled · audit: A failed save is reported inside the form (a field's `validate`, or FormDialog's failure line), not in a toast that leaves the user guessing which field. FormDialog fills its failure line itself when `onSave` throws or returns the failed request: write nothing into `failure.elem` by hand.

**overlay.dialog-size-by-content** · settled · audit: A form is `'fit'` at any length: it hugs its content and scrolls once taller than the screen. `'large'` is for what needs the width: viewers, tables, imports. `'small'` (the default) and `'standard'` are fixed boxes, right for content of a known size such as a short message. A form in `'large'` (a one-field dialog filling the screen) is a finding. Don't set width or height through `style`.

**overlay.notify-failure** · settled · audit: A failed action gets `new Notify({ intent: 'danger', content: '<what failed>: <reason>' })`, with the reason whenever one is known (`textContent` instead of `content` is fine). A failure that isn't reported at all is a finding: an empty `.catch(() => {})` on something the user is waiting on, or a success toast after a failure was swallowed. A background fetch the user never asked for may fail quietly.

**overlay.notify-error-stays** · settled · since 7.2 · audit: A warning or danger toast keeps its default and stays until pressed. Notify counts a repeated message on the toast already showing, and folds a long stack behind "+N more", so a timeout isn't needed to keep the corner clear. A `timeout` on one is right only when the toast isn't the one place the problem shows: the app is retrying and will say if it gives up, the failure also shows where it happened, or a later success replaces it.

**overlay.notify-intents** · settled · audit: `success`: it's done. `warning`: it didn't happen, and nothing broke (refused, a precondition unmet, partly done). `info`: a neutral note. `danger`: it failed.

**overlay.notify-undo** · settled · audit: An action that can be undone is toasted with `actions: [{ textContent: 'Undo', onPointerPress }]` rather than confirmed first, however much it touches: the undo is the safety, and a confirm on top of it is a finding.

**overlay.notify-not-progress** · settled · audit: Don't hold a Notify open as a progress indicator ("Uploading…", "Finding your location…") and destroy it by hand. A view's loading state is EmptyState's `loading`; an action's is its Button disabled while it runs.

**overlay.menu-anchored** · proposed · audit: A menu opened from a button is opened with `menu.open({ anchor: button })`, which ties the menu to the button: it toggles from it and tells assistive tech that it's open. Opening it at the click's `x`/`y` loses both.

**overlay.popover-close** · settled · lint: Close a Popover, ContextMenu, Notify or Tooltip with `close()` or `destroy()`. `elem.remove()` skips its cleanup and the `close` that `onClose` listens for.

**overlay.emptystate-options** · settled · lint: EmptyState takes `title` and `message`, not Dialog's `header` and `body`; given the wrong names it shows nothing.

**overlay.emptystate-four-states** · settled · audit: A view that fetches has four states, each an EmptyState: `loading: true` while fetching; then empty, no match, or failed. A view fed live updates has the same until its first data arrives, and the failed state when the feed drops.

**overlay.emptystate-failed** · settled · audit: A failed load: icon `triangle-exclamation`, a title saying it failed, the reason as `message`, and `action: { textContent: 'Try again' }`.

**overlay.emptystate-empty-vs-nomatch** · settled · audit: "Nothing yet" gets an icon from the domain and names how to make the first one. "Nothing matches" gets `magnifying-glass` and says what was searched for.

## Actions and navigation

**action.press-handler** · settled · audit: A press is `onPointerPress`, given as an option or called on the component. It makes an element that isn't natively pressable answer Enter and Space, and its listener is removed when the component is destroyed; an `addEventListener('click')` on `button.elem` gets neither guarantee, and `onPointerDown`/`onPointerUp` fire on a touch that was meant as a scroll. An app's own `onClick` prop handed on to `onPointerPress`, and a map or canvas library's own events, are not findings. A control that acts while it's held (thrust, a repeating key) is still a Button and may listen to `pointerdown` and `pointerup` itself; it answers Space or Enter held down the same way.

**action.primary-filled** · settled · audit: A view's main or confirming action is a default (filled) Button; the other tools beside it are `variant: 'flat'`. More than one filled Button in a toolbar is worth a look.

**action.icon-only-flat** · settled · audit: A Button with only an icon is `variant: 'flat'`, unless it is the view's main add action.

**action.icon-only-named** · settled · lint: A Button or Link whose visible content isn't words (an icon, a sprite or image, an emoji, a color swatch) has a name: a `tooltip`, a `title` or an `aria-label`. Any of the three will do; the tooltip names it through `aria-labelledby`. A Keyboard key is a Button, and an icon-only key is named the same way. Lint finds a Button given `icon` and no text; the other kinds take the audit.

**action.icon-option** · settled · lint: A Button's or Link's glyph goes in `icon`, not in an appended Icon or `<i>`. Appended, the Button doesn't know it's icon-only and loses the square shape and the spacing.

**action.label-wording** · settled · audit: Labels are sentence case and start with a verb ("Add a game", "Copy link"). No padding spaces to push the label off the icon.

**action.intent-is-effect** · settled · audit: A Button's `intent` says what pressing it does. It doesn't show that a toggle is on: `success` meaning "selected" is a finding.

**action.toggle-pressed** · settled · since 7.2 · lint: A Button that stays on or off shows it with `pressed: true|false`, set from the state it toggles. A class of the app's own (`selected`, `active`), a swapped variant, intent or icon, or `disabled` standing for "on" is a finding: it looks on without saying so. A Keyboard key that latches (shift, caps) is a Button too. Lint finds a state class added to a Button it can see; a swapped variant, intent or icon takes the audit.

**action.chip-is-choice** · settled · since 7.2 · audit: `variant: 'chip'` is a choice: a filter, or one of a few options shown together, each a `pressed` toggle. A small action (Refresh, Copy link, Accept all) is `size: 'small'` in whatever variant fits, not a chip.

**action.disabled-option** · settled · lint: Disable through the `disabled` option, not `button.elem.disabled`, which skips `aria-disabled` and the styles.

**action.link-navigates** · settled · audit: Going somewhere is a Link (an anchor with an `href`); doing something is a Button. A navigation that should look like a button is `new Link({ variant: 'button' })` (or `'flat'`, `'raised'`), so it still opens in a new tab and shows its address.

**action.card-navigates-as-link** · settled · since 7.2 · audit: A Card that goes somewhere is `tag: 'a'` with an `href` (it answers the pointer by itself), not an `onPointerPress` that calls the router.

**action.link-tooltip-off-in-nav** · settled · audit: A Link in a nav bar or in-app navigation sets `tooltip: false`; its default tooltip, a small link icon on hover that marks it as a link, is for links in prose. `false` or `null` turns it off.

**action.no-handbuilt-button** · settled · lint: No `<button>` built by hand, through `tag: 'button'` on another component (`styled(Card, css, { tag: 'button' })` too) or `document.createElement('button')`; use Button. An element that must not look like a button can still be a Button with its own styles.

**action.icon-meaning-named** · settled · audit: A standalone Icon beside visible text is decoration and hides itself from assistive tech. An Icon that means something on its own (a status, a lock) has an `aria-label` or text beside it.

**action.nav-current** · proposed · audit: The nav item for the view on screen carries `aria-current: 'page'`, not only a class of the app's own (`active`) that looks current without saying so. Outside nav, the current position in a sequence (a step, a round, a page of results) carries `aria-current` with its kind (`'step'`, `'true'`); a choice that stays chosen (a tool, an avatar) is `pressed` (action.chip-is-choice). A class of the app's own alone is a finding.

## Page shell and layout

**layout.page-once** · settled · audit: One Page per app, holding the router so its views fill it: `new Page({ appendTo: document.body, append: router })`, or inside an app shell that adds a bottom nav or a side rail. A second Page, or views appended outside it, is the finding.

**layout.view-shape** · settled · audit: A routed view is a Toolbar with `variant: 'bar'` for its header, then a Content for what scrolls.

**layout.title-in-heading** · settled · audit: The view's title is the bar's `heading`, not an element built beside it. A breadcrumb trail is Links to the views above, placed before the heading; the view itself is the heading, not a link.

**layout.back-first** · settled · audit: A back control is first in the bar: `addClass: 'start'`, `icon: 'arrow-left'`, and a name (action.icon-only-named) when it has no text.

**layout.scroll-in-content** · settled · audit: What scrolls in a view, or in a Dialog body that holds a long list, is a Content, not a box given `overflow: auto` by hand. Give it `column` to keep reading width on wide screens; `column` is the side padding, so don't also set side padding on it (neither the `padding` option nor CSS `padding` shorthand: use `padding-block`).

**layout.router-vs-tabs** · settled · audit: Router for the app's top-level destinations; Tabs (or `variant: 'segmented'`) for switching panes inside one view. Segmented Tabs that switch the whole view's mode sit in the header bar.

**layout.route-paths** · settled · lint: Route paths are lowercase kebab-case (`/fields`, not `/Fields`).

**layout.route-map** · settled · audit: The paths live in one exported map that the router, the nav and every link build from, not as hash strings written out by hand.

## Forms

**form.declared-inputs** · settled · audit: Fields that edit a record are Form or FormDialog `inputs` entries (`{ key, label, InputComponent, validate }`), not Inputs and captions assembled by hand. A declared field gets its label wired to it.

**form.validate-on-field** · settled · audit: Validation is the field's `validate: value => message`, and submitting waits on `form.hasErrors()`. Required-field errors reported in a toast are a finding.

**form.every-field-labeled** · settled · audit: Every field has a label tied to it: a Form `label`, a Label holding the field (`new Label('Name', input)`, or the field in `append`), or a `<label for>`. A caption element with no `for`, sitting above the field, ties nothing to it. A field component made of parts names the control its label belongs on with a `labelTarget` getter (since 7.2). A label tied at runtime (an observer that finds the next field) works, but hides the tie from an audit: prefer one of the above.

**form.read-options-value** · settled · lint: An Input's value is `input.options.value`, kept up to date as it's typed; `isDirty` and `validate()` read it too. Reading `input.elem.value`, or copying it into `options.value` before validating, is a finding.

**form.placeholder-not-label** · settled · lint: A placeholder is a hint or an example beside a label, never the only label. This holds for search fields in a toolbar too: give them an `aria-label`.

**form.filter-select-named** · settled · audit: A Select used as a filter has an accessible name; a first option like "Any setting" isn't one.

**form.single-choice** · settled · audit: Choosing one of a closed set is a Select. A set of two to five options that reads better shown all at once may instead be a row of `pressed` chips (action.chip-is-choice); a longer set in buttons is a finding. Free text with common values is an Input with `suggestions`. Segmented Tabs switch a view or a mode; they aren't a form value.

**form.checkbox-label-after** · settled · audit: A checkbox's label follows it on the same line: Form does this itself; by hand, `new Label({ label, variant: 'inline-after' }, checkbox)`.

**form.value-components-in-form** · proposed · audit: TagList, ColorPicker and other components that hold a value join a Form as `InputComponent`, not beside it.

**form.no-raw-fields** · settled · lint: No raw `<input>`, `<textarea>`, `<select>`, `<option>` or `<optgroup>` built through `tag:`, `document.createElement`, or by turning another element into one (`Object.assign(input.elem, { type: 'checkbox' })`). A textarea is `new Input({ tag: 'textarea' })`; a checkbox is `new Input({ type: 'checkbox' })`; Select takes options, including optgroups. A tool's own dev UI is exempt.

## Structure and display

**structure.group-heading** · settled · audit: A heading over a group inside a view is a SectionLabel. The view's title is the bar's `heading` (layout.title-in-heading); `vbc-markdown` is for rendered markdown only. Copying SectionLabel's look (uppercase, muted, letter-spaced) onto any other element is a finding.

**structure.sectionlabel-margin** · settled · since 7.2 · lint: Leave a SectionLabel's margin alone; first in its container it already drops its top margin. Space it from its neighbors with the container's `gap` or padding.

**structure.card-no-margin** · settled · audit: A Card has no margin; the container spaces its cards with `gap`.

**structure.card-accent** · settled · lint: A Card's colored edge is `accent`, not a hand-made `border-left` or inset shadow. A card look built by hand on an Elem is itself a finding: it's a Card. Restyling a Card with `styled(Card)` is how an app gives it a look of its own; a pressable Card that can't be pressed now takes `disabled`, not a `<button>` tag to reach `:disabled`.

**structure.card-states** · settled · audit: Don't restyle a pressable Card's hover, active or disabled states; the Card has them.

**structure.floating-surface** · settled · audit: Something floating over other content is a Popover, Dialog or Notify, or sits on the theme's `surface` role, not a Card given a hand-set opaque background. A hand-built fixed overlay (an image viewer on a `position: fixed` box) is a Dialog, which brings the focus trap, Escape and the backdrop.

**structure.list-nostyle** · settled · lint: An unbulleted List is `noStyle`, not `list-style: none` by hand.

**structure.table-for-records** · settled · audit: Records laid out under column headings are a Table: `columns` and `data`, with sorting and a `footer` row when they're wanted. A `<table>` built by hand from `thead`, `tr` and `td` Elems is a finding. A grid that only arranges things on the page isn't a table, and isn't one either way.

**structure.code-for-code** · settled · audit: Code, a command or a path shown on a page is Code, which picks inline or block by whether the text spans lines; `copyButton` gives it the copy action. A styled `<code>` or `<pre>` with a Copy button made beside it is a finding.

**structure.chrome-in-components** · settled · audit: App UI is built from Elem, Component and the library's components. Raw `document.createElement` is for canvases, game worlds and download anchors.

**structure.theme-tokens** · settled · audit: Colors and sizes come from the theme: secondary text in `colors.muted`, font sizes from `theme.fontSize`, spacing from `theme.space`. A color literal (hex, `rgb`, `hsl`), a font size given as a literal (`px`, `em` or `rem`), or a `font-family` not from `theme.fonts` in UI chrome is a finding. Canvas art isn't chrome, and neither is a color the user chose (a map line, a tag color). Re-theme by assigning theme roles before the components load, not by keeping a second palette in CSS variables.

## Every component

The rules that bear on each component, and where none do, why. A component with no rule yet has no pattern in the apps to draw one from; the first app that uses it, or builds its job by hand, is where its rule starts.

| Component | Rules |
| --- | --- |
| BottomSheet | the [overlay choice](#overlays-and-feedback) |
| Button | [overlay.button-order](#overlays-and-feedback), [action.press-handler](#actions-and-navigation), [action.primary-filled](#actions-and-navigation), [action.icon-only-flat](#actions-and-navigation), [action.icon-only-named](#actions-and-navigation), [action.icon-option](#actions-and-navigation), [action.label-wording](#actions-and-navigation), [action.intent-is-effect](#actions-and-navigation), [action.toggle-pressed](#actions-and-navigation), [action.chip-is-choice](#actions-and-navigation), [action.disabled-option](#actions-and-navigation), [action.link-navigates](#actions-and-navigation), [action.no-handbuilt-button](#actions-and-navigation) |
| Calendar | No rule yet: no app uses it; the one app with a calendar has an older one of its own. |
| Card | [action.card-navigates-as-link](#actions-and-navigation), [structure.card-no-margin](#structure-and-display), [structure.card-accent](#structure-and-display), [structure.card-states](#structure-and-display), [structure.floating-surface](#structure-and-display) |
| Code | [structure.code-for-code](#structure-and-display) |
| ColorPicker | [form.value-components-in-form](#forms) |
| Content | [layout.view-shape](#page-shell-and-layout), [layout.scroll-in-content](#page-shell-and-layout) |
| ContextMenu | [overlay.menu-anchored](#overlays-and-feedback), [overlay.popover-close](#overlays-and-feedback), the [overlay choice](#overlays-and-feedback) |
| Dialog | [overlay.confirm-not-handbuilt](#overlays-and-feedback), [overlay.confirm-wording](#overlays-and-feedback), [overlay.danger-before-irreversible](#overlays-and-feedback), [overlay.button-order](#overlays-and-feedback), [overlay.record-in-formdialog](#overlays-and-feedback), [overlay.dialog-size-by-content](#overlays-and-feedback), [layout.scroll-in-content](#page-shell-and-layout), [structure.floating-surface](#structure-and-display) |
| EmptyState | [overlay.notify-not-progress](#overlays-and-feedback), [overlay.emptystate-options](#overlays-and-feedback), [overlay.emptystate-four-states](#overlays-and-feedback), [overlay.emptystate-failed](#overlays-and-feedback), [overlay.emptystate-empty-vs-nomatch](#overlays-and-feedback) |
| Form | [overlay.record-in-formdialog](#overlays-and-feedback), [overlay.save-failure-in-form](#overlays-and-feedback), [form.declared-inputs](#forms), [form.validate-on-field](#forms), [form.every-field-labeled](#forms), [form.read-options-value](#forms), [form.placeholder-not-label](#forms), [form.single-choice](#forms), [form.checkbox-label-after](#forms), [form.value-components-in-form](#forms), [form.no-raw-fields](#forms) |
| FormDialog | [overlay.button-order](#overlays-and-feedback), [overlay.record-in-formdialog](#overlays-and-feedback), [overlay.save-failure-in-form](#overlays-and-feedback), [overlay.dialog-size-by-content](#overlays-and-feedback), [form.declared-inputs](#forms), [form.validate-on-field](#forms) |
| Icon | [action.icon-option](#actions-and-navigation), [action.icon-meaning-named](#actions-and-navigation) |
| Input | [form.validate-on-field](#forms), [form.every-field-labeled](#forms), [form.read-options-value](#forms), [form.placeholder-not-label](#forms), [form.single-choice](#forms), [form.no-raw-fields](#forms) |
| Keyboard | [action.icon-only-named](#actions-and-navigation), [action.toggle-pressed](#actions-and-navigation) |
| Label | [form.every-field-labeled](#forms), [form.checkbox-label-after](#forms), [form.placeholder-not-label](#forms) |
| Link | [action.icon-option](#actions-and-navigation), [action.link-navigates](#actions-and-navigation), [action.link-tooltip-off-in-nav](#actions-and-navigation) |
| List | [structure.list-nostyle](#structure-and-display) |
| Menu | [overlay.menu-anchored](#overlays-and-feedback) |
| Notify | [overlay.notify-failure](#overlays-and-feedback), [overlay.notify-error-stays](#overlays-and-feedback), [overlay.notify-intents](#overlays-and-feedback), [overlay.notify-undo](#overlays-and-feedback), [overlay.notify-not-progress](#overlays-and-feedback), [overlay.popover-close](#overlays-and-feedback) |
| Page | [layout.page-once](#page-shell-and-layout) |
| Popover | [overlay.menu-anchored](#overlays-and-feedback), [overlay.popover-close](#overlays-and-feedback), [structure.floating-surface](#structure-and-display) |
| RadioButton | No rule yet: no app uses it. Where it fits beside a Select or chips is an [open question](#open-questions). |
| Router | [action.link-navigates](#actions-and-navigation), [layout.page-once](#page-shell-and-layout), [layout.view-shape](#page-shell-and-layout), [layout.router-vs-tabs](#page-shell-and-layout), [layout.route-paths](#page-shell-and-layout), [layout.route-map](#page-shell-and-layout) |
| SectionLabel | [structure.group-heading](#structure-and-display), [structure.sectionlabel-margin](#structure-and-display) |
| Select | [form.placeholder-not-label](#forms), [form.filter-select-named](#forms), [form.single-choice](#forms), [form.no-raw-fields](#forms) |
| Table | [structure.table-for-records](#structure-and-display) |
| Tabs | [layout.router-vs-tabs](#page-shell-and-layout), [form.single-choice](#forms) |
| TagList | [form.value-components-in-form](#forms) |
| Toolbar | [action.primary-filled](#actions-and-navigation), [action.icon-only-flat](#actions-and-navigation), [action.link-tooltip-off-in-nav](#actions-and-navigation), [layout.view-shape](#page-shell-and-layout), [layout.title-in-heading](#page-shell-and-layout), [layout.back-first](#page-shell-and-layout), [form.placeholder-not-label](#forms) |
| Tooltip | [action.icon-only-named](#actions-and-navigation), [action.link-tooltip-off-in-nav](#actions-and-navigation), [overlay.popover-close](#overlays-and-feedback) |
| TooltipWrapper | No rule yet: apps give a tooltip through the `tooltip` option of Button or Link, and none uses it directly. |
| Whiteboard | No rule yet: no app uses it. |

## Open questions

Still undecided. An audit reports what it sees but flags neither side.

- **RadioButton beside Select and chips.** form.single-choice names a Select, or two to five `pressed` chips, for a closed set. When a group of radios is the better choice (a setting whose options each need a sentence?) waits for an app that wants one.
- **A toast at the pointer.** Notify at `x`/`y`, acknowledging the thing just pressed ("Copied"): when is that right rather than the stack?
