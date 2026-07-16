import { Oxject } from '@vanilla-bean/oxject';
import { appendStyles, themeStyles } from '../styled';
import { classSafeNanoid, isDev } from '../utils';
import { Elem } from '../Elem';

import { observeElementConnection } from './observeElementConnection';

const _internalProperties = new Set([
	'cleanup',
	'_destroyCleanup',
	'rendered',
	'elemObserver',
	'options',
	'elem',
	'tag',
	'defaultOptions',
	'__registeredEvents',
	'__knownAttributes',
	'__priorityOptions',
]);

const _lifecycleMethods = new Set([
	'render',
	'destroy',
	'build',
	'empty',
	'processCleanup',
	'addCleanup',
	'replaceCleanup',
]);

const connectionEvents = new Set(['connected', 'disconnected']);
const inputEvents = new Set(['keydown', 'keyup', 'change', 'blur', 'input', 'search']);
const commonEvents = new Set([
	'pointerover',
	'pointerenter',
	'pointerdown',
	'pointermove',
	'pointerup',
	'pointercancel',
	'pointerout',
	'pointerleave',
	'contextmenu',
]);

const defaultOptions = {
	tag: 'div',
	autoRender: true,
};

const baseKnownAttributes = new Set([
	'role',
	'name',
	'colspan',
	'anchor',
	'popover',
	'popovertarget',
	'popovertargetaction',
]);
const basePriorityOptions = new Set(['onConnected', 'textContent', 'content', 'appendTo', 'prependTo', 'value']);

const _staticsCache = new WeakMap();

/**
 * Collects a static field's own values up the constructor chain, leaf class first,
 * stopping before Component. The single walk behind every schema mechanism.
 * Results are cached per leaf class - static declarations are treated as immutable
 * after a class's first construction.
 * @param {Function} klass - Leaf constructor (new.target or this.constructor) to walk from
 * @param {string} name - Static field name ('schema', 'events', 'prepareOptions')
 * @returns {Array<*>} Own static values from leaf to root
 */
const collectStatics = (klass, name) => {
	let cache = _staticsCache.get(klass);
	if (cache?.[name]) return cache[name];

	const values = [];
	let current = klass;

	while (current && current !== Component) {
		if (Object.prototype.hasOwnProperty.call(current, name) && current[name]) values.push(current[name]);
		current = Object.getPrototypeOf(current);
	}

	if (!cache) _staticsCache.set(klass, (cache = {}));
	cache[name] = values;

	return values;
};

/**
 * Collects `default` values from static schemas up the constructor chain.
 * Parent schemas apply first so child classes override per-key. Descriptor `default`
 * is read at construction time, so getter defaults (e.g. `get default() { return document.body; }`)
 * evaluate fresh per instance.
 * @param {Function} klass - Leaf constructor (new.target) to walk from
 * @returns {object} Merged default values keyed by option name
 */
const collectSchemaDefaults = klass => {
	const defaults = {};

	// Copied before reversing - the collected array is cached and must stay leaf-first
	for (const schema of [...collectStatics(klass, 'schema')].reverse()) {
		for (const [key, descriptor] of Object.entries(schema)) {
			if (descriptor && 'default' in descriptor) defaults[key] = descriptor.default;
		}
	}

	return defaults;
};

/**
 * Collects schema keys carrying a given flag (e.g. `attribute`, `priority`) up the constructor chain.
 * The nearest class whose descriptor declares the flag decides, so a subclass can opt out
 * of a parent's flag with e.g. `attribute: false`.
 * @param {Function} klass - Leaf constructor to walk from
 * @param {string} flag - Descriptor flag name to collect
 * @returns {Set<string>} Option keys with the flag enabled
 */
const collectSchemaFlags = (klass, flag) => {
	const keys = new Set();
	const decided = new Set();

	for (const schema of collectStatics(klass, 'schema')) {
		for (const [key, descriptor] of Object.entries(schema)) {
			if (descriptor && flag in descriptor && !decided.has(key)) {
				decided.add(key);
				if (descriptor[flag]) keys.add(key);
			}
		}
	}

	return keys;
};

/**
 * Collects `static events` declarations up the constructor chain into one union.
 * @param {Function} klass - Leaf constructor to walk from
 * @returns {Set<string>} Union of every class's declared event names
 */
const collectStaticEvents = klass => new Set(collectStatics(klass, 'events').flat());

