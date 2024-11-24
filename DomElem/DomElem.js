import { customAlphabet } from 'nanoid';

import { processStyles, appendStyles, buildClassList, Context } from './utils';
import context from './context';
import { observeElementConnection } from './utils/elem';

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

/** DomElem - A general purpose base element building block */
class DomElem extends EventTarget {
	isDomElem = true;

	defaultOptions = {
		tag: 'div',
		autoRender: true,
		registeredEvents: new Set([]),
		knownAttributes: new Set(['role', 'name', 'colspan']),
		priorityOptions: new Set(['onConnected', 'textContent', 'content', 'appendTo', 'prependTo', 'value']),
	};

	/**
	 * Create a DomElem component
	 * @param {Object} options - The options for initializing the component
	 * @param {String} options.tag - The HTML tag
	 * @param {Boolean} options.autoRender - Automatically render the component when constructed
	 * @param {Set} options.knownAttributes - Options to send to elem.setAttribute
	 * @param {Set} options.priorityOptions - Options to process first when processing a whole options object
	 * @param {Object} options.style - Style properties to set in the resulting HTMLElement
	 * @param {...children} children - Child elements to add to append option
	 */
	constructor(options = {}, ...children) {
		super();

		const { tag, autoRender, registeredEvents, knownAttributes, priorityOptions, ...optionsWithoutConfig } = {
			...this.defaultOptions,
			...options,
		};

		this.__registeredEvents = registeredEvents;
		this.__knownAttributes = knownAttributes;
		this.__priorityOptions = priorityOptions;

		this.options = new Context({ ...optionsWithoutConfig, append: [optionsWithoutConfig.append, ...children] });

		this.options.addEventListener('set', ({ detail: { key, value } }) => this.setOption(key, value));

		this.classId = Object.freeze(classId());

		this.tag = tag;
		this.elem = document.createElement(tag);
		this.elem._domElem = this;
		this.cleanup = {};

		this.addClass(this.classId);

		if (autoRender === true) this.render();
		else if (autoRender === 'onload') {
			if (document.readyState === 'complete') this.render();
			else window.addEventListener('load', () => this.render());
		} else if (autoRender === 'animationFrame') requestAnimationFrame(() => this.render());
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
			if (value?.isDomElem) value = value.elem;

			this.elem[key].call(this.elem, value);
		} else if (typeof value === 'function') this[key] = value;
		else this.elem[key] = value;
	}

	get parentElem() {
		return this.elem?.parentElement;
	}

	get parent() {
		return this.parentElem?._domElem;
	}

	on({ targetEvent, id = targetEvent, callback }) {
		this.cleanup[id]?.();

		if (commonEvents.has(targetEvent)) {
			this.elem.addEventListener(targetEvent, callback);

			this.cleanup[id] = () => this.elem.removeEventListener(targetEvent, callback);

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

			this.cleanup[id] = () => this.elem.removeEventListener(targetEvent, _callback);

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

			this.cleanup[id] = () => this.removeEventListener(targetEvent, callback);

			return true;
		}

		if (this.__registeredEvents.has(targetEvent)) {
			this.addEventListener(targetEvent, callback);

			this.cleanup[id] = () => this.removeEventListener(targetEvent, callback);

			return true;
		}
	}

	emit(eventType, detail) {
		this.dispatchEvent(new CustomEvent(eventType, { detail }));
	}

	setOptions(options) {
		Object.entries(options).forEach(([name, value]) => (this.options[name] = value));

		return this;
	}

	setStyle(style) {
		Object.entries(style).forEach(([key, value]) => (this.elem.style[key] = value));

		return this;
	}

	setAttributes(attributes) {
		Object.entries(attributes).forEach(([key, value]) => this.elem.setAttribute(key, value));

		return this;
	}

	hasClass(...classes) {
		return classes.flat(Number.POSITIVE_INFINITY).every(className => {
			const classRegex = className instanceof RegExp ? className : new RegExp(`\\b${className}\\b`, 'g');

			return classRegex.test(this.elem.className);
		});
	}

	addClass(...classes) {
		this.elem.classList.add(...buildClassList(classes));

		return this;
	}

	removeClass(...classes) {
		classes.flat(Number.POSITIVE_INFINITY).forEach(className => {
			const classRegex = className instanceof RegExp ? className : new RegExp(`\\b${className}\\b`, 'g');

			if (classRegex.test(this.elem.className)) {
				this.elem.className = this.elem.className.replaceAll(classRegex, '');
			}
		});

		return this;
	}

	toString() {
		return '[object DomElem]';
	}

	empty() {
		this.elem.replaceChildren();
	}

	content(content) {
		if (typeof content === 'string') this.elem.textContent = content;
		else {
			this.empty();
			this.append(content);
		}
	}

	appendTo(parentElem) {
		if (parentElem?.append) parentElem.append(this.elem);
	}

	prependTo(parentElem) {
		if (parentElem.firstChild) parentElem.insertBefore(this.elem, parentElem.firstChild);
		else parentElem.append(this.elem);
	}

	append(...children) {
		[children].flat(Number.POSITIVE_INFINITY).forEach(child => {
			if (!child) return;

			if (child?.isDomElem) child = child.elem;

			this.elem.append(child);
		});

		return this;
	}

	prepend(...children) {
		[children].flat(Number.POSITIVE_INFINITY).forEach(child => {
			if (!child) return;

			if (child?.isDomElem) child = child.elem;

			if (this.elem.firstChild) this.elem.insertBefore(child, this.elem.firstChild);
			else this.elem.append(child);
		});

		return this;
	}

	styles(styles) {
		processStyles({ styles, theme: context.theme, context: this, scope: `body ${this.tag}.${this.classId}` }).then(
			css => appendStyles(css),
		);
	}

	onHover(callback = () => {}) {
		this.cleanup.onHover?.();
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

		this.cleanup.onHover = () => {
			this.elem.removeEventListener('pointerenter', pointerEnter);
			this.elem.removeEventListener('pointerleave', pointerLeave);
			this.elem.removeEventListener('pointercancel', pointerLeave);
			this.elem.removeEventListener('pointerout', pointerLeave);
			this.elem.removeEventListener('pointermove', callback, true);
		};
	}

	onPointerPress(callback = () => {}) {
		this.cleanup.onPointerPress?.();
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

		this.cleanup.onPointerPress = () => {
			this.elem.removeEventListener('pointerdown', pointerDown);

			cleanupPointerDown();
		};
	}
}

export default DomElem;
