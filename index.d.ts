// Minimal type declarations for IDE option-name recognition.
// These are a projection of the source - not a TypeScript implementation.
// VBC is plain JavaScript. These declarations exist so your IDE can suggest
// option names while you write. They do not constrain what the library can do.

// ── Theme ──────────────────────────────────────────────────────────────────────

export interface ThemeColor {
	toString(): string;
	setAlpha(alpha: number): ThemeColor;
	toRgbString(): string;
	toHexString(): string;
	[key: string]: any;
}

export interface ThemeColors {
	blue: ThemeColor;
	green: ThemeColor;
	red: ThemeColor;
	orange: ThemeColor;
	yellow: ThemeColor;
	gray: ThemeColor;
	purple: ThemeColor;
	pink: ThemeColor;
	teal: ThemeColor;
	white: ThemeColor;
	black: ThemeColor;
	// Roles: named for their job, each settable (`theme.colors.danger = myRed`), undefined hands it back to its hues
	/** Focused, selected, checked and pressed: the focus ring, a chosen tab, a checked box, a latched button */
	selected: ThemeColor;
	/** Anything that floats over the page: a dialog, popover, menu, sheet, toast or top bar */
	surface: ThemeColor;
	/** The lift of a card, or a group of fields, off whatever it sits on */
	raised: ThemeColor;
	/** The dimming behind a dialog or context menu */
	overlay: ThemeColor;
	/** The library's own accent (teal) */
	accent: ThemeColor;
	/** The edge of whatever floats over the page, drawn from accent */
	edge: ThemeColor;
	success: ThemeColor;
	info: ThemeColor;
	warning: ThemeColor;
	danger: ThemeColor;
	/** Secondary text: meta lines, counts, hints, section labels */
	muted: ThemeColor;
	/** A hairline between things on the page */
	border: ThemeColor;
	superWhite: ThemeColor;
	vantablack: ThemeColor;
	dark(c: ThemeColor): ThemeColor;
	darker(c: ThemeColor): ThemeColor;
	darkest(c: ThemeColor): ThemeColor;
	light(c: ThemeColor): ThemeColor;
	lighter(c: ThemeColor): ThemeColor;
	lightest(c: ThemeColor): ThemeColor;
	blackish(c: ThemeColor): ThemeColor;
	whiteish(c: ThemeColor): ThemeColor;
	mostReadable(base: ThemeColor, candidates: ThemeColor[]): ThemeColor;
}

export interface Theme {
	colors: ThemeColors;
	fonts: { kodeMono: string; code: string; fontAwesome: string; fontAwesomeSolid: string; fontAwesomeBrands: string };
	/** Screen insets a phone keeps for itself, as env() lengths, 0px elsewhere */
	safeArea: { top: string; right: string; bottom: string; left: string };
	space: { xs: string; sm: string; md: string; lg: string; xl: string };
	radius: { sm: string; md: string; lg: string; pill: string };
	media: { phone: string; wide: string; touch: string };
	/** The type scale, in em of the surrounding text */
	fontSize: { xs: string; sm: string; md: string; lg: string; xl: string; xxl: string };
	/** Shadows: sm under a popover, menu or toast, lg under a dialog or sheet */
	elevation: { sm: string; lg: string };
	duration: { fast: string; base: string; slow: string };
	/** The focus ring's declarations, for under :focus-visible; a negative offset draws it inside */
	focusRing(offset?: string): string;
	/** A Button's base look */
	button: string;
	input: string;
	page: string;
	/** Styles for bare elements; Page's themeElements: false turns them off */
	elements: string;
}

export declare const theme: Theme;

// ── Oxject ───────────────────────────────────────────────────────────────────

import type {
	OxjectInstance,
	DeriveInstance,
	DeriveOptions,
	Subscription,
	SubscriberSubscription,
} from '@vanilla-bean/oxject';
export type { OxjectInstance, DeriveInstance, DeriveOptions, Subscription, SubscriberSubscription };
export { Oxject } from '@vanilla-bean/oxject';

// ── hypertether ──────────────────────────────────────────────────────────────

import type { RequestOptions, RequestResult, Resource, ResourceOptions } from '@vanilla-bean/hypertether';
export type { RequestOptions, RequestResult, Resource, ResourceOptions };
export { GET, POST, PUT, PATCH, DELETE, resource, failureReason, resetRequest } from '@vanilla-bean/hypertether';

/** A versioned update refused because the record changed since the version it was made against */
export interface CrudConflict<T = Record<string, any>> {
	/** The stored record, from the 409's `current` */
	current: T;
	/** The body that was sent */
	changes: Partial<T> & { _v?: number };
	/** The fields sent that the stored record holds otherwise */
	fields: Array<{ key: string; ours: unknown; theirs: unknown }>;
}

export interface CrudUpdateOptions<T = Record<string, any>> extends RequestOptions<T> {
	/** Answer a conflict with the fields to send over the stored version, or nothing to leave it for the caller */
	onConflict?: (
		conflict: CrudConflict<T>,
	) => (Partial<T> | null | undefined | void) | Promise<Partial<T> | null | undefined | void>;
}

export interface CrudResource extends Omit<Resource, 'update'> {
	update: <T = Record<string, any>>(
		id: string | number,
		options?: CrudUpdateOptions<T>,
	) => Promise<RequestResult<T> & { conflict?: CrudConflict<T> }>;
}

/** The client half of crudRoutes: hypertether's `resource` for a collection crudRoutes serves, whose update comes back with a `conflict` when a versioned store refuses it */
export declare function crudResource(path: string, options?: ResourceOptions): CrudResource;

// ── Elem ───────────────────────────────────────────────────────────────────────