/**
 * Runs `static prepareOptions(options, children)` hooks leaf-first up the constructor chain.
 * Hooks receive the merged (schema defaults + user) options and return a transformed copy,
 * which handles computed defaults that previously required a constructor.
 * @param {Function} klass - Leaf constructor to walk from
 * @param {object} options - Merged options to transform
 * @param {Array} children - Constructor children, for hooks that derive options from them
 * @returns {object} Transformed options
 */
const runPrepareOptions = (klass, options, children) => {
	for (const prepare of collectStatics(klass, 'prepareOptions')) {
		options = prepare(options, children) ?? options;
	}

	return options;
};

const union = (base, additions) => (additions.size > 0 ? new Set([...(base || []), ...additions]) : base);

/**
 * General purpose reactive component with automatic cleanup and lifecycle management.
 * Extends Elem with Oxject-driven options, event handling, and style processing.
 *
 * Subclasses declare their option schema once via `static schema` - each key maps to a
 * descriptor defining what the option is:
 * - `default` - initial value, merged automatically (child classes override parents per-key)
 * - `set(value, next)` - change handler, chained deepest-class-first;
 *   omit `next()` to own the key, call it to continue down the chain
 * - `attribute: true` - routed to elem.setAttribute
 * - `priority: true` - processed before other keys during render
 * - `data: true` - force store-only routing; needed only when a data key's name collides
 *   with a real DOM property that standard routing would otherwise hit
 * - `enum: [...]` - valid values; assigning anything else (other than null/undefined) throws.
 *   Readable via optionEnum(key)
 *
 * Declared keys route through standard option processing (elem properties, events, methods)
 * when a real match exists, so DOM-bound defaults still reach the element - but they never
 * fall through to guessing: with no match they live in this.options, silently. Undeclared
 * keys keep the full fallback behavior including the dev warning.
 *
 * Two more statics:
 * - `static events = ['select']` - custom event names usable with on()/emit(); collected as a
 *   union up the class chain, so subclasses add to their parents' events instead of replacing them
 * - `static prepareOptions(options, children)` - pure transform of the merged
 *   (schema defaults + user) options, run leaf-first, for computed defaults that
 *   would otherwise require a constructor
 * @example
 * static schema = {
 *   tag: { default: 'canvas' },
 *   background: { default: '#FFF', set(value) { this.elem.style.background = value; } },
 *   color: { default: '#000' },
 * };
 * static events = ['line', 'draw'];
 * static prepareOptions(options) {
 *   return { ...options, style: { cursor: 'crosshair', ...options.style } };
 * }
 * @augments Elem
 * @augments EventTarget
 */
class Component extends Elem {
	get defaultOptions() {
		return { ...defaultOptions, ...collectSchemaDefaults(this.constructor) };
	}

