import { customAlphabet } from 'nanoid';
import postcss from 'postcss';
import plugin_autoprefixer from 'autoprefixer';
import plugin_nested from 'postcss-nested';

import { appendStyles, buildClassList, removeExcessIndentation, Context } from './utils';
import context from './context';

// eslint-disable-next-line spellcheck/spell-checker
const classId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

/** DomElem - A general purpose base element building block */
class DomElem {
	isDomElem = true;

	defaultOptions = {
		tag: 'div',
		autoRender: true,
		knownAttributes: new Set(['role']),
		priorityOptions: new Set(['textContent', 'content', 'appendTo', 'prependTo']),
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
		const { tag, autoRender, knownAttributes, priorityOptions, ...optionsWithoutConfig } = {
			...this.defaultOptions,
			...options,
		};

		this.__knownAttributes = knownAttributes;
		this.__priorityOptions = priorityOptions;

		this.options = new Context({ ...optionsWithoutConfig, append: [optionsWithoutConfig.append, ...children] });

		this.options.addEventListener('set', ({ detail: { key, value } }) => this.setOption(key, value));

		this.classId = Object.freeze(classId());

		this.elem = document.createElement(tag);
		this.elem._domElem = this;

		this.addClass(this.classId);

		if (autoRender === true) this.render();
		else if (autoRender === 'onload') {
			if (document.readyState === 'complete') this.render();
			else window.addEventListener('load', () => this.render());
		} else if (autoRender === 'animationFrame') requestAnimationFrame(() => this.render());
	}

	render(options = this.options) {
		if (this.rendered) {
			this.empty();
			this.rendered = false;
		}

		if (options) {
			const sortedOptions = Object.entries(options).reduce((_options, option) => {
				if (this.__priorityOptions.has(option[0])) return [option, ..._options];
				return [..._options, option];
			}, []);

			sortedOptions.forEach(([name, value]) => this.setOption(name, value));
		}

		this.rendered = true;
	}

	setOption(key, value) {
		if (value?.__isSubscriber && typeof value.subscribe === 'function') {
			value.subscribe(_value => (this.options[key] = _value));
			value = value.current;
		}

		if (key === 'style') Object.keys(value).forEach(key => (this.elem.style[key] = value[key]));
		else if (key === 'attributes') this.setAttributes(value);
		else if (this.__knownAttributes.has(key) || key.startsWith('aria-')) {
			this.elem.setAttribute(key, value);
		} else if (typeof this[key] === 'function') this[key].call(this, value);
		else if (this.hasOwnProperty(key)) this[key] = value;
		else if (typeof this.elem[key] === 'function') {
			if (value?.isDomElem) value = value.elem;

			this.elem[key].call(this.elem, value);
		} else {
			if (!Object.isFrozen(this[key])) this[key] = value;

			this.elem[key] = value;
		}
	}

	setOptions(options) {
		Object.entries(options).forEach(([name, value]) => (this.options[name] = value));
	}

	hasClass(...classes) {
		return classes.flat(Number.Infinity).every(className => {
			const classRegex = className instanceof RegExp ? className : new RegExp(`\\b${className}\\b`, 'g');

			return classRegex.test(this.elem.className);
		});
	}

	addClass(...classes) {
		this.elem.classList.add(...buildClassList(classes));

		return this;
	}

