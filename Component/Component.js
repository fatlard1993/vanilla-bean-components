import { customAlphabet } from 'nanoid';

import Context from '../Context';
import Elem from '../Elem';
import { processStyles, appendStyles } from './utils';
import { observeElementConnection } from './utils/elem';
import context from './context';

// eslint-disable-next-line spellcheck/spell-checker
const classId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

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
	knownAttributes: new Set(['role', 'name', 'colspan']),
	priorityOptions: new Set(['onConnected', 'textContent', 'content', 'appendTo', 'prependTo', 'value']),
};

/** Component - A general purpose component building block */
class Component extends Elem {
	defaultOptions = defaultOptions;

	/**
	 * Create a Component
	 * @param {Object} options - The options for initializing the component
	 * @param {String} options.tag - The HTML tag
	 * @param {Boolean} options.autoRender - Automatically render the component when constructed
	 * @param {Set} options.knownAttributes - Options to send to elem.setAttribute
	 * @param {Set} options.priorityOptions - Options to process first when processing a whole options object
	 * @param {Object} options.style - Style properties to set in the HTMLElement
	 * @param {Object} options.attributes - HTML attributes to set in the HTMLElement
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

		this.options = new Context({
			...optionsWithoutConfig,
			...(children.length > 0 ? { append: [optionsWithoutConfig.append, ...children] } : {}),
		});

		this.options.addEventListener('set', ({ detail: { key, value } }) => this.setOption(key, value));

		this.classId = Object.freeze(classId());

		this.elem._component = this;

		this.addClass(this.classId);

		if (autoRender === true) this.render();
		else if (autoRender === 'onload') {
			if (document.readyState === 'complete') this.render();
			else window.addEventListener('load', () => this.render());
		} else if (autoRender === 'animationFrame') requestAnimationFrame(() => this.render());
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

			sortedOptions.forEach(([key, value]) => this.setOption(key, value));
		} else this.options = {};

		this.rendered = true;
	}

	setOption(key, value) {
		if (key.startsWith('on')) {
			const targetEvent = key.replace(/^on/, '').toLowerCase();

			if (this.on({ targetEvent, id: key, callback: value })) return;
		}

		if (key === 'style') this.setStyle(value);
		else if (key === 'attributes') this.setAttributes(value);
		else if (this.__knownAttributes.has(key) || key.startsWith('aria-')) {
			this.elem.setAttribute(key, value);
		} else if (typeof this[key] === 'function') this[key].call(this, value);
		else if (this.hasOwnProperty(key)) this[key] = value;
		else if (typeof this.elem[key] === 'function') {
			if (value?.elem) value = value.elem;

			this.elem[key].call(this.elem, value);
		} else if (typeof value === 'function') this[key] = value;
		else this.elem[key] = value;
	}

	get parentElem() {
		return this.elem?.parentElement;
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

		if (commonEvents.has(targetEvent)) {
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

		if (this.__registeredEvents.has(targetEvent)) {
			this.addEventListener(targetEvent, callback);

			this.addCleanup(id, () => this.removeEventListener(targetEvent, callback));

			return true;
		}
	}

	emit(eventType, detail) {
		this.dispatchEvent(new CustomEvent(eventType, { detail }));
	}

	styles(styles) {
		if (!styles) return;

		processStyles({ styles, theme: context.theme, context: this, scope: `body ${this.tag}.${this.classId}` }).then(
			css => {
				if (!css) return;

				appendStyles(css, this.classId);

				this.addCleanup(this.classId, () => document.getElementById(this.classId)?.remove());
			},
		);
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
}

export default Component;