	/**
	 * Creates reactive component with Oxject-driven options, automatic cleanup, and lifecycle management.
	 * @param {object} [options] - Component configuration object with reactive properties
	 * @param {string} [options.tag] - HTML tag name for the root element
	 * @param {boolean|'onload'|'animationFrame'} [options.autoRender] - Render timing: true (immediate), 'onload' (window load), 'animationFrame' (next frame), false (manual)
	 * @param {object} [options.style] - Inline CSS properties applied as HTMLElement.style
	 * @param {object} [options.attributes] - HTML attributes applied via setAttribute()
	 * @param {string|object|Function} [options.styles] - CSS definition: string/function processed through theme system, object applied inline
	 * @param {string} [options.textContent] - Text content for the element
	 * @param {string|string[]} [options.addClass] - CSS classes to add to the element
	 * @param {Component|HTMLElement|Array} [options.append] - Child elements to append
	 * @param {Component|HTMLElement} [options.appendTo] - Parent element to append this component to
	 * @param {Function} [options.onConnected] - Callback when component is added to DOM
	 * @param {Function} [options.onDisconnected] - Callback when component is removed from DOM
	 * @param {...(Component|HTMLElement|string)} children - Child elements automatically added to append option
	 * @returns {Component} Component instance with reactive options accessible via this.options
	 */
	constructor(options = {}, ...children) {
		const { tag, autoRender, ...optionsWithoutConfig } = runPrepareOptions(
			new.target,
			{
				...defaultOptions,
				...collectSchemaDefaults(new.target),
				...options,
			},
			children,
		);

		super({ tag });

		this.__registeredEvents = collectStaticEvents(new.target);
		this.__knownAttributes = union(baseKnownAttributes, collectSchemaFlags(new.target, 'attribute'));
		this.__priorityOptions = union(basePriorityOptions, collectSchemaFlags(new.target, 'priority'));

		this.elem._component = this;

		this.uniqueId = Object.freeze(classSafeNanoid());

		this.options = new Oxject({
			...optionsWithoutConfig,
			addClass: [this.uniqueId, optionsWithoutConfig.addClass],
			append: [optionsWithoutConfig.append, children],
		});

		const setOption = ({ detail: { key, value } }) => {
			if (this.rendered) this._setOption(key, value);
		};

		this.options.addEventListener('set', setOption);

		this.addCleanup('options', () => {
			this.options.removeEventListener('set', setOption);
			this.options.destroy?.();
		});

		if (autoRender === true) this.render();
		else if (autoRender === 'onload') {
			if (document.readyState === 'complete') this.render();
			else {
				const render = () => this.render();
				window.addEventListener('load', render);

				this.addCleanup('autoRender_onload', () => {
					window.removeEventListener('load', render);
				});
			}
		} else if (autoRender === 'animationFrame') {
			const frameId = requestAnimationFrame(() => this.render());

			this.addCleanup('autoRender_animationFrame', () => cancelAnimationFrame(frameId));
		}

		if (isDev) {
			this.addClass(...this.ancestry().map(({ constructor }) => constructor.name));

			if (this.constructor !== Component && this.constructor.prototype.hasOwnProperty('render')) {
				// eslint-disable-next-line no-console
				console.warn(
					`[Component] ${this.constructor.name} overrides render(). Structure belongs in build() - render() is the lifecycle orchestrator.`,
				);
			}
		}
	}

	/**
	 * String representation of Component instance.
	 * @returns {string} '[object Component]'
	 */
	toString() {
		return '[object Component]';
	}

	/**
	 * Subclass structural hook - override to create child elements and component structure.
	 * Called by render() before options are processed, so all structure exists
	 * before _setOption receives values.
	 */
	build() {}

	/**
	 * Process all options through _setOption with priority ordering.
	 * @private
	 */
	_processOptions() {
		if (this.options) {
			const priority = [];
			const rest = [];

			for (const entry of Object.entries(this.options)) {
				(this.__priorityOptions.has(entry[0]) ? priority : rest).push(entry);
			}

			for (const [key, value] of priority) this._setOption(key, value);
			for (const [key, value] of rest) this._setOption(key, value);
		}
	}

	/**
	 * Orchestrates the render lifecycle: empty → build() → _processOptions() → rendered.
	 * Ensures subclass structure exists before options are processed.
	 */
	render() {
		if (this.rendered) {
			this.empty();
			this.rendered = false;
		}

		try {
			this.build();
			this._processOptions();
		} catch (error) {
			this.processCleanup();
			throw error;
		}

		this.rendered = true;
		this.onRendered?.();
	}

	/**
	 * Routes option changes through the schema set chain, then standard routing.
	 *
	 * Walks the constructor chain collecting every `static schema` set function for the
	 * given key (deepest class first), then executes them in order. Each receives
	 * `next(value?)` - call it to continue to the next in the chain, or to standard
	 * routing when the chain is exhausted. Not calling `next` fully owns the key.
	 * Keys flagged `data: true` never reach standard routing at all.
	 * @param {string} key - Option property name being changed
	 * @param {*} value - New value being assigned to the option
	 * @private
	 */
	_setOption(key, value) {
		const chain = [];
		let dataOption;
		let enumValues;
		let enumDecided = false;

		// set functions chain across the class hierarchy; scalar fields (data, enum) are
		// decided by the nearest class whose descriptor declares them, so subclasses can
		// opt out with data: false or enum: null
		let declared = false;
		for (const schema of collectStatics(this.constructor, 'schema')) {
			const descriptor = schema[key];
			if (!descriptor) continue;
			declared = true;
			if (descriptor.set) chain.push(descriptor.set);
			if (dataOption === undefined && 'data' in descriptor) dataOption = !!descriptor.data;
			if (!enumDecided && 'enum' in descriptor) {
				enumDecided = true;
				enumValues = descriptor.enum;
			}
		}

		if (enumValues && value !== undefined && value !== null && !enumValues.includes(value)) {
			throw new Error(
				`"${value}" is not a valid ${key}. The ${key} must be one of the following values: ${enumValues.join(', ')}`,
			);
		}

		if (chain.length > 0) {
			let i = 0;
			const next = (v = value) => {
				if (i < chain.length) chain[i++].call(this, v, next);
				else if (!dataOption) this._standardSetOption(key, v, declared);
			};
			chain[i++].call(this, value, next);
			return;
		}

		if (dataOption) return;
		this._standardSetOption(key, value, declared);
	}

