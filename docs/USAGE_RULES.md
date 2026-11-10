# Usage Rules

How the components are meant to be chosen and combined in an app. The component READMEs say what each one does; this says which one to reach for, and what a misuse looks like. It is written for two readers: a person learning the library, and an audit that reads an app's source and reports where it strays.

The rules were drawn from the apps built on this library, not invented: each settled rule is a pattern most of them already follow. Where the apps disagreed, the question was settled and the library changed to match (dialog button order, error toasts, toggles); what is still undecided is listed under [Open questions](#open-questions), and an audit flags neither side of it.

Each rule has an id, a status and a check:

- **settled**: most apps follow it, or the apps disagreed and it was decided; the library agrees, and a deviation is a finding
- **proposed**: the library intends it but few apps show it yet, or it waits on a library change; report, don't fail
- **lint**: a static pattern can find it
- **audit**: it takes judgment about what the code is for

## Overlays and feedback

The choice, by what the moment is:

| The moment | Reach for |
| --- | --- |
| A yes-or-no question before a consequential action | `Dialog.confirm` |
| Creating or editing a record (including login, settings) | FormDialog |
| Showing something to read or work through: a viewer, an import, a confirm that needs a checkbox | Dialog |
| A quick-entry panel on a phone, opened from a floating button (`removeOnClose` if it's made for one use) | BottomSheet |
| The outcome of an action taken outside a dialog | Notify |
| A list or view with nothing to show: loading, empty, no match, failed | EmptyState |
| A menu off a button or a right-click | ContextMenu |

**overlay.confirm-not-handbuilt** · settled · audit: Ask a yes-or-no question with `Dialog.confirm`, not a Dialog given two buttons and a resolver.

**overlay.confirm-wording** · settled · audit: The header is the question ("Delete this bookmark?") and `confirmLabel` is the verb ("Delete"). Never "OK" or "Yes": a verb says what will happen, so the answer doesn't depend on reading the header.

**overlay.danger-before-irreversible** · settled · audit: An action that can't be undone (a delete with no undo, a dropped stash) is confirmed first, and the confirm carries `intent: 'danger'`. A danger-colored Button that acts on press, with no confirm, is a finding. An action an undo follows isn't danger: leave the intent off, or toast the undo instead of confirming (overlay.notify-undo).

**overlay.button-order** · settled · audit: In a dialog's buttons the safe way out comes before the action: Cancel, then the verb. `Dialog.confirm` and FormDialog order theirs so (FormDialog: Delete, Cancel, Save, with Delete set apart); a dialog's own `buttons` array follows suit.

**overlay.record-in-formdialog** · settled · audit: A dialog that creates or edits a record is a FormDialog. Save/Delete/Cancel built on a plain Dialog loses what FormDialog gives: it stays open when the save fails, and shows why.

**overlay.save-failure-in-form** · settled · audit: A failed save is reported inside the form (a field's `validate`, or FormDialog's failure line), not in a toast that leaves the user guessing which field.

**overlay.dialog-size-by-content** · settled · audit: `'fit'` for forms and short content, `'large'` for viewers, tables and imports. Don't set width or height through `style`.

**overlay.notify-failure** · settled · audit: A failed action gets `new Notify({ intent: 'danger', content: '<what failed>: <reason>' })`. A failure that isn't reported at all is a finding.

**overlay.notify-error-stays** · settled · audit: A warning or danger toast keeps its default and stays until pressed. Notify counts a repeated message on the toast already showing, and folds a long stack behind "+N more", so a timeout isn't needed to keep the corner clear. A `timeout` on one is right only when the toast isn't the one place the problem shows: the app is retrying and will say if it gives up, the failure also shows where it happened, or a later success replaces it.

**overlay.notify-intents** · settled · audit: `success`: it's done. `warning`: it didn't happen, and nothing broke (refused, a precondition unmet, partly done). `info`: a neutral note. `danger`: it failed.

**overlay.notify-undo** · settled · audit: An action that can be undone is toasted with `actions: [{ textContent: 'Undo', onPointerPress }]` rather than confirmed first.

**overlay.notify-not-progress** · settled · audit: Don't hold a Notify open as a progress indicator and destroy it by hand. A view's loading state is EmptyState's `loading`, or a Button's disabled state while its action runs.

**overlay.menu-anchored** · proposed · lint: A menu opened from a button is opened with `menu.open({ anchor: button })`, which ties the menu to the button: it toggles from it and tells assistive tech that it's open. Opening it at the click's `x`/`y` loses both.

**overlay.popover-close** · settled · lint: Close a Popover with `close()` or `destroy()`. `elem.remove()` skips its cleanup and the `close` that `onClose` listens for. Lint: `.elem.remove()` on anything that is a Popover, ContextMenu, Notify or Tooltip.

**overlay.emptystate-options** · settled · lint: EmptyState takes `title` and `message`, not Dialog's `header` and `body`; given the wrong names it shows nothing.

**overlay.emptystate-four-states** · settled · audit: A view that fetches has four states, each an EmptyState: `loading: true` while fetching; then empty, no match, or failed.

**overlay.emptystate-failed** · settled · audit: A failed load: icon `triangle-exclamation`, a title saying it failed, the reason as `message`, and `action: { textContent: 'Try again' }`.

**overlay.emptystate-empty-vs-nomatch** · settled · audit: "Nothing yet" gets an icon from the domain and names how to make the first one. "Nothing matches" gets `magnifying-glass` and says what was searched for.

## Actions and navigation

**action.press-handler** · settled · lint: A press is `onPointerPress`. `onPointerDown`, `onPointerUp` and `onClick` don't answer the keyboard.

**action.primary-filled** · settled · audit: A view's main or confirming action is a default (filled) Button; the other tools beside it are `variant: 'flat'`. More than one filled Button in a toolbar is worth a look.

**action.icon-only-flat** · settled · audit: A Button with only an icon is `variant: 'flat'`, unless it is the view's main add action.

**action.icon-only-named** · settled · lint: A Button with an icon and no `textContent` has a name: a `tooltip`, a `title` or an `aria-label`. Any of the three will do; the tooltip names it through `aria-labelledby`.

**action.icon-option** · settled · lint: A Button's or Link's glyph goes in `icon`, not in an appended Icon or `<i>`. Appended, the Button doesn't know it's icon-only and loses the square shape and the spacing.

**action.label-wording** · settled · audit: Labels are sentence case and start with a verb ("Add a game", "Copy link"). No padding spaces to push the label off the icon.

**action.intent-is-effect** · settled · audit: A Button's `intent` says what pressing it does. It doesn't show that a toggle is on: `success` meaning "selected" is a finding.

**action.toggle-pressed** · settled · lint: A Button that stays on or off shows it with `pressed: true|false`, set from the state it toggles. A class of the app's own (`selected`, `active`), a swapped variant, intent or icon, or `disabled` standing for "on" is a finding: it looks on without saying so.

**action.chip-is-choice** · settled · audit: `variant: 'chip'` is a choice: a filter or one of a few options, usually a `pressed` toggle. A small action (Refresh, Copy link) is `size: 'small'` in whatever variant fits, not a chip.

**action.disabled-option** · settled · lint: Disable through the `disabled` option, not `button.elem.disabled`, which skips `aria-disabled` and the styles.

**action.link-navigates** · settled · audit: Going somewhere is a Link (an anchor with an `href`); doing something is a Button. A navigation that should look like a button is `new Link({ variant: 'button' })` (or `'flat'`, `'raised'`), so it still opens in a new tab and shows its address.

**action.card-navigates-as-link** · settled · audit: A Card that goes somewhere is `tag: 'a'` with an `href` (it answers the pointer by itself), not an `onPointerPress` that calls the router.

**action.link-tooltip-off-in-nav** · settled · lint: A Link in a nav bar or in-app navigation sets `tooltip: false`; its default tooltip, the address, is for links in prose. `false` or `null` turns it off.

**action.no-handbuilt-button** · settled · lint: No `tag: 'button'` on a Component; use Button. An element that must not look like a button can still be a Button with its own styles.

**action.icon-meaning-named** · settled · audit: A standalone Icon beside visible text is decoration and hides itself from assistive tech. An Icon that means something on its own (a status, a lock) has an `aria-label` or text beside it.

## Page shell and layout

**layout.page-once** · settled · audit: One `new Page({ appendTo: document.body, append: router })`; the router's views fill it.

**layout.view-shape** · settled · audit: A routed view is a Toolbar with `variant: 'bar'` for its header, then a Content for what scrolls.

**layout.title-in-heading** · settled · lint: The view's title is the bar's `heading`, not an element built beside it.

**layout.back-first** · settled · audit: A back control is first in the bar: `addClass: 'start'`, `icon: 'arrow-left'`, and a `title`.

**layout.scroll-in-content** · settled · audit: What scrolls is a Content, not a box given `overflow: auto` by hand. Give it `column` to keep reading width on wide screens, and don't combine `column` with `padding`.

**layout.router-vs-tabs** · settled · audit: Router for the app's top-level destinations; Tabs (or `variant: 'segmented'`) for switching panes inside one view. Segmented Tabs that switch the whole view's mode sit in the header bar.

**layout.route-paths** · settled · lint: Route paths are lowercase kebab-case (`/fields`, not `/Fields`), kept in one exported map that navigation uses.

## Forms

**form.declared-inputs** · settled · audit: Fields that edit a record are Form or FormDialog `inputs` entries (`{ key, label, InputComponent, validate }`), not Inputs and captions assembled by hand. A declared field gets its label wired to it.

**form.validate-on-field** · settled · audit: Validation is the field's `validate: value => message`, and submitting waits on `form.hasErrors()`. Required-field errors reported in a toast are a finding.

**form.every-field-labeled** · settled · audit: Every field has a label tied to it: a Form `label`, a Label holding the field (`new Label('Name', input)`, or the field in `append`), or a `<label for>`. A caption element with no `for`, sitting above the field, ties nothing to it. A field component made of parts names the control its label belongs on with a `labelTarget` getter.

**form.read-options-value** · settled · lint: An Input's value is `input.options.value`, kept up to date as it's typed; `isDirty` and `validate()` read it too. Reading `input.elem.value`, or copying it into `options.value` before validating, is a finding.

**form.placeholder-not-label** · settled · lint: A placeholder is a hint or an example beside a label, never the only label. This holds for search fields in a toolbar too: give them an `aria-label`. Lint: an Input or Select with a placeholder and no label, `aria-label` or `title`.

**form.filter-select-named** · settled · lint: A Select used as a filter has an accessible name; a first option like "Any setting" isn't one.

**form.single-choice** · settled · audit: Choosing one of a closed set is a Select. Free text with common values is an Input with `suggestions`. Segmented Tabs switch a view or a mode; they aren't a form value.

**form.checkbox-label-after** · settled · audit: A checkbox's label follows it on the same line: Form does this itself; by hand, `new Label({ label, variant: 'inline-after' }, checkbox)`.

**form.value-components-in-form** · proposed · audit: TagList, ColorPicker and other components that hold a value join a Form as `InputComponent`, not beside it.

**form.no-raw-fields** · settled · lint: No raw `<input>`, `<select>` or `<option>` built through `tag:` or `document.createElement` in app UI. Select takes options, including optgroups. A tool's own dev UI is exempt.

## Structure and display

**structure.group-heading** · settled · audit: A heading over a group inside a view is a SectionLabel. The page or document title is the bar's `heading` (or a real heading element); `vbc-markdown` is for rendered markdown only. Copying SectionLabel's look onto an `h3` is a finding.

**structure.sectionlabel-margin** · settled · lint: Leave a SectionLabel's margin alone; first in its container it already drops its top margin. Space it from its neighbors with the container's `gap` or padding.

**structure.card-no-margin** · settled · audit: A Card has no margin; the container spaces its cards with `gap`.

**structure.card-accent** · settled · lint: A Card's colored edge is `accent`, not a hand-made `border-left` or inset shadow.

**structure.card-states** · settled · audit: Don't restyle a pressable Card's hover, active or disabled states; the Card has them.

**structure.floating-surface** · settled · audit: Something floating over other content is a Popover or Notify, or sits on the theme's `surface` role, not a Card given a hand-set opaque background.

**structure.list-nostyle** · settled · lint: An unbulleted List is `noStyle`, not `list-style: none` by hand.

**structure.chrome-in-components** · settled · audit: App UI is built from Elem, Component and the library's components. Raw `document.createElement` is for canvases, game worlds and download anchors.

**structure.theme-tokens** · settled · audit: Colors and sizes come from the theme: secondary text in `colors.muted`, sizes from `theme.fontSize`. A hex literal in UI chrome is a finding; in canvas art it isn't. Re-theme by assigning theme roles before the components load, not by keeping a second palette in CSS variables.

## Open questions

Still undecided. An audit reports what it sees but flags neither side.

- **A toast at the pointer.** Notify at `x`/`y`, acknowledging the thing just pressed ("Copied"): when is that right rather than the stack?
