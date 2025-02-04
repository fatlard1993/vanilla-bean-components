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

/** Component - A general purpose component building block */
class Component extends Elem {
	defaultOptions = defaultOptions;

	/**
	 * Create a Component
	 * @param {object} options - The options for initializing the component
	 * @param {string} options.tag - The HTML tag
	 * @param {boolean | 'onload' | 'animationFrame'} options.autoRender - Control when to render the component
	 * @param {Set} options.knownAttributes - Options to send to elem.setAttribute
	 * @param {Set} options.priorityOptions - Options to process first when processing a whole options object
	 * @param {object} options.style - Style properties to set in the HTMLElement
	 * @param {object} options.attributes - HTML attributes to set in the HTMLElement
	 * @param {...children} children - Child elements to add to append option
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

	toString() {
		return '[object Component]';
	}

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
	 * Pseudo-protected method - setOption - Handles the behavior of a changing option where applicable
	 * (called by options Context, not intended for direct invocation)
	 * @param {string} key - The option key
	 * @param {any} value - The new option value
	 */
	_setOption(key, value) {
		if (key.startsWith('on')) {
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

	get parent() {
		return this.parentElem?._component;
	}

	get children() {
		return Array.from(this.elem.children).flatMap(({ _component }) => [_component]);
	}

	addCleanup(id, cleanupFunction) {
		if (!this.cleanup) {
			this.cleanup = {};

			this.on({ targetEvent: 'disconnected', callback: () => this.processCleanup(this.cleanup, true) });
		}

		this.cleanup[id] = cleanupFunction;
	}

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

	on({ targetEvent, id = targetEvent, callback }) {
		this.cleanup?.[id]?.();

		if (commonEvents.has(targetEvent) || this.__registeredEvents.has(targetEvent)) {
			this.elem.addEventListener(targetEvent, callback);

			this.addCleanup(id, () => this.elem.removeEventListener(targetEvent, callback));

			return true;
		}

		if (inputEvents.has(targetEvent)) {
			const _callback = event => {
				if (targetEvent === 'change') console.log(event);

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

	emit(eventType, detail) {
		this.dispatchEvent(new CustomEvent(eventType, { detail }));
	}

	styles(styles) {
		if (!styles) return;
		if (typeof styles === 'object') return this?.setStyle(styles);

		const themedStyles = themeStyles({ styles, scope: `.${this.uniqueId}` });

		if (typeof themedStyles === 'object') {
			this?.setStyle(themedStyles);

			return;
		}

		postCSS(themedStyles).then(css => appendStyles(css));

		this.addCleanup(this.uniqueId, () => document.getElementById(this.uniqueId)?.remove());
	}

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

	ancestry(targetClass = this) {
		if (!targetClass || targetClass?.constructor?.name === 'Object') return [];

		return [targetClass, ...this.ancestry(Object.getPrototypeOf(targetClass))];
	}
}

export default Component;
