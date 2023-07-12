import { customAlphabet } from 'nanoid';
import postcss from 'postcss';
import plugin_autoprefixer from 'autoprefixer';
import plugin_nested from 'postcss-nested';

import {
	remove,
	empty,
	appendStyles,
	buildClassName,
	getElemIndex,
	isDescendantOf,
	buildClassList,
	removeExcessIndentation,
} from '../../utils';
import theme from '../../theme';
import { state } from '../state';

// eslint-disable-next-line spellcheck/spell-checker
const classId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

/** A general purpose base element building block */
class DomElem {
	defaultOptions = { tag: 'div', autoRender: true, knownAttributes: new Set(['role', 'for']) };

	/**
	 * Create a DomElem component
	 * @param {Object} options - The options for initializing the component
	 * @param {String} options.tag - The HTML tag
	 * @param {Boolean} options.autoRender - Automatically render the component when constructed
	 * @param {Set} options.knownAttributes - options to send to elem.setAttribute
	 */
	constructor(options = {}) {
		this.options = {
			...this.defaultOptions,
			...options,
		};

		this.classId = Object.freeze(classId());

		this.elem = document.createElement(this.options.tag);
		this.elem._domElem = this;

		this.addClass(this.classId);

		if (this.options.autoRender !== false) this.addAnimation(() => this.render(options));
	}

	render(options = this.options) {
		if (options) this.setOptions(options);

		if (this.options.onRender) this.options.onRender(options);
	}

	get elemIndex() {
		return getElemIndex(this.elem);
	}

	setOption(name, value) {
		this.options[name] = value;

		if (name === 'className' && Array.isArray(value)) value = buildClassName(value);

		if (value instanceof DomElem || DomElem.isPrototypeOf(value)) value = value.elem;

		// TODO: Remove this with the new layered setOption approach?
		if (name === 'options') return;

		if (name === 'style') {
			Object.keys(value).forEach(key => (this.elem.style[key] = value[key]));
		} else if (typeof this[name] === 'function') this[name].call(this, value);
		else if (typeof this.elem[name] === 'function') this.elem[name].call(this.elem, value);
		// TODO: Move this to the target component with the new layered setOption approach?
		else if (name === 'checked') this.elem.checked = value;
		else if (this.hasOwnProperty(name)) this[name] = value;
		else if (this.options.knownAttributes.has(name) || name.startsWith('aria-')) {
			this.elem.setAttribute(name, value);
		} else this.elem[name] = value;
	}

	setOptions(options) {
		Object.entries(options).forEach(([name, value]) => this.setOption(name, value));
	}

	addClass(...classes) {
		this.elem.classList.add(...buildClassList(classes));
	}

	removeClass(...classes) {
		buildClassList(classes).forEach(className => {
			const classRegex = className instanceof RegExp ? className : new RegExp(`\\b${className}\\b/`, 'g');

			if (classRegex.test(this.elem.className)) {
				this.elem.className = this.elem.className.replace(classRegex, '');
			}
		});
	}

	toString() {
		return '[object DomElem]';
	}

	isDescendantOf(parent) {
		return isDescendantOf(this.elem, parent);
	}

	remove() {
		remove(this.elem);
	}

	empty() {
		empty(this.elem);
	}

	content(content) {
		if (typeof content === 'string') this.elem.textContent = content;
		else this.appendChildren(content);
	}

	ancestry(targetClass = this) {
		if (!targetClass || targetClass?.constructor?.name === 'Object') return [];

		return [targetClass, ...this.ancestry(Object.getPrototypeOf(targetClass))];
	}

	appendChildren(children, ...moreChildren) {
		if (!children) return;

		children = Array.isArray(children) ? children : [children, ...moreChildren];

		children
			.flat(Number.POSITIVE_INFINITY)
			.filter(child => !!child)
			.forEach(child => {
				if (child instanceof DomElem || DomElem.isPrototypeOf(child)) child = child.elem;

				this.elem.append(child);
			});
	}

	append(...children) {
		if (!children) return;

		this.appendChildren(children);
	}

	appendTo(parentElem) {
		if (parentElem?.appendChild) parentElem.append(this.elem);
	}

	prependTo(parentElem) {
		if (parentElem.firstChild) parentElem.insertBefore(this.elem, parentElem.firstChild);
		else parentElem.append(this.elem);
	}

	prependChild(child) {
		if (child instanceof DomElem || DomElem.isPrototypeOf(child)) child = child.elem;

		if (this.elem.firstChild) this.elem.insertBefore(child, this.elem.firstChild);
		else this.elem.append(child);
	}

	findAncestor(selector) {
		let elem = this.elem;

		while (
			(elem = elem.parentElement) &&
			(selector[0] === '#' ? '#' + elem.id !== selector : !elem.className.includes(selector))
		);

		return elem;
	}

	setTransform(value) {
		this.elem.style.transform =
			this.elem.style.MozTransform =
			this.elem.style.msTransform =
			this.elem.style.OTransform =
				value;
	}

	addAnimation(callback) {
		const requestAnimation =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (_callback) {
				return setTimeout(_callback, 16);
			};

		requestAnimation(callback);
	}

	attr(attributes) {
		Object.entries(attributes).forEach(([key, value]) => this.elem.setAttribute(key, value));
	}

	styles(styles) {
		postcss([plugin_nested, plugin_autoprefixer])
			.process(
				removeExcessIndentation(`
					.${this.classId} {
						${styles(theme)}
					}
				`),
				{ from: undefined },
			)
			.then(({ css }) => {
				appendStyles(css);
			});
	}

	globalStyles(styles) {
		postcss([plugin_nested, plugin_autoprefixer])
			.process(removeExcessIndentation(styles(theme)), { from: undefined })
			.then(({ css }) => appendStyles(css));
	}

	pointerEventPolyfill(event) {
		event.stop = () => {
			if (event.cancelable) event.preventDefault();

			if (event.stopPropagation) event.stopPropagation();
		};

		if (!event.pointerType) {
			if (event.type.startsWith('touch')) event.pointerType = 'touch';
			else if (event.type.startsWith('mouse')) event.pointerType = 'mouse';
			else event.pointerType = state.isTouchDevice ? 'touch' : 'mouse';
		}

		return event;
	}

	wrapPointerCallback(callback = () => {}) {
		return event => {
			event = this.pointerEventPolyfill(event);

			if (state.isTouchDevice && event.pointerType !== 'touch') return;

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

			if (event.target !== this.elem || (state.isTouchDevice && event.pointerType !== 'touch')) return;

			callback.call(this, event);
		};

		const pointerDown = event => {
			event = this.pointerEventPolyfill(event);

			if (event.target !== this.elem || (state.isTouchDevice && event.pointerType !== 'touch')) return;

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

			if (event.target !== this.elem || (state.isTouchDevice && event.pointerType !== 'touch')) return;

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