	/**
	 * Standard option routing pipeline - event handlers, special keys, attributes, methods, properties.
	 * Called by _setOption when no set claims the key, or when a set calls next() past
	 * the end of its chain.
	 *
	 * Declared keys never fall through to guessing: they route to a real match (elem property,
	 * registered event, attribute) or stay store-only, silently. The unknown-key warning and
	 * elem expando assignment apply only to undeclared keys.
	 * @param {string} key - Option property name
	 * @param {*} value - Value to apply
	 * @param {boolean} [declared] - Whether any class's schema declares this key
	 * @private
	 */
	_standardSetOption(key, value, declared = false) {
		if (key === 'onRendered') {
			this.onRendered = value;
			return;
		}

		if (key.startsWith('on') && value) {
			const targetEvent = key.replace(/^on/, '').toLowerCase();
			if (this.on({ targetEvent, id: key, callback: value })) return;
			if (typeof this[key] !== 'function') {
				// Declared callback options (e.g. onSort, onButtonPress) live in this.options,
				// invoked by the component itself rather than the event system
				if (!declared && isDev) {
					// eslint-disable-next-line no-console
					console.warn(
						`Component._setOption(): "${key}" starts with "on" but "${targetEvent}" is not a recognized event and there is no "${key}" method. Add "${targetEvent}" to static events to register it as a custom event.`,
					);
				}
				return;
			}
			// method route - e.g. onPointerPress, onHover
		}

		if (key === 'uniqueId') this.elem.id = typeof value === 'string' ? value : this.uniqueId;
		else if (key === 'style') this.setStyle(value);
		else if (key === 'attributes') this.setAttributes(value);
		else if (this.__knownAttributes.has(key) || key.startsWith('aria-') || key.startsWith('data-')) {
			if (value === null || value === undefined || value === false) this.elem.removeAttribute(key);
			else this.elem.setAttribute(key, typeof value === 'boolean' ? '' : String(value));
		} else if (typeof this[key] === 'function') {
			if (_lifecycleMethods.has(key)) return;
			this[key].call(this, value);
		} else if (this.hasOwnProperty(key) && !_internalProperties.has(key)) this[key] = value;
		else if (typeof this.elem[key] === 'function') {
			if (value?.elem) value = value.elem;

			this.elem[key].call(this.elem, value);
		} else if (typeof value === 'function') {
			if (declared) return;
			this[key] = value;
		} else {
			if (!(key in this.elem) && declared) return;
			if (isDev && !(key in this.elem)) {
				// eslint-disable-next-line no-console
				console.warn(
					`Component._setOption(): unknown key "${key}" assigned directly to elem. If intentional, declare it in the static schema.`,
				);
			}
			this.elem[key] = value;
		}
	}

	/**
	 * Looks up the declared enum for an option key from the schema chain (nearest class wins).
	 * @param {string} key - Option property name
	 * @returns {Array<*>|undefined} Valid values declared for the key, or undefined if unconstrained
	 */
	optionEnum(key) {
		for (const schema of collectStatics(this.constructor, 'schema')) {
			if (schema[key]?.enum) return schema[key].enum;
		}

		return undefined;
	}

	/**
	 * Get parent Component instance.
	 * @returns {Component|undefined} Parent component or undefined if none
	 */
	get parent() {
		return this.parentElem?._component;
	}

	/**
	 * Get child Component instances.
	 * @returns {Component[]} Array of child components
	 */
	get children() {
		return Array.from(this.elem.children).flatMap(({ _component }) => (_component ? [_component] : []));
	}

	/**
	 * Removes all child elements after running cleanup on descendant components.
	 * @returns {this} The component instance
	 */
	empty() {
		const cleanupDescendants = element => {
			for (const child of Array.from(element.children)) {
				cleanupDescendants(child);
				child._component?.processCleanup?.();
			}
		};
		cleanupDescendants(this.elem);
		this.elem.replaceChildren();
		return this;
	}