	removeClass(...classes) {
		classes.flat(Number.Infinity).forEach(className => {
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
	}

	prepend(...children) {
		[children].flat(Number.POSITIVE_INFINITY).forEach(child => {
			if (!child) return;

			if (child?.isDomElem) child = child.elem;

			if (this.elem.firstChild) this.elem.insertBefore(child, this.elem.firstChild);
			else this.elem.append(child);
		});
	}

	setAttributes(attributes) {
		Object.entries(attributes).forEach(([key, value]) => this.elem.setAttribute(key, value));
	}

	styles(styles) {
		postcss([plugin_nested, plugin_autoprefixer])
			.process(
				(process.env.NODE_ENV === 'development' ? x => x : removeExcessIndentation)(`
					.${this.classId} {
						${styles(context.theme, this)}
					}
				`),
				{ from: undefined },
			)
			.then(({ css }) => {
				appendStyles(css);
			})
			// eslint-disable-next-line no-console
			.catch(process.env.NODE_ENV === 'development' ? console.error : () => {});
	}

	globalStyles(styles) {
		postcss([plugin_nested, plugin_autoprefixer])
			.process(
				(process.env.NODE_ENV === 'development' ? x => x : removeExcessIndentation)(styles(context.theme, this)),
				{ from: undefined },
			)
			.then(({ css }) => appendStyles(css))
			// eslint-disable-next-line no-console
			.catch(process.env.NODE_ENV === 'development' ? console.error : () => {});
	}

	detectTouch() {
		if (this.__touchDetectionEnabled) return;

		this.__touchDetectionEnabled = true;

		this.__detectTouch = ({ type }) => {
			context.isTouchDevice = type.startsWith('touch');
		};

		document.addEventListener('touchstart', this.__detectTouch);
		document.addEventListener('touchend', this.__detectTouch);
		document.addEventListener('touchcancel', this.__detectTouch);
		document.addEventListener('mousedown', this.__detectTouch);
		document.addEventListener('mouseup', this.__detectTouch);
	}

	pointerEventPolyfill(event) {
		event.stop = () => {
			if (event.cancelable) event.preventDefault();

			if (event.stopPropagation) event.stopPropagation();
		};

		if (!event.pointerType) {
			if (event.type.startsWith('touch')) event.pointerType = 'touch';
			else if (event.type.startsWith('mouse')) event.pointerType = 'mouse';
			else event.pointerType = context.isTouchDevice ? 'touch' : 'mouse';
		}

		return event;
	}

	wrapPointerCallback(callback = () => {}) {
		return event => {
			event = this.pointerEventPolyfill(event);

			if (context.isTouchDevice && event.pointerType !== 'touch') return;

			callback.call(this, event);
		};
	}

	onContextMenu(callback) {
		callback = this.wrapPointerCallback(callback);

		this.elem.addEventListener('contextmenu', callback);

		return () => this.elem.removeEventListener('contextmenu', callback);
	}

	onHover(callback) {
		callback = this.wrapPointerCallback(callback);

		const mouseEnter = event => {
			callback(event);

			this.elem.addEventListener('mousemove', callback, true);
		};

		const mouseLeave = () => {
			this.elem.removeEventListener('mousemove', callback, true);
		};

		this.elem.addEventListener('mouseenter', mouseEnter);
		this.elem.addEventListener('mouseleave', mouseLeave);

		return () => {
			this.elem.removeEventListener('mouseenter', mouseEnter);
			this.elem.removeEventListener('mouseleave', mouseLeave);
			this.elem.removeEventListener('mousemove', callback, true);
		};
	}

	onMouseLeave(callback) {
		callback = this.wrapPointerCallback(callback);

		this.elem.addEventListener('mouseleave', callback);

		return () => this.elem.removeEventListener('mouseleave', callback);
	}

	onPointerDown(callback) {
		callback = this.wrapPointerCallback(callback);

		this.elem.addEventListener('touchstart', callback);
		this.elem.addEventListener('mousedown', callback);

		return () => {
			this.elem.removeEventListener('touchstart', callback);
			this.elem.removeEventListener('mousedown', callback);
		};
	}

	onPointerUp(callback) {
		callback = this.wrapPointerCallback(callback);

		this.elem.addEventListener('touchend', callback);
		this.elem.addEventListener('touchcancel', callback);
		this.elem.addEventListener('mouseup', callback);

		return () => {
			this.elem.removeEventListener('touchend', callback);
			this.elem.removeEventListener('touchcancel', callback);
			this.elem.removeEventListener('mouseup', callback);
		};
	}

	onPointerPress(callback) {
		const wrappedCallback = event => {
			event = this.pointerEventPolyfill(event);

			if (this.pointerUpOff) this.pointerUpOff();

			if (event.target !== this.elem || (context.isTouchDevice && event.pointerType !== 'touch')) return;

			callback.call(this, event);
		};

		const pointerDown = event => {
			event = this.pointerEventPolyfill(event);

			if (event.target !== this.elem || (context.isTouchDevice && event.pointerType !== 'touch')) return;

			document.addEventListener('touchend', wrappedCallback, true);
			document.addEventListener('touchcancel', wrappedCallback, true);
			document.addEventListener('mouseup', wrappedCallback, true);

			this.pointerUpOff = () => {
				document.removeEventListener('touchend', wrappedCallback, true);
				document.removeEventListener('touchcancel', wrappedCallback, true);
				document.removeEventListener('mouseup', wrappedCallback, true);

				this.pointerUpOff = undefined;
			};
		};

		this.elem.addEventListener('touchstart', pointerDown);
		this.elem.addEventListener('mousedown', pointerDown);

		return () => {
			this.elem.removeEventListener('touchstart', pointerDown);
			this.elem.removeEventListener('mousedown', pointerDown);

			document.removeEventListener('touchend', wrappedCallback);
			document.removeEventListener('touchcancel', wrappedCallback);
			document.removeEventListener('mouseup', wrappedCallback);
		};
	}

	onPointerPressAndHold(callback) {
		this.elem.dataset.pressAndHoldTime = this.elem.dataset.pressAndHoldTime || 900;

		const pointerUp = () => {
			this.pointerUpOff();
		};

		const pointerDown = event => {
			event = this.pointerEventPolyfill(event);

			if (event.target !== this.elem || (context.isTouchDevice && event.pointerType !== 'touch')) return;

			this.addClass('pointerHold');

			this.holdTimeout = setTimeout(() => {
				callback.call(this, event);
			}, Number.parseInt(this.elem.dataset.pressAndHoldTime));

			document.addEventListener('touchend', pointerUp, true);
			document.addEventListener('touchcancel', pointerUp, true);
			document.addEventListener('mouseup', pointerUp, true);
			this.elem.addEventListener('mouseleave', pointerUp, true);

			this.pointerUpOff = () => {
				clearTimeout(this.holdTimeout);

				this.removeClass('pointerHold');

				document.removeEventListener('touchend', pointerUp, true);
				document.removeEventListener('touchcancel', pointerUp, true);
				document.removeEventListener('mouseup', pointerUp, true);
				this.elem.removeEventListener('mouseleave', pointerUp, true);

				this.pointerUpOff = undefined;
			};
		};

		this.elem.addEventListener('touchstart', pointerDown);
		this.elem.addEventListener('mousedown', pointerDown);

		return () => {
			this.elem.removeEventListener('touchstart', pointerDown);
			this.elem.removeEventListener('mousedown', pointerDown);

			document.removeEventListener('touchend', pointerUp, true);
			document.removeEventListener('touchcancel', pointerUp, true);
			document.removeEventListener('mouseup', pointerUp, true);
			this.elem.removeEventListener('mouseleave', pointerUp, true);
		};
	}

	onKeyDown(callback) {
		const wrappedCallback = event => {
			event.value = event.target.value || this.elem.value || this.value;

			callback(event);
		};

		this.elem.addEventListener('keydown', wrappedCallback);

		return () => this.elem.removeEventListener('keydown', wrappedCallback);
	}

	onKeyUp(callback) {
		const wrappedCallback = event => {
			event.value = event.target.value || this.elem.value || this.value;

			callback(event);
		};

		this.elem.addEventListener('keyup', wrappedCallback);

		return () => this.elem.removeEventListener('keyup', wrappedCallback);
	}

	onChange(callback) {
		const wrappedCallback = event => {
			event.value = event.target.value || this.elem.value || this.value;

			callback(event);
		};

		this.elem.addEventListener('change', wrappedCallback);

		return () => this.elem.removeEventListener('change', wrappedCallback);
	}

	onBlur(callback) {
		const wrappedCallback = event => {
			event.value = event.target.value || this.elem.value || this.value;

			callback(event);
		};

		this.elem.addEventListener('blur', wrappedCallback);

		return () => this.elem.removeEventListener('blur', wrappedCallback);
	}
}

export default DomElem;
