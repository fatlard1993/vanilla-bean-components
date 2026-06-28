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
	'handlers',
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
	registeredEvents: new Set([]),
	knownAttributes: new Set(['role', 'name', 'colspan', 'anchor', 'popover', 'popovertarget', 'popovertargetaction']),
	get priorityOptions() {
		return new Set(['onConnected', 'textContent', 'content', 'appendTo', 'prependTo', 'value']);
	},
};

/**
 * General purpose reactive component with automatic cleanup and lifecycle management.
 * Extends Elem with Oxject-driven options, event handling, and style processing.
 * @augments Elem
 * @augments EventTarget
 */
class Component extends Elem {
	defaultOptions = defaultOptions;

	/**
	 * Creates reactive component with Oxject-driven options, automatic cleanup, and lifecycle management.
	 * @param {object} [options] - Component configuration object with reactive properties
	 * @param {string} [options.tag] - HTML tag name for the root element
	 * @param {boolean|'onload'|'animationFrame'} [options.autoRender] - Render timing: true (immediate), 'onload' (window load), 'animationFrame' (next frame), false (manual)
	 * @param {Set<string>} [options.registeredEvents] - Additional event types to handle via on() method
	 * @param {Set<string>} [options.knownAttributes] - Attribute names routed to elem.setAttribute() instead of property assignment
	 * @param {Set<string>} [options.priorityOptions] - Option keys processed first during render
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
		const { tag, autoRender, registeredEvents, knownAttributes, priorityOptions, ...optionsWithoutConfig } = {
			...defaultOptions,
			...options,
		};

		super({ tag });

		this.__registeredEvents = registeredEvents;
		this.__knownAttributes = knownAttributes;
		this.__priorityOptions = priorityOptions;

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
					`[Component] ${this.constructor.name} overrides render(). Structure belongs in build() — render() is the lifecycle orchestrator.`,
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
	 * Subclass structural hook — override to create child elements and component structure.
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
	 * Routes option changes through the static handlers chain, then standard routing.
	 *
	 * Walks the constructor chain collecting all handlers for the given key (deepest class
	 * first), then executes them in order. Each handler receives `next(value?)` — call it
	 * to continue to the next handler in the chain, or to standard routing when the chain
	 * is exhausted. Handlers that do not call `next` fully own the key.
	 * @param {string} key - Option property name being changed
	 * @param {*} value - New value being assigned to the option
	 * @private
	 */
	_setOption(key, value) {
		const chain = [];
		let klass = this.constructor;
		while (klass && klass !== Component) {
			if (Object.prototype.hasOwnProperty.call(klass, 'handlers') && klass.handlers?.[key]) {
				chain.push(klass.handlers[key]);
			}
			klass = Object.getPrototypeOf(klass);
		}

		if (chain.length > 0) {
			let i = 0;
			const next = (v = value) => {
				if (i < chain.length) chain[i++].call(this, v, next);
				else this._standardSetOption(key, v);
			};
			chain[i++].call(this, value, next);
			return;
		}

		this._standardSetOption(key, value);
	}

	/**
	 * Standard option routing pipeline — event handlers, special keys, attributes, methods, properties.
	 * Called by _setOption when no handler claims the key, or when a handler calls next() past
	 * the end of its chain.
	 * @param {string} key - Option property name
	 * @param {*} value - Value to apply
	 * @private
	 */
	_standardSetOption(key, value) {
		if (key === 'onRendered') {
			this.onRendered = value;
			return;
		}

		if (key.startsWith('on') && value) {
			const targetEvent = key.replace(/^on/, '').toLowerCase();
			if (this.on({ targetEvent, id: key, callback: value })) return;
			if (typeof this[key] !== 'function') {
				if (isDev) {
					// eslint-disable-next-line no-console
					console.warn(
						`Component._setOption(): "${key}" starts with "on" but "${targetEvent}" is not a recognized event and there is no "${key}" method. Add "${targetEvent}" to registeredEvents to register it as a custom event.`,
					);
				}
				return;
			}
			// method route — e.g. onPointerPress, onHover
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
		} else if (typeof value === 'function') this[key] = value;
		else {
			if (isDev && !(key in this.elem)) {
				// eslint-disable-next-line no-console
				console.warn(
					`Component._setOption(): unknown key "${key}" assigned directly to elem. If intentional, add to knownAttributes.`,
				);
			}
			this.elem[key] = value;
		}
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
