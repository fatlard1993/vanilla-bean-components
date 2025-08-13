import { appendStyles, postCSS, themeStyles } from '../styled';
import { classSafeNanoid } from '../utils';
import { Context } from '../Context';
import { Elem } from '../Elem';

import { observeElementConnection } from './observeElementConnection';

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
	priorityOptions: new Set(['onConnected', 'textContent', 'content', 'appendTo', 'prependTo', 'value']),
};

/**
 * General purpose reactive component with automatic cleanup and lifecycle management.
 * Extends Elem with Context integration, event handling, and style processing.
 * @augments Elem
 * @augments EventTarget
 */
class Component extends Elem {
	defaultOptions = defaultOptions;

	/**
	 * Create reactive component with Context-driven options and automatic cleanup.
	 * @param {object} [options] - Component configuration
	 * @param {string} [options.tag] - HTML tag name
	 * @param {boolean|'onload'|'animationFrame'} [options.autoRender] - Render timing control
	 * @param {Set<string>} [options.registeredEvents] - Custom event types to handle via on()
	 * @param {Set<string>} [options.knownAttributes] - Attribute names for elem.setAttribute()
	 * @param {Set<string>} [options.priorityOptions] - Option keys processed first during render
	 * @param {object} [options.style] - Inline CSS properties
	 * @param {object} [options.attributes] - HTML attributes
	 * @param {string|object|Function} [options.styles] - CSS string, style object, or theme function
	 * @param {...(Component|HTMLElement|string)} children - Elements appended to append option
	 * @returns {Component} Component instance with reactive options Context
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

		this.options = new Context({
			...optionsWithoutConfig,
			addClass: [this.uniqueId, optionsWithoutConfig.addClass],
			append: [optionsWithoutConfig.append, children],
		});

		const setOption = ({ detail: { key, value } }) => this._setOption(key, value);

		this.options.addEventListener('set', setOption);

		this.addCleanup('context', () => {
			this.options.removeEventListener('set', setOption);

			Object.keys(this.options.subscriptions).forEach(id => {
				this.options.unsubscribe(id);
			});
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
		} else if (autoRender === 'animationFrame') requestAnimationFrame(() => this.render());

		if (process.env.NODE_ENV === 'development') {
			this.addClass(...this.ancestry().map(({ constructor }) => constructor.name));
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
	 * Process all options through _setOption and mark as rendered.
	 * Clears existing content when re-rendering. Priority options processed first.
	 */
	render() {
		if (this.rendered) {
			this.empty();
			this.rendered = false;
		}

		if (this.options) {
			const sortedOptions = Object.entries(this.options).reduce((options, option) => {
				if (this.__priorityOptions.has(option[0])) return [option, ...options];
				return [...options, option];
			}, []);

			sortedOptions.forEach(([key, value]) => this._setOption(key, value));
		} else this.options = {};

		this.rendered = true;
	}

	/**
	 * Route option changes to appropriate handlers based on key and value type.
	 * Called by options Context on property changes.
	 * @param {string} key - Option property name
	 * @param {*} value - New option value
	 * @private
	 */
	_setOption(key, value) {
		if (key.startsWith('on') && value) {
			const targetEvent = key.replace(/^on/, '').toLowerCase();

			if (this.on({ targetEvent, id: key, callback: value })) return;
		}

		if (key === 'uniqueId') this.elem.id = typeof value === 'string' ? value : this.uniqueId;
		else if (key === 'style') this.setStyle(value);
		else if (key === 'attributes') this.setAttributes(value);
		else if (key === 'augmentedUI') {
			if (value) this.elem.setAttribute('data-augmented-ui', typeof value === 'string' ? value : '');
			else this.elem.removeAttribute('data-augmented-ui');
		} else if (this.__knownAttributes.has(key) || key.startsWith('aria-')) {
			this.elem.setAttribute(key, value);
		} else if (typeof this[key] === 'function') this[key].call(this, value);
		else if (this.hasOwnProperty(key)) this[key] = value;
		else if (typeof this.elem[key] === 'function') {
			if (value?.elem) value = value.elem;

			this.elem[key].call(this.elem, value);
		} else if (typeof value === 'function') this[key] = value;
		else this.elem[key] = value;
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
		return Array.from(this.elem.children).flatMap(({ _component }) => [_component]);
	}

	/**
	 * Register cleanup function called on disconnect or manual cleanup.
	 * Initializes cleanup system and disconnect listener on first use.
	 * @param {string} id - Cleanup identifier for replacement/removal
	 * @param {Function} cleanupFunction - Function called during cleanup
	 */
	addCleanup(id, cleanupFunction) {
		if (!this.cleanup) {
			this.cleanup = {};

			this.on({ targetEvent: 'disconnected', callback: () => this.processCleanup(this.cleanup, true) });
		}

		this.cleanup[id] = cleanupFunction;
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

			cleanups.forEach(child => child.processCleanup());
		}