	/**
	 * Register cleanup function called on disconnect or manual cleanup.
	 * Chains with any existing cleanup for the same ID (both will run).
	 * Use replaceCleanup() instead when rebinding (e.g., event handlers in loops).
	 * Initializes cleanup system and disconnect listener on first use.
	 * @param {string} id - Cleanup identifier
	 * @param {Function} cleanupFunction - Function called during cleanup
	 */
	addCleanup(id, cleanupFunction) {
		this._initCleanup();

		const existing = this.cleanup[id];
		this.cleanup[id] = existing
			? () => {
					try {
						existing();
					} catch (error) {
						// eslint-disable-next-line no-console
						console.error('Cleanup error:', error);
					}
					try {
						cleanupFunction();
					} catch (error) {
						// eslint-disable-next-line no-console
						console.error('Cleanup error:', error);
					}
				}
			: cleanupFunction;
	}

	/**
	 * Register cleanup that replaces any existing cleanup for the same ID.
	 * Runs the previous cleanup immediately before storing the new one.
	 * @param {string} id - Cleanup identifier
	 * @param {Function} cleanupFunction - Function called during cleanup
	 */
	replaceCleanup(id, cleanupFunction) {
		this._initCleanup();

		this.cleanup[id]?.();
		this.cleanup[id] = cleanupFunction;
	}

	/**
	 * Register cleanup that only runs on destroy(), not on disconnect.
	 * Use for element-level event listeners that must survive temporary DOM moves.
	 * @param {string} id - Cleanup identifier
	 * @param {Function} cleanupFunction - Function called during destroy
	 */
	replaceDestroyCleanup(id, cleanupFunction) {
		if (!this._destroyCleanup) this._destroyCleanup = {};
		this._destroyCleanup[id]?.();
		this._destroyCleanup[id] = cleanupFunction;
	}

	/** @private */
	_initCleanup() {
		if (!this.cleanup) {
			this.cleanup = {};
			this.on({ targetEvent: 'disconnected', callback: () => this.processCleanup(this.cleanup, true) });
		}
	}

	/**
	 * Execute cleanup functions for this component and optionally children.
	 * @param {object} [cleanup] - Cleanup functions object (defaults to this.cleanup)
	 * @param {boolean} [rootCleanup] - Whether to recursively clean up child components
	 */
	processCleanup(cleanup = this.cleanup || {}, rootCleanup = false) {
		if (rootCleanup) {
			const cleanups = [];
			const collectCleanups = children => {
				children.forEach(child => {
					if (!child) return;

					if (child.cleanup) cleanups.push(child);

					collectCleanups(child.children);
				});
			};

			collectCleanups(this.children);

			cleanups.forEach(child => {
				child.processCleanup();
				if (child._destroyCleanup) child.processCleanup(child._destroyCleanup);
			});
		}

		const fns = Object.values(cleanup);
		for (const key in cleanup) delete cleanup[key];

		fns.forEach(cleanupFunction => {
			try {
				cleanupFunction();
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error('Cleanup error:', error);
			}
		});
	}

	/**
	 * Destroys this component and all children. Runs all cleanup functions,
	 * clears registries, and removes from DOM.
	 */
	destroy() {
		this.elemObserver?.disconnect();

		// Disconnect descendant elemObservers before running cleanup
		const disconnectDescendantObservers = children => {
			children.forEach(child => {
				child.elemObserver?.disconnect();
				disconnectDescendantObservers(child.children);
			});
		};
		disconnectDescendantObservers(this.children);

		this.processCleanup(this.cleanup, true);
		if (this._destroyCleanup) this.processCleanup(this._destroyCleanup);
		this.elem?.remove();
	}

