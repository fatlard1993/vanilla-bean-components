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
	selected: ThemeColor;
	transparent: ThemeColor;
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
	random(): ThemeColor;
}

export interface Theme {
	colors: ThemeColors;
	fonts: { kodeMono: string; code: string; fontAwesome: string; fontAwesomeSolid: string; fontAwesomeBrands: string };
	button: string;
	input: string;
	page: string;
	scrollbar: string;
	table: string;
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
export { Oxject, derive } from '@vanilla-bean/oxject';

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
	/** Called when the sheet is dismissed */
	onClose?: (...args: any[]) => any;
}

export declare class BottomSheet extends Component {
	constructor(options?: BottomSheetOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Content area for child components. Append children here for scrollable content. */
	readonly body: Component;
	/** Slides the sheet into view and registers navigation listeners to auto-dismiss. */
	show(): void;
	/** Slides the sheet out of view. Calls `onClose` only if the sheet was actually open — hiding an */
	hide(): void;
}

export interface ButtonOptions extends TooltipWrapperOptions {
	/** FontAwesome icon name (without 'fa-' prefix) */
	icon?: string;
	/** Tooltip text shown on hover */
	tooltip?: string;
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
	setDate(year: number, month: number, day: number): void;
	/** Navigates the calendar to today's date and re-renders. */
	today(): void;
	/** Navigates to the previous time period based on current view (day/week/month). */
	previous(): void;
	/** Navigates to the next time period based on current view (day/week/month). */
	next(): void;
	/** Navigates to a specific day and switches to day view. */
	goToDay(): void;
	/** Changes the calendar view mode and updates the display. */
	setView(view: string): Calendar;
	/** Clears the wrapper and renders the current view. */
	renderView(): void;
	/** Retrieves all events occurring on a specific date. */
	eventsAt(date: string | Date): Array<CalendarEvent>;
	/** Adds a new event to the calendar and re-renders. */
	addEvent(eventItem: Record<string, any>): Calendar;
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
	change(): void;
	/** Parses color value into HSL components and TinyColor instance. */
	parseValue(value: string | Record<string, any>): Record<string, any>;
}

export interface DialogOptions extends ComponentOptions {
	/** Dialog size (default: "small") */
	size?: 'small' | 'standard' | 'large';
	/** Color variant */
	variant?: 'info' | 'success' | 'warning' | 'error';
	/** Auto-open delay in ms, or false to disable (default: 16) */
	openOnRender?: number | boolean;
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
	/** Handler for button press events */
	onButtonPress?: (...args: any[]) => any;
	/** Custom close function */
	closeDialog?: (...args: any[]) => any;
}

export declare class Dialog extends Component {
	constructor(options?: DialogOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Content container - primary injection point for subclass and consumer content. */
	readonly body: Component;
	/** Opens the dialog, either as modal or non-modal */
	open(): void;
	/** Closes the dialog with optional return value */
	close(): void;
}

export interface FormOptions extends ComponentOptions {
	/** Field and group definitions */
	inputs?: Array<Record<string, any>>;
	/** Initial form data */
	data?: Record<string, any>;
}

export declare class Form extends Component {
	constructor(options?: FormOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Validates all visible form inputs and returns whether errors were found. */
	hasErrors(options?: Record<string, any>): boolean;
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
}

export declare class Keyboard extends Component {
	constructor(options?: KeyboardOptions, ...children: Array<Elem | HTMLElement | string>);
	/** Switches the keyboard to the specified layout and rebuilds the keys. */
	setLayout(): void;
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
	/** Link display variant ('link', 'button') (default: "link") */
	variant?: 'link' | 'button';
	/** URL to link to */
	href?: string;
	/** Link target attribute */
	target?: string;
	/** Tooltip configuration or text */
	tooltip?: Record<string, any> | string;
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
	/** Handler for the "select" CustomEvent fired when a menu item is activated; the activation event is in event.detail */
	onSelect?: (...args: any[]) => any;
	/** Custom component class for rendering menu items */
	ListItemComponent?: Component;
	/** default: "menu" */
	role?: string;
}

export declare class Menu extends List {
	constructor(options?: MenuOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface NotifyOptions extends PopoverOptions {
	/** Notification type ('info', 'success', 'warning', 'error') (default: "success") */
	type?: 'info' | 'success' | 'warning' | 'error';
	/** Auto-dismiss timeout in milliseconds */
	timeout?: number;
	/** Custom icon name, defaults to type-appropriate icon */
	icon?: string;
	/** X position for the notification */
	x?: number;
	/** Y position for the notification */
	y?: number;
}

export declare class Notify extends Popover {
	constructor(options?: NotifyOptions, ...children: Array<Elem | HTMLElement | string>);
}

export declare class Page extends Component {
	constructor(options?: ComponentOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface PopoverOptions extends IconOptions {
	/** Popover state ('auto', 'manual') (default: "manual") */
	state?: 'auto' | 'manual';
	/** Whether to automatically open on render (default: true) */
	autoOpen?: boolean;
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
	/** Checks if the popover is currently open. */
	readonly isOpen: boolean;
	/** Shows the popover with optional position update. */
	show(): void;
	/** Hides the popover. */
	hide(): void;
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
	/** Extracts route parameters from a path. */
	parseRouteParameters(path?: string): Record<string, any>;
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
	/** Caller-owned selection state. The table stores it and re-renders * when it is reassigned, but never interprets it; `dataColumn` functions read it back off * `table.options.selection` to render per-row state. Mutating a property of it deliberately does * not re-render, so toggling one row's checkbox does not rebuild the table under the pointer */
	selection?: any;
}

export declare class Table extends Component {
	constructor(options?: TableOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface TagListOptions extends ComponentOptions {
	/** Whether tags can be added/removed (default: false) */
	readOnly?: boolean;
	/** Initial array of tag text values */
	tags?: Array<string>;
}

export declare class TagList extends Component {
	constructor(options?: TagListOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface TooltipOptions extends PopoverOptions {
	/** Tooltip position relative to parent (default: "topRight") */
	position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
	/** Whether tooltip opens automatically (default: false) */
	autoOpen?: boolean;
	/** Icon to display in tooltip */
	icon?: string;
}

export declare class Tooltip extends Popover {
	constructor(options?: TooltipOptions, ...children: Array<Elem | HTMLElement | string>);
}

export interface TooltipWrapperOptions extends IconOptions {
	/** Tooltip text or configuration object */
	tooltip?: string | Record<string, any>;
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