export interface ElemOptions {
	tag?: string;
	style?: Record<string, string | number>;
	attributes?: Record<string, string | number | boolean>;
	className?: string;
	id?: string;
	textContent?: string | number | DeriveInstance<any>;
	innerText?: string;
	innerHTML?: string;
	content?: string | Elem | HTMLElement | DeriveInstance<any> | Array<Elem | HTMLElement>;
	appendTo?: Elem | HTMLElement;
	prependTo?: Elem | HTMLElement;
	append?: Array<Elem | HTMLElement | string | null | undefined> | Elem | HTMLElement;
	prepend?: Array<Elem | HTMLElement | string> | Elem | HTMLElement;
	before?: HTMLElement;
	disabled?: boolean;
	onclick?: (event: MouseEvent) => void;
	[key: string]: any;
}

export declare class Elem extends EventTarget {
	constructor(options?: ElemOptions, ...children: Array<Elem | HTMLElement | string>);
	readonly elem: HTMLElement;
	readonly options: ElemOptions;
	readonly tag: string;
	readonly parentElem: HTMLElement | null;
	readonly parent: Elem | undefined;
	readonly children: Array<Elem>;
	setOptions(options: Partial<ElemOptions>): this;
	addClass(...classes: Array<string | string[] | null | undefined>): this;
	removeClass(...classes: Array<string | RegExp>): this;
	toggleClass(name: string, condition: boolean): this;
	hasClass(...classes: Array<string | RegExp>): boolean;
	setStyle(style: Record<string, string | number>): this;
	setAttributes(attributes: Record<string, string | number | boolean>): this;
	append(...children: Array<Elem | HTMLElement | string | null | undefined>): this;
	prepend(...children: Array<Elem | HTMLElement | string>): this;
	appendTo(parent: Elem | HTMLElement): this;
	prependTo(parent: Elem | HTMLElement): this;
	content(value: string | Elem | HTMLElement | Array<Elem | HTMLElement>): this;
	empty(): this;
	_setOption(key: string, value: any): void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export interface ComponentOptions extends ElemOptions {
	autoRender?: boolean | 'onload' | 'animationFrame';
	registeredEvents?: Set<string>;
	knownAttributes?: Set<string>;
	priorityOptions?: Set<string>;
	styles?: string | ((theme: Theme) => string) | Record<string, string | number>;
	uniqueId?: string;
	// Lifecycle
	onConnected?: (this: Component) => void;
	onDisconnected?: (this: Component) => void;
	onRendered?: (this: Component) => void;
	// Pointer
	onPointerPress?: (event: PointerEvent) => void;
	onHover?: (event: PointerEvent) => void;
	onPointerOver?: (event: PointerEvent) => void;
	onPointerEnter?: (event: PointerEvent) => void;
	onPointerDown?: (event: PointerEvent) => void;
	onPointerMove?: (event: PointerEvent) => void;
	onPointerUp?: (event: PointerEvent) => void;
	onPointerLeave?: (event: PointerEvent) => void;
	onPointerCancel?: (event: PointerEvent) => void;
	onContextmenu?: (event: PointerEvent) => void;
	// Input
	onChange?: (event: { value: string | number | boolean } & Event) => void;
	onKeydown?: (event: { value: string } & KeyboardEvent) => void;
	onKeyup?: (event: { value: string } & KeyboardEvent) => void;
	onInput?: (event: { value: string } & InputEvent) => void;
	onBlur?: (event: { value: string } & FocusEvent) => void;
	onSearch?: (event: { value: string } & Event) => void;
	[key: string]: any;
}

export declare class Component extends Elem {
	constructor(options?: ComponentOptions, ...children: Array<Elem | HTMLElement | string>);
	readonly options: ComponentOptions & Record<string, any>;
	readonly rendered: boolean;
	/**
	 * Optional static dispatch map. Handlers are collected across the full constructor chain
	 * (deepest subclass first) and executed in order. Call `next(value?)` to continue to the
	 * next handler in the chain; when the chain is exhausted, `next` falls through to standard
	 * routing. Handlers that do not call `next` fully own the key.
	 *
	 * Use shorthand methods so `this` is the component instance:
	 * `static handlers = { key(value, next) { ...; next(value); } }`
	 */
	static handlers?: Record<string, (this: Component, value: any, next: (value?: any) => void) => void>;
	readonly uniqueId: string;
	readonly parent: Component | undefined;
	readonly children: Array<Component>;
	build(): void;
	render(): void;
	empty(): this;
	destroy(): void;
	styles(value: string | ((theme: Theme) => string) | Record<string, string | number>): void;
	onPointerPress(callback: (event: PointerEvent) => void): void;
	onHover(callback: (event: PointerEvent) => void): void;
	addCleanup(id: string, fn: () => void): void;
	replaceCleanup(id: string, fn: () => void): void;
	replaceDestroyCleanup(id: string, fn: () => void): void;
	processCleanup(): void;
	on(options: { targetEvent: string; callback: (event: Event) => void; id?: string }): boolean;
	emit(type: string, detail?: any): void;
	ancestry(): Array<object>;
	_setOption(key: string, value: any): void;
	_standardSetOption(key: string, value: any): void;
}

// ── styled / configured ────────────────────────────────────────────────────────

export declare function styled<T extends typeof Elem>(
	Base: T,
	styles?: string | ((theme: Theme) => string) | TemplateStringsArray,
	options?: Partial<ComponentOptions>,
): T;

export declare function configured<T extends typeof Elem>(Base: T, options: Partial<ComponentOptions>): T;

// ── Calendar support ───────────────────────────────────────────────────────────

export declare class CalendarEvent {
	constructor(data: Record<string, any>);
	options: Record<string, any>;
	at: Date;
	label?: string;
	notes?: string;
	color?: string;
	duration?: number;
	recurring?: boolean;
	daily?: boolean;
	whitelist?: Array<string | number | Date>;
	blacklist?: Array<string | number | Date>;
	weekdays?: Record<string, boolean>;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	fullDate: string;
	render(type: string, container: HTMLElement, calendar: Component): HTMLElement;
}

// ── GENERATED: Built-in components ────────────────────────────────────────────
// This section is generated by devTools/buildTypes.js - do not edit manually.
// Run `bun run build:types` to regenerate from static schema declarations and JSDoc annotations.

export interface BottomSheetOptions extends ComponentOptions {
	/** Open a moment after rendering; a number is that moment in milliseconds (default: false) */
	autoOpen?: number | boolean;
	/** Hears `close`, however the sheet closed */
	onClose?: (...args: any[]) => any;
}

export declare class BottomSheet extends Component {
	constructor(options?: BottomSheetOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Content area for child components. Append children here for scrollable content. */
	readonly body: Component;
	/** Whether the sheet is open. */
	readonly isOpen: boolean;
	/** Slides the sheet into view, moves focus into it, and closes it if the page navigates away. */
	open(): void;
	/** Slides the sheet out. Announces `close` only if it was open: closing a closed sheet dismisses nothing. */
	close(): void;
}

export interface ButtonOptions extends TooltipWrapperOptions {
	/** FontAwesome icon name (without 'fa-' prefix) */
	icon?: string;
	/** Tooltip text shown on hover */
	tooltip?: string;
	/** 'flat' has no fill, for toolbars and icon buttons; 'chip' is a small outlined pill, for filters and choices; 'raised' is bevelled and sinks as it's pressed */
	variant?: 'flat' | 'chip' | 'raised';
	/** What pressing it does, drawn in that status role: 'danger' for a delete, 'success' for a confirm. A flat or chip button takes it as its text color */
	intent?: 'info' | 'success' | 'warning' | 'danger';
}

export declare class Button extends TooltipWrapper {
	constructor(options?: ButtonOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface CalendarOptions extends ComponentOptions {
	/** Initial calendar view mode (default: "month") */
	view?: 'month' | 'week' | 'day';
	/** Calendar component height (default: "420px") */
	height?: string;
	/** Initial year to display, defaults to current year */
	year?: number;
	/** Initial month to display (0-11), defaults to current month */
	month?: number;
	/** Initial day to display, defaults to current day */
	day?: number;
	/** Day-of-week index (0-6, Sunday first) as returned by Date.getDay(); set from the selected date and read by the week view */
	weekday?: number;
	/** Available view modes for toolbar */
	views?: Array<string>;
	/** Whether to display time in 24-hour format in day view (default: false) */
	display24h?: boolean;
	events?: Array<any>;
}

export declare class Calendar extends Component {
	constructor(options?: CalendarOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Sets the calendar to display a specific date. */
	setDate(year: number, month: number, day: number, reRender?: boolean): void;
	/** Navigates the calendar to today's date and re-renders. */
	today(): void;
	/** Navigates to the previous time period based on current view (day/week/month). */
	previous(): void;
	/** Navigates to the next time period based on current view (day/week/month). */
	next(): void;
	/** Navigates to a specific day and switches to day view. */
	goToDay(position: number | Date): void;
	/** Changes the calendar view mode and updates the display. */
	setView(view: string): this;
	/** Clears the wrapper and renders the current view. */
	renderView(): void;
	/** Retrieves all events occurring on a specific date. */
	eventsAt(date: string | Date): Array<CalendarEvent>;
	/** Adds a new event to the calendar and re-renders. */
	addEvent(eventItem: Record<string, any>): this;
}

export interface CardOptions extends ComponentOptions {
	/** A color for the left edge (a CSS color or a theme color) */
	accent?: string | Record<string, any>;
	/** Answer hover and focus, and Enter or Space like a press; on by default when onPointerPress is given */
	interactive?: boolean;
}

export declare class Card extends Component {
	constructor(options?: CardOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface CodeOptions extends ComponentOptions {
	/** Programming language for syntax highlighting class (default: "javascript") */
	language?: string;
	/** Whether to render as multiline block ('auto' detects newlines) (default: "auto") */
	multiline?: string | boolean;
	/** Code content to display */
	code?: string;
	/** Whether to show copy-to-clipboard button (default: false) */
	copyButton?: boolean;
}

export declare class Code extends Component {
	constructor(options?: CodeOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface ColorPickerOptions extends InputOptions {
	/** Initial color value (CSS color, 'random' for random color) (default: "#666") */
	value?: string;
	/** Array of predefined color values for swatch buttons */
	swatches?: Array<string>;
}

export declare class ColorPicker extends Input {
	constructor(options?: ColorPickerOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Changes the color value and triggers change event. */
	change(value: string | Record<string, any>): void;
	/** Parses color value into HSL components and TinyColor instance. */
	parseValue(value: string | Record<string, any>): Record<string, any>;
}

export interface ContentOptions extends ComponentOptions {
	/** Inner padding (a number is pixels); unset, a subclass's own CSS padding applies */
	padding?: number | string;
	/** Keep what scrolls to a centered column, for reading on a wide screen: true is 960px wide, or give the width (a number is pixels). The sides keep at least a 12px gutter. */
	column?: boolean | number | string;
}

export declare class Content extends Component {
	constructor(options?: ContentOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface ContextMenuOptions extends PopoverOptions {
	/** Menu items, e.g. { textContent, detail, onPointerPress }, and headings, { heading } */
	items?: Array<Record<string, any>>;
	/** Stay open after an item is chosen (default: false) */
	sticky?: boolean;
	/** Widest the menu may be (default: 240) */
	maxWidth?: number;
	/** Mark the point a menu opened at; false leaves it unmarked (default: true) */
	reticle?: boolean;
	/** default: false */
	autoOpen?: boolean;
	/** default: true */
	outsideClose?: boolean;
}

export declare class ContextMenu extends Popover {
	constructor(options?: ContextMenuOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Opens the menu at a point, or under an element; opening it again from the same element closes it. */
	open(options?: Record<string, any>): void;
	/** Closes the menu and hands focus back to where it was. */
	close(): void;
}

export interface DialogOptions extends ComponentOptions {
	/** Dialog size; 'fit' is as tall as its content (default: "small") */
	size?: 'small' | 'standard' | 'large' | 'fit';
	/** What the dialog is about, drawn in that status role */
	intent?: 'info' | 'success' | 'warning' | 'danger';
	/** Open a moment after rendering; a number is that moment in milliseconds, false waits for open() (default: true) */
	autoOpen?: number | boolean;
	/** Whether to open as modal dialog (default: true) */
	modal?: boolean;
	/** Header text content */
	header?: string;
	/** Body content */
	body?: string | Component;
	/** Custom footer components */
	footer?: Array<Component>;
	/** Button configurations for default footer */
	buttons?: Array<string | Record<string, any>>;
	/** Hears a press on any of `buttons`, with { button, event, dialog, closeDialog }; a button's own onPointerPress runs first */
	onButtonPress?: (...args: any[]) => any;
	/** Custom close function */
	closeDialog?: (...args: any[]) => any;
	/** Hears `close`, however it closed: close(), Escape, a button */
	onClose?: (...args: any[]) => any;
	/** Destroy the dialog once it has closed and faded out; false keeps it to open again (default: true) */
	removeOnClose?: boolean;
}

export declare class Dialog extends Component {
	constructor(options?: DialogOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Content container - primary injection point for subclass and consumer content. */
	readonly body: Component;
	/** Whether the dialog is open. */
	readonly isOpen: boolean;
	/** Ask a yes-or-no question. The confirming button comes second: the dialog focuses its first button, so a reflexive Enter keeps things as they are. Any other way out (Escape, the backdrop) is a no. */
	static confirm(options: Record<string, any>): Promise<boolean>;
	/** Opens the dialog, either as modal or non-modal */
	open(options?: Record<string, any>): void;
	/** Closes the dialog with optional return value */
	close(returnValue: string): void;
}

export interface EmptyStateOptions extends ComponentOptions {
	/** A Font Awesome icon name */
	icon?: string;
	/** The headline, e.g. 'No fields yet' */
	title?: string;
	/** A line under it */
	message?: string;
	/** Button options ({ textContent, onPointerPress }) or a Component */
	action?: Record<string, any> | Component;
	/** Show a spinner in place of the icon, while what would fill the view is on its way */
	loading?: boolean;
}

export declare class EmptyState extends Component {
	constructor(options?: EmptyStateOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface FormOptions extends ComponentOptions {
	/** Field and group definitions */
	inputs?: Array<Record<string, any>>;
	/** Initial form data */
	data?: Record<string, any>;
}

export declare class Form extends Component {
	constructor(options?: FormOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Commits the value being typed in the focused field, as leaving the field would. A field reports its value on change, which an edit only fires when the field loses focus; a Save pressed by keyboard, or on a device whose buttons take no focus, would otherwise judge the form by what the field held before. */
	commitPendingEdit(): void;
	/** Validates all visible form inputs and returns whether errors were found. Runs both VBC Input validations and field-level `validate` functions from the definition. Hidden conditional fields are excluded. */
	hasErrors(options?: Record<string, any>): boolean;
}

export interface FormDialogOptions extends DialogOptions {
	/** Form field definitions, as Form takes them */
	inputs?: Array<Record<string, any>>;
	/** Initial values, as Form takes them */
	data?: Record<string, any>;
	/** Content shown above the form */
	intro?: string | Component | Array<any>;
	/** Further options for the Form */
	formOptions?: Record<string, any>;
	/** The Form class to build, for a form with fields and behaviour of its own */
	FormComponent?: (...args: any[]) => any;
	/** Called with (data, dialog) when the form is valid; false, a failed request or a throw keeps it open */
	onSave?: (...args: any[]) => any;
	/** Called with (data, dialog); its presence adds the Delete button */
	onDelete?: (...args: any[]) => any;
	/** Ask before deleting: a message, or Dialog.confirm options */
	confirmDelete?: string | Record<string, any> | boolean;
	/** Label of the save button (default: "Save") */
	saveLabel?: string;
	/** Label of the delete button (default: "Delete") */
	deleteLabel?: string;
	/** Label of the cancel button (default: "Cancel") */
	cancelLabel?: string;
	/** default: "fit" */
	size?: 'small' | 'standard' | 'large' | 'fit';
}

export declare class FormDialog extends Dialog {
	constructor(options?: FormDialogOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface IconOptions extends ComponentOptions {
	/** FontAwesome icon name (without 'fa-' prefix) */
	icon?: string;
	/** FontAwesome animation name (without 'fa-' prefix), run on the whole element */
	animation?: string;
	/** FontAwesome animation name (without 'fa-' prefix), run on the glyph alone */
	iconAnimation?: string;
}

export declare class Icon extends Component {
	constructor(options?: IconOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface InputOptions extends ComponentOptions {
	/** Input type, auto-detected from value type if not specified */
	type?:
		| 'button'
		| 'checkbox'
		| 'color'
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'file'
		| 'hidden'
		| 'image'
		| 'month'
		| 'number'
		| 'password'
		| 'radio'
		| 'range'
		| 'reset'
		| 'search'
		| 'submit'
		| 'tel'
		| 'text'
		| 'time'
		| 'url'
		| 'week';
	/** Initial input value (default: "") */
	value?: any;
	/** Placeholder text */
	placeholder?: string;
	/** Autocomplete behavior */
	autocomplete?: string;
	/** Auto-capitalization behavior */
	autocapitalize?: string;
	/** Auto-correction behavior */
	autocorrect?: string;
	/** Height for textarea ('auto' for dynamic sizing) (default: "auto") */
	height?: string | number;
	/** Values the browser offers while typing, as a datalist */
	suggestions?: Array<string>;
	/** For type 'file': (files, event) with the files picked, dropped or pasted that accept allows */
	onFiles?: (...args: any[]) => any;
	/** For type 'file': an area that takes dropped and pasted files, and opens the picker when pressed */
	dropZone?: Component | HTMLElement;
	/** Enable syntax highlighting for textarea */
	syntaxHighlighting?: boolean;
	/** Programming language for syntax highlighting */
	language?: string;
	/** Array of validation functions */
	validations?: Array<(...args: any[]) => any>;
}

export declare class Input extends Component {
	constructor(options?: InputOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Checks if the input value has changed from its initial value */
	readonly isDirty: boolean;
	/** Validates the input value against configured validation rules */
	validate(options: Record<string, any>): Array<any> | undefined;
}

export interface KeyboardOptions extends ComponentOptions {
	/** Initial keyboard layout name (default: "simple") */
	layout?: string;
	/** Whether to provide haptic feedback on key press (default: true) */
	tactileResponse?: boolean;
	/** Key configuration object mapping key names to definitions */
	keyDefinitions?: Record<string, any>;
	/** Layout configuration object mapping layout names to key arrays */
	layouts?: Record<string, any>;
	/** Hears `keyDown`: a key pressed down; `event.detail` holds key, keyDefinition, target and event */
	onKeyDown?: (...args: any[]) => any;
	/** Hears `keyUp`: a key let go */
	onKeyUp?: (...args: any[]) => any;
	/** Hears `keyPress`: a key pressed and let go */
	onKeyPress?: (...args: any[]) => any;
}

export declare class Keyboard extends Component {
	constructor(options?: KeyboardOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Switches the keyboard to the specified layout and rebuilds the keys. */
	setLayout(name: string): void;
	/** Registers a callback for key down events. */
	onKeyDown(callback: (...args: any[]) => any): (...args: any[]) => any;
	/** Registers a callback for key up events. */
	onKeyUp(callback: (...args: any[]) => any): (...args: any[]) => any;
	/** Registers a callback for key press events. */
	onKeyPress(callback: (...args: any[]) => any): (...args: any[]) => any;
}

export interface LabelOptions extends TooltipWrapperOptions {
	/** Label display variant (default: "simple") */
	variant?: 'overlay' | 'collapsible' | 'inline' | 'inline-after' | 'simple';
	/** Label text content or label component options */
	label?: string | Record<string, any>;
	/** Input component or ID to associate label with */
	for?: Component | string;
	/** Whether collapsible variant starts collapsed */
	collapsed?: boolean;
	/** Tooltip text for the label */
	tooltip?: string;
}

export declare class Label extends TooltipWrapper {
	constructor(options?: LabelOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface LinkOptions extends TooltipWrapperOptions {
	/** 'link', or a Button's look: 'button', 'flat', 'chip' or 'raised' (default: "link") */
	variant?: 'link' | 'button' | 'flat' | 'chip' | 'raised';
	/** URL to link to */
	href?: string;
	/** Link target attribute */
	target?: string;
	/** Tooltip configuration or text; false for none, as on a nav bar's links */
	tooltip?: Record<string, any> | string | false;
}

export declare class Link extends TooltipWrapper {
	constructor(options?: LinkOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface ListOptions extends ComponentOptions {
	/** Array of list items to render */
	items?: Array<any>;
	/** Custom component class for rendering items */
	ListItemComponent?: Component;
	/** Whether to apply no-style class for plain list */
	noStyle?: boolean;
}

export declare class List extends Component {
	constructor(options?: ListOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface MenuOptions extends ListOptions {
	/** Array of menu items to render */
	items?: Array<any>;
	/** Hears `itemPress`, an item pressed by pointer or keyboard; `event.detail` holds the item (its li) and the press's event */
	onItemPress?: (...args: any[]) => any;
	/** Custom component class for rendering menu items */
	ListItemComponent?: Component;
	/** default: "menu" */
	role?: string;
}

export declare class Menu extends List {
	constructor(options?: MenuOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface NotifyOptions extends PopoverOptions {
	/** What the message is about, drawn in that status role (default: "success") */
	intent?: 'info' | 'success' | 'warning' | 'danger';
	/** Auto-dismiss timeout in milliseconds; defaults to 4000 for info and success, and 0 (stay until tapped) for warning and danger */
	timeout?: number;
	/** Custom icon name, defaults to the intent's icon */
	icon?: string;
	/** X position for the notification; without x and y it stacks in the bottom-right corner */
	x?: number;
	/** Y position for the notification */
	y?: number;
	/** Buttons on the toast, e.g. { textContent: 'Undo', onPointerPress }; its onPointerPress gets (notify, event) and may be async, and the toast closes once it settles unless it returns false */
	actions?: Array<Record<string, any>>;
}

export declare class Notify extends Popover {
	constructor(options?: NotifyOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface PageOptions extends ComponentOptions {
	/** default: true */
	themeElements?: boolean;
}

export declare class Page extends Component {
	constructor(options?: PageOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface PopoverOptions extends IconOptions {
	/** Popover state ('auto', 'manual') (default: "manual") */
	state?: 'auto' | 'manual';
	/** Open a moment after it's added to the page; a number is that moment in milliseconds, false waits for open() (default: true) */
	autoOpen?: boolean | number;
	/** Hears `close`, however it closed: close(), a light dismiss, a press outside */
	onClose?: (...args: any[]) => any;
	/** X position for the popover */
	x?: number;
	/** Y position for the popover */
	y?: number;
	/** Maximum width in pixels (default: 264) */
	maxWidth?: number;
	/** Maximum height in pixels (default: 132) */
	maxHeight?: number;
	/** Viewport element for edge detection */
	viewport?: HTMLElement;
	/** Icon to display in the popover */
	icon?: string;
	/** default: false */
	outsideClose?: boolean;
}

export declare class Popover extends Icon {
	constructor(options?: PopoverOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Whether the popover is open. */
	readonly isOpen: boolean;
	/** Opens the popover, placed at a point when one is given. */
	open(options?: Record<string, any>): void;
	/** Closes the popover, announcing `close` if it was open. */
	close(): void;
}

export interface RadioButtonOptions extends ComponentOptions {
	/** Array of radio button options */
	options?: Array<string | Record<string, any>>;
	/** Currently selected value */
	value?: any;
}

export declare class RadioButton extends Component {
	constructor(options?: RadioButtonOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface RouterOptions extends ComponentOptions {
	/** Object mapping route patterns to component classes */
	views?: Record<string, any>;
	/** Default route path, uses first view key if not specified */
	defaultPath?: string;
	/** Component class for 404/not found routes */
	notFound?: Component;
	/** Callback fired when rendering a new view */
	onRenderView?: (...args: any[]) => any;
	/** Routing mode: 'hash' uses URL fragments, 'history' uses pushState (default: "hash") */
	mode?: 'hash' | 'history';
}

export declare class Router extends Component {
	constructor(options?: RouterOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Gets the current path from the URL. */
	readonly path: string;
	/** Gets the matched route for the current path. */
	readonly route: string;
	/** Extracts route parameters from a path, decoded. */
	parseRouteParameters(path?: string): Record<string, any>;
}

export interface SectionLabelOptions extends ComponentOptions {
	/** The heading level announced (default: 3) */
	level?: number;
}

export declare class SectionLabel extends Component {
	constructor(options?: SectionLabelOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface SelectOptions extends InputOptions {
	/** Array of select options */
	options?: Array<string | Record<string, any>>;
	/** Currently selected value */
	value?: any;
	/** default: "off" */
	autocomplete?: string;
}

export declare class Select extends Input {
	constructor(options?: SelectOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Gets the currently selected value with enhanced option handling. */
	readonly value: any;
}

export interface TableOptions extends ComponentOptions {
	/** Column definitions with keys and optional configurations */
	columns?: Array<string | Record<string, any>>;
	/** Array of data objects to display in table rows */
	data?: Array<Record<string, any>>;
	/** Footer row data */
	footer?: Array<string | Record<string, any>>;
	/** Custom sort function, defaults to built-in sorting */
	onSort?: (...args: any[]) => any;
	/** Currently sorted column key */
	sortProperty?: string;
	/** Sort direction ('asc' or 'desc') */
	sortDirection?: 'asc' | 'desc';
	/** Caller-owned selection state. The table stores it and re-renders when it is reassigned, but never interprets it; `dataColumn` functions read it back off `table.options.selection` to render per-row state. Mutating a property of it deliberately does not re-render, so toggling one row's checkbox does not rebuild the table under the pointer */
	selection?: any;
}

export declare class Table extends Component {
	constructor(options?: TableOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface TabsOptions extends ComponentOptions {
	/** The tabs, e.g. { id, label, icon, count, disabled }; reactive */
	tabs?: Array<Record<string, any>>;
	/** The selected tab's id; defaults to the first tab */
	selected?: string;
	/** Each tab's panel, by id: an element or a Component, shown only while selected */
	panels?: Record<string, any>;
	/** 'segmented' is a pill split into its choices, for switching between a few views of the same thing */
	variant?: 'segmented';
	/** default: "tablist" */
	role?: string;
}

export declare class Tabs extends Component {
	constructor(options?: TabsOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Selects a tab, showing its panel and announcing `change`, with the id as `event.value`, if it wasn't already selected. */
	select(id: string): void;
	/** Sets the count shown beside a tab's label; zero or nothing clears it. */
	count(id: string, count?: number): void;
}

export interface TagListOptions extends ComponentOptions {
	/** Whether tags can be added/removed (default: false) */
	readOnly?: boolean;
	/** (value, tagList) => the tag to add (true keeps it as typed), or false to refuse it */
	accept?: (...args: any[]) => any;
	/** Values offered while typing a new tag */
	suggestions?: Array<string>;
	/** Initial array of tag text values */
	tags?: Array<string>;
}

export declare class TagList extends Component {
	constructor(options?: TagListOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface ToolbarOptions extends ComponentOptions {
	/** Space between controls (a number is pixels) (default: 12) */
	gap?: number | string;
	/** Wrap onto more lines when there isn't room (default: true) */
	wrap?: boolean;
	/** A title at the start, truncated to fit; it stays through empty() */
	heading?: string;
	/** 'bar' is a page's top bar: flush, on a surface, ruled off from what's below */
	variant?: 'bar';
}

export declare class Toolbar extends Component {
	constructor(options?: ToolbarOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Removes the controls, keeping the heading. */
	empty(): this;
}

export interface TooltipOptions extends PopoverOptions {
	/** Tooltip position relative to parent (default: "topRight") */
	position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
	/** Open a moment after it's added to the page, as a Popover does (default: false) */
	autoOpen?: boolean | number;
	/** Icon to display in tooltip */
	icon?: string;
}

export declare class Tooltip extends Popover {
	constructor(options?: TooltipOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface TooltipWrapperOptions extends IconOptions {
	/** Tooltip text or configuration object; false for none */
	tooltip?: string | Record<string, any> | false;
	/** Icon to display in the component */
	icon?: string;
}

export declare class TooltipWrapper extends Icon {
	constructor(options?: TooltipWrapperOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface WhiteboardOptions extends ComponentOptions {
	/** Canvas background color (default: "#FFF") */
	background?: string;
	/** Default drawing color (default: "#000") */
	color?: string;
	/** Default line width for drawing (default: 3) */
	lineWidth?: number;
	/** Canvas width (default: "200px") */
	width?: string;
	/** Canvas height (default: "200px") */
	height?: string;
	/** Whether drawing is disabled (default: false) */
	readOnly?: boolean;
	/** Predefined lines to render on the canvas */
	lines?: Array<Record<string, any>>;
	/** Custom throttle delay for draw events */
	drawThrottle?: number;
}

export declare class Whiteboard extends Component {
	constructor(options?: WhiteboardOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Draws a line on the canvas with specified properties. */
	drawLine(options: Record<string, any>): void;
	/** Clears the entire canvas and discards any stroke currently being tracked. */
	clearCanvas(): void;
}

// ── END GENERATED ────────────────────────────────────────────────────────────

// ── GENERATED: Functions, constants and the rest ─────────────────────────────
// This section is generated by devTools/buildTypes.js - do not edit manually.

export interface ColorSwatchOptions extends ButtonOptions {
	/** A CSS color, or 'random' */
	color?: string;
}

export declare class ColorSwatch extends Button {
	constructor(options?: ColorSwatchOptions, ...children: Array<Elem | HTMLElement | string>);
}

export declare class InputValidationError extends Component {
	constructor(options?: ComponentOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface TagOptions extends ComponentOptions {
	/** Tab order for the chip (default: 0) */
	tabIndex?: number;
	/** Omits the remove button and applies the readOnly class (default: false) */
	readOnly?: boolean;
}

export declare class Tag extends Component {
	constructor(options?: TagOptions, ...children: Array<Elem | HTMLElement | string>);
}

export declare class View extends Component {
	constructor(options?: ComponentOptions, ...children: Array<Elem | HTMLElement | string>);
}

export type StyleConfig = Record<string, any>;

export declare function adjustIndentation(options?: any): any;

/** Inject CSS directly into the document head via a style element */
export declare function appendStyles(css: string, id?: string): HTMLStyleElement | undefined;

/** Convert any number of strings or arrays into a single array with no duplicates */
export declare function buildClassList(...classNames: Array<any>): Array<any>;

/** Capitalize the string */
export declare function capitalize(string: string, recursive: boolean, split?: string): string;

/** @type {(percentage?: number) => boolean} True `percentage` percent of the time */
export declare const chance: (percentage?: number) => boolean;

/** A schema descriptor for an option drawn as one class from a set: `variant: 'flat'` on an element marked `variant-flat`. Setting it takes away the class of the value before and validates the new one against the set; null or undefined leaves no class. */
export declare function classEnum(
	prefix: string,
	values: Array<string>,
	config?: Record<string, any>,
): Record<string, any>;

/** Generate secure unique ID that is safe to use as a class name or id */
export declare function classSafeNanoid(size?: number): string;

/** Builds array from conditional item descriptors, supporting conditional inclusion and arrays. */
export declare function conditionalList(conditionalItems: Record<string, any>[]): any[];

/** A WebSocket that comes back. A lost connection is retried for as long as it's open, backing off to every 10 seconds, and at once when the page comes back into view or the network comes back. Listeners carry over to each new connection. */
export declare function connectSocket(path?: string, options?: Record<string, any>): Record<string, any>;

/** Converts number from source range to equivalent value in target range using linear interpolation. */
export declare function convertRange(
	value: number,
	sourceRange: [number, number],
	targetRange: [number, number],
): number;

/** Copy a piece of text to the clipboard */
export declare function copyToClipboard(text: string): Promise<boolean>;

/** A CSS length from a number of pixels or a CSS string, as an option a component takes as either. */
export declare function cssLength(value: number | string): string;

export declare const DAYS: ReadonlyArray<string>;

/** Creates debounced version of function that delays execution until after delay period of inactivity. */
export declare function debounce(callback: (...args: any[]) => any, delay?: number): (...args: any[]) => any;

/** Creates promise that resolves after specified delay. */
export declare function delay(ms: number): Promise<void>;

/** Whether a file is one an accept list allows, as an `<input type="file" accept>` reads it: extensions (.csv), exact types (application/json) and type families (image/*). An empty list allows anything. */
export declare function fileAccepted(file: File, accept?: string): boolean;

/** The first element inside a root that takes keyboard focus, for an overlay to move focus into as it opens. */
export declare function firstFocusable(root: HTMLElement): HTMLElement | null;

/** Keep the page to the part a phone's keyboard leaves showing. The keyboard covers the bottom of the page rather than shrinking it (on iOS always, on Android unless the viewport asks), which hides whatever sits at the bottom. The visible height goes to `--visible-height`, and to the document's height unless setHeight is false; while pinch-zoomed the visible part is a magnified piece of the page, so the page is left alone. */
export declare function fitToKeyboard(options?: Record<string, any>): (...args: any[]) => any;

/** Format a date for reading, in the reader's locale. A date-only string keeps its day; text that isn't a date is returned as it was. */
export declare function formatDate(value: Date | number | string, options?: Record<string, any>): string;

export declare function formatDuration(duration: any, append?: any, prepend?: any): any;

export declare function formatTime(date: any, options?: any): any;

/** Reformat a camelCase or PascalCase string with a custom joiner */
export declare function fromCamelCase(string: string, joiner?: string): string;

export declare function getDaysInMonth(year: any, month: any): any;

/** Finds elements containing specified text using XPath evaluation. Uses XPath contains() function with optional case-insensitive matching. Returns deepest matching elements to avoid duplicate parent/child results. */
export declare function getElementsContainingText(text: string, options?: Record<string, any>): Node[];

export declare function insertTabCharacter(input: any): any;

/** Determines if element is a descendant of specified parent element. */
export declare function isDescendantOf(element: HTMLElement, parentElement: HTMLElement): boolean;

/** Whether the current runtime is in development mode. Checks process.env.NODE_ENV (Node/Bun, or a bundler's define of it) and import.meta.env (Vite/ESBuild). Defaults to false (production-safe) when neither is set. */
export declare const isDev: boolean;

/** Check if the current device is a Mac, an iPhone or an iPad: the ones whose shortcuts use ⌘ */
export declare function isMac(): boolean;

export declare const MONTHS: ReadonlyArray<string>;

/** Observe DOM connection/disconnection of an element via a shared MutationObserver. All registrations share one observer; the observer is torn down when no targets remain. Fires when the target itself or any ancestor is added or removed; a move within the document is not a disconnect. */
export declare function observeElementConnection(config: Record<string, any>): { disconnect: (...args: any[]) => any };

/** Creates multi-level sorting function for Array.sort() with locale-aware comparison. */
export declare function orderBy(orders: Record<string, any> | Record<string, any>[]): (...args: any[]) => any;

/** Read a date from a Date, a timestamp or a string. A date-only string (2026-10-18) is that day where the reader is, not midnight UTC, which is the day before anywhere west of Greenwich. */
export declare function parseDate(value: Date | number | string): Date | null;

/** Follows a gesture of one or more pointers, from the first pointerdown to the last pointer's release. The first pointer starts it and is its `initiator`; later ones join it. Moves and releases are heard on the document, so a pointer that strays off the element keeps the gesture going. */
export declare function pointerGesture(options?: Record<string, any>): Record<string, any>;

/** @type {(min: number, max: number) => number} Generate a random number from a range (min inclusive, max exclusive) */
export declare const rand: (min: number, max: number) => number;

/** @type {(array: Array) => number} Choose a random item from an array */
export declare const randFromArray: (array: Array<any>) => number;

/** @type {(min: number, max: number) => number} Generate a random integer from a range (min & max inclusive) */
export declare const randInt: (min: number, max: number) => number;

/** Get the current text from the clipboard */
export declare function readClipboard(): Promise<string>;

/** Read a file's contents. */
export declare function readFile(
	file: File | Blob,
	as?: 'text' | 'json' | 'dataURL' | 'arrayBuffer',
): Promise<string | Record<string, any> | ArrayBuffer>;

/** A value kept in localStorage as JSON, or `fallback` when there is none, it won't parse, or storage is refused (a private window, blocked site data) */
export declare function readStorage(key: string, fallback?: any): any;

/** How long ago (or how far ahead) a time is, briefly: 'just now', '5m ago', '3h ago', '2d ago', 'in 10m'. */
export declare function relativeTime(value: Date | number | string, now?: number): string;

/** Strip all excess newline and indentation whitespace from the source string */
export declare function removeExcessIndentation(string: string): string;

/** Keep the screen awake (a game in play, a remote in hand), taking the lock again whenever the page comes back into view, since the browser lets it go when the page is hidden. Best-effort: where it isn't supported or is refused, nothing happens. */
export declare function requestWakeLock(): (...args: any[]) => any;

/** Executes function with automatic retry on failure, with configurable delay and attempt limits. */
export declare function retry(callback: (...args: any[]) => any, options?: Record<string, any>): Promise<any>;

/** Get the delta between 2 rgb colors */
export declare function rgbDelta(rgbA: [number, number, number], rgbB: [number, number, number]): number;

/** CSS pipeline: theme hydration → DOM injection. Batches configs queued before document load and flushes them on window load. */
export declare function shimCSS(styleConfig: StyleConfig): void;

/** @type {(array: Array) => Array} Shuffle an array in place (Fisher-Yates), returning it */
export declare const shuffleArray: (array: Array<any>) => Array<any>;

/** Vibrate the device for a short burst to serve as a tactile response (if supported) */
export declare function tactileResponse(): void;

/** Process a theme function into CSS string with optional scoping Handles both CSS string and style object returns from theme functions */
export declare function themeStyles(styleConfig: StyleConfig): string | Record<string, any>;

/** Creates throttled version of function that limits execution to once per delay period. */
export declare function throttle(callback: (...args: any[]) => any, delay?: number): (...args: any[]) => any;

export declare function to12hour(hour: any): any;

/** Reformat string to a camelCase */
export declare function toCamelCase(string: string, splitter?: string): string;

export declare function toNth(number: any): any;

export declare function updateValidationErrors(options: any): any;

/** Vibrate the device (if supported) */
export declare function vibrate(durationPattern?: number | number[]): void;

/** Pick a key, each as likely as its percentage */
export declare function weightedChance(percentages: Record<string, any>): string;

/** Keep a value in localStorage as JSON, or remove it when `undefined`. Refused storage is ignored: the value lasts until the page goes. */
export declare function writeStorage(key: string, value: any): void;

// ── END GENERATED MODULES ────────────────────────────────────────────────────