	/**
	 * Registers event listener with automatic cleanup and enhanced event processing.
	 *
	 * Provides specialized handling for input events (adds .value property),
	 * connection events (DOM observation), and common pointer events.
	 * @param {object} config - Event registration configuration
	 * @param {string} config.targetEvent - Event type to listen for
	 * @param {string} [config.id] - Unique identifier for cleanup management
	 * @param {Function} config.callback - Event handler function, bound to component context for input events
	 * @returns {boolean} True if event type was recognized and registered, false if unsupported
	 */
	on({ targetEvent, id = targetEvent, callback }) {
		if (!callback) return false;

		if (commonEvents.has(targetEvent) || this.__registeredEvents.has(targetEvent)) {
			this.replaceDestroyCleanup(id, () => this.elem.removeEventListener(targetEvent, callback));
			this.elem.addEventListener(targetEvent, callback);

			return true;
		}

		if (inputEvents.has(targetEvent)) {
			const _callback = event => {
				event.value =
					event.target.type === 'checkbox'
						? event.target.checked
						: (event?.detail?.value ?? event.target.value ?? this.options.value ?? this.elem.value);

				callback.call(this, event);
			};

			this.replaceDestroyCleanup(id, () => this.elem.removeEventListener(targetEvent, _callback));
			this.elem.addEventListener(targetEvent, _callback);

			return true;
		}

		if (connectionEvents.has(targetEvent)) {
			if (!this.elemObserver) {
				this.elemObserver = observeElementConnection({
					target: this.elem,
					onConnected: event => this.emit('connected', event),
					onDisconnected: event => this.emit('disconnected', event),
				});

				this.addCleanup('elemObserver', () => this.elemObserver?.disconnect());
			}

			this.replaceDestroyCleanup(id, () => this.removeEventListener(targetEvent, callback));
			this.addEventListener(targetEvent, callback);

			return true;
		}

		return false;
	}

	/**
	 * Dispatch custom event on this component.
	 * @param {string} eventType - Event type name
	 * @param {*} [detail] - Event detail data
	 */
	emit(eventType, detail) {
		// Two separate instances: a fired CustomEvent cannot be re-dispatched per spec.
		this.dispatchEvent(new CustomEvent(eventType, { detail }));
		this.elem.dispatchEvent(new CustomEvent(eventType, { detail }));
	}

	/**
	 * Applies styles via inline properties or scoped CSS injection with theme processing.
	 *
	 * Object styles are applied as inline properties. String/function styles are
	 * processed through the theme system and injected as scoped CSS.
	 * @param {string|object|Function} styles - Style definition: object for inline styles, string/function for scoped CSS
	 */
	styles(styles) {
		if (!styles) return;
		if (typeof styles === 'object') {
			this.setStyle(styles);
			return;
		}

		const themedStyles = themeStyles({ styles, scope: `.${this.uniqueId}` });

		if (typeof themedStyles === 'object') {
			this.setStyle(themedStyles);
			return;
		}

		appendStyles(themedStyles, this.uniqueId);

		this.replaceDestroyCleanup(this.uniqueId, () => {
			document.getElementById(this.uniqueId)?.remove();
		});
	}

	/**
	 * Register pointer hover handler with move tracking during hover.
	 * Callback bound to component context and called on enter and during move.
	 * @param {Function} [callback] - Handler called on pointerenter and pointermove
	 */
	onHover(callback = () => {}) {
		callback = callback.bind(this);

		const pointerEnter = event => {
			callback(event);

			this.elem.addEventListener('pointermove', callback, true);
		};

		const pointerLeave = () => {
			this.elem.removeEventListener('pointermove', callback, true);
		};

		this.replaceDestroyCleanup('onHover', () => {
			this.elem.removeEventListener('pointerenter', pointerEnter);
			this.elem.removeEventListener('pointerleave', pointerLeave);
			this.elem.removeEventListener('pointercancel', pointerLeave);
			this.elem.removeEventListener('pointerout', pointerLeave);
			this.elem.removeEventListener('pointermove', callback, true);
		});

		this.elem.addEventListener('pointerenter', pointerEnter);
		this.elem.addEventListener('pointerleave', pointerLeave);
		this.elem.addEventListener('pointercancel', pointerLeave);
		this.elem.addEventListener('pointerout', pointerLeave);
	}

	/**
	 * Register pointer press handler. Fires on pointerdown for immediate, reliable response
	 * across all contexts including scroll containers and modal dialogs.
	 * @param {Function} [callback] - Handler called on pointerdown on this element
	 */
	onPointerPress(callback = () => {}) {
		callback = callback.bind(this);
		this.replaceDestroyCleanup('onPointerPress', () => this.elem.removeEventListener('pointerdown', callback));
		this.elem.addEventListener('pointerdown', callback);
	}

	/**
	 * Get prototype chain from this instance up to Object.
	 * @param {object} [targetClass] - Starting point for traversal (defaults to this)
	 * @returns {object[]} Array of prototype objects in inheritance order
	 */
	ancestry(targetClass = this) {
		if (!targetClass || targetClass?.constructor?.name === 'Object') return [];

		return [targetClass, ...this.ancestry(Object.getPrototypeOf(targetClass))];
	}
}

export default Component;