		Object.values(cleanup).forEach(cleanupFunction => cleanupFunction());
	}

	/**
	 * Register event listener with automatic cleanup and event type routing.
	 * Handles input events (adds value property), connection events (DOM observation),
	 * common pointer events, and custom registered events.
	 * @param {object} config - Event configuration
	 * @param {string} config.targetEvent - Event type name
	 * @param {string} [config.id] - Cleanup ID (defaults to targetEvent)
	 * @param {Function} config.callback - Event handler function
	 * @returns {boolean} True if event handled and registered
	 */
	on({ targetEvent, id = targetEvent, callback }) {
		if (!callback) return false;

		this.cleanup?.[id]?.();

		if (commonEvents.has(targetEvent) || this.__registeredEvents.has(targetEvent)) {
			this.elem.addEventListener(targetEvent, callback);

			this.addCleanup(id, () => this.elem.removeEventListener(targetEvent, callback));

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

			this.elem.addEventListener(targetEvent, _callback);

			this.addCleanup(id, () => this.elem.removeEventListener(targetEvent, _callback));

			return true;
		}

		if (connectionEvents.has(targetEvent)) {
			if (!this.elemObserver) {
				this.elemObserver = observeElementConnection({
					parent: this.parentElem || document,
					target: this.elem,
					onConnected: event => this.emit('connected', event),
					onDisconnected: event => this.emit('disconnected', event),
				});
			}

			this.elemObserver.observe(this.parentElem || document, { childList: true, subtree: true });

			this.addEventListener(targetEvent, callback);

			this.addCleanup(id, () => this.removeEventListener(targetEvent, callback));

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
		this.dispatchEvent(new CustomEvent(eventType, { detail }));
	}

	/**
	 * Apply styles via inline properties or scoped CSS injection.
	 * Object styles set as inline properties. String/function styles processed
	 * through theme system and injected as scoped CSS.
	 * @param {string|object|Function} styles - Style definition
	 */
	styles(styles) {
		if (!styles) return;
		if (typeof styles === 'object') {
			this?.setStyle(styles);
			return;
		}

		const themedStyles = themeStyles({ styles, scope: `.${this.uniqueId}` });

		if (typeof themedStyles === 'object') {
			this?.setStyle(themedStyles);

			return;
		}

		postCSS(themedStyles).then(css => appendStyles(css));

		this.addCleanup(this.uniqueId, () => document.getElementById(this.uniqueId)?.remove());
	}

	/**
	 * Register pointer hover handler with move tracking during hover.
	 * Callback bound to component context and called on enter and during move.
	 * @param {Function} [callback] - Handler called on pointerenter and pointermove
	 */
	onHover(callback = () => {}) {
		this.cleanup?.onHover?.();
		callback = callback.bind(this);

		const pointerEnter = event => {
			callback(event);

			this.elem.addEventListener('pointermove', callback, true);
		};

		const pointerLeave = () => {
			this.elem.removeEventListener('pointermove', callback, true);
		};

		this.elem.addEventListener('pointerenter', pointerEnter);
		this.elem.addEventListener('pointerleave', pointerLeave);
		this.elem.addEventListener('pointercancel', pointerLeave);
		this.elem.addEventListener('pointerout', pointerLeave);

		this.addCleanup('onHover', () => {
			this.elem.removeEventListener('pointerenter', pointerEnter);
			this.elem.removeEventListener('pointerleave', pointerLeave);
			this.elem.removeEventListener('pointercancel', pointerLeave);
			this.elem.removeEventListener('pointerout', pointerLeave);
			this.elem.removeEventListener('pointermove', callback, true);
		});
	}

	/**
	 * Register pointer press handler for pointerdown-to-pointerup sequences.
	 * Callback bound to component context and called on successful press completion.
	 * @param {Function} [callback] - Handler called on pointerup after pointerdown
	 */
	onPointerPress(callback = () => {}) {
		this.cleanup?.onPointerPress?.();
		callback = callback.bind(this);

		const cleanupPointerDown = () => {
			this.elem.removeEventListener('pointerup', callback);
			this.elem.removeEventListener('pointerleave', cleanupPointerDown);
			this.elem.removeEventListener('pointercancel', cleanupPointerDown);
			this.elem.removeEventListener('pointerout', cleanupPointerDown);
		};

		const pointerDown = () => {
			this.elem.addEventListener('pointerup', callback);
			this.elem.addEventListener('pointerleave', cleanupPointerDown);
			this.elem.addEventListener('pointercancel', cleanupPointerDown);
			this.elem.addEventListener('pointerout', cleanupPointerDown);
		};

		this.elem.addEventListener('pointerdown', pointerDown);

		this.addCleanup('onPointerPress', () => {
			this.elem.removeEventListener('pointerdown', pointerDown);

			cleanupPointerDown();
		});
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
