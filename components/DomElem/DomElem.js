import { customAlphabet } from 'nanoid';
import postcss from 'postcss';
import plugin_autoprefixer from 'autoprefixer';
import plugin_nested from 'postcss-nested';

import { remove, empty, appendStyles, buildClassName, getElemIndex, isDescendantOf } from '../../utils';
import theme from '../../theme';
import state from '../state';

const classId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-', 10);

export class DomElem {
	constructor({ tag = 'div', autoRender, knownAttributes = new Set(['role']), ...options } = {}) {
		this.elem = document.createElement(tag);

		this.elem._domElem = this;
		this.knownAttributes = knownAttributes;
		this.options = options || {};

		if (autoRender !== false) this.addAnimation(() => this.render(options));
	}

	render(options = this.options) {
		if (options) {
			Object.keys(options).forEach(name => {
				let value = options[name];
				const valueIsArr = Array.isArray(value);

				if (name === 'className' && valueIsArr) value = buildClassName(value);

				if (value instanceof DomElem || DomElem.isPrototypeOf(value)) value = value.elem;

				const domElemFunction = typeof this[name] === 'function';
				const elemFunction = typeof this.elem[name] === 'function';

				if (name === 'options') return;

				if (name === 'style') {
					Object.keys(value).forEach(key => (this.elem.style[key] = value[key]));
				} else if (domElemFunction) this[name].call(this, value);
				else if (elemFunction) this.elem[name].call(this.elem, value);
				else if (this.hasOwnProperty(name)) this[name] = value;
				else if (this.knownAttributes.has(name) || name.startsWith('aria-')) this.elem.setAttribute(name, value);
				else this.elem[name] = value;
			});
		}

		this.elem.className = `${this.elem.className ? `${this.elem.className} ` : ''}${[
			...new Set(this.ancestry().map(({ constructor: { name } }) => name)),
		].join(' ')}`;

		if (this.options.onRender) this.options.onRender(options);
	}

	get elemIndex() {
		return getElemIndex(this.elem);
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

	ancestry(targetClass = this) {
		if (!targetClass || targetClass?.constructor?.name === 'Object') return [];

		return [targetClass, ...this.ancestry(Object.getPrototypeOf(targetClass))];
	}

	appendChildren(children, ...moreChildren) {
		if (!children) return;

		children = Array.isArray(children) ? children : [children, ...moreChildren];

		children.forEach(child => {
			if (child instanceof DomElem || DomElem.isPrototypeOf(child)) child = child.elem;

			this.elem.appendChild(child);
		});
	}

	appendTo(parentElem) {
		if (parentElem?.appendChild) parentElem.appendChild(this.elem);
	}

	prependTo(parentElem) {
		if (parentElem.firstChild) parentElem.insertBefore(this.elem, parentElem.firstChild);
		else parentElem.appendChild(this.elem);
	}

	prependChild(child) {
		if (child instanceof DomElem || DomElem.isPrototypeOf(child)) child = child.elem;

		if (this.elem.firstChild) this.elem.insertBefore(child, this.elem.firstChild);
		else this.elem.appendChild(child);
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

	addAnimation(cb) {
		const raf =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (_cb) {
				return setTimeout(_cb, 16);
			};

		raf(cb);
	}

	attr(attrObj) {
		Object.keys(attrObj).forEach(attr => this.elem.setAttribute(attr, attrObj[attr]));
	}

	styles(styles) {
		const className = classId();

		postcss([plugin_nested, plugin_autoprefixer])
			.process(
				`
				.${className} {
					${styles(theme)}
				}
			`,
				{ from: undefined },
				// debug "clean output"
				// .replace(/\t*/g, '')
				// .replace(/(^(\r\n|\n|\r)$)|^\s*$/gm, ''),
			)
			.then(({ css }) => {
				appendStyles(css);

				this.elem.classList.add(className);
			});
	}

	globalStyles(styles) {
		postcss([plugin_nested, plugin_autoprefixer])
			.process(
				styles(theme)
					.replace(/\t*/g, '')
					.replace(/(^(\r\n|\n|\r)$)|^\s*$/gm, ''),
				{ from: undefined },
			)
			.then(({ css }) => appendStyles(css));
	}

	pointerEventPolyfill(evt = window.event) {
		evt.stop = () => {
			if (evt.cancelable) evt.preventDefault();

			evt.cancelBubble = true;

			if (evt.stopPropagation) evt.stopPropagation();
		};

		if (!evt.pointerType) {
			if (evt.type.startsWith('touch')) evt.pointerType = 'touch';
			else if (evt.type.startsWith('mouse')) evt.pointerType = 'mouse';
			else evt.pointerType = state.isTouchDevice ? 'touch' : 'mouse';
		}

		return evt;
	}

	wrapPointerCallback(cb = () => {}) {
		return evt => {
			evt = this.pointerEventPolyfill(evt);

			if (state.isTouchDevice && evt.pointerType !== 'touch') return;

			cb.call(this, evt);
		};
	}

	onContextMenu(cb) {
		cb = this.wrapPointerCallback(cb);

		this.elem.addEventListener('contextmenu', cb);

		return () => this.elem.removeEventListener('contextmenu');
	}

	onHover(cb) {
		cb = this.wrapPointerCallback(cb);

		const mouseEnter = evt => {
			cb(evt);

			this.elem.addEventListener('mousemove', cb, true);
		};

		const mouseLeave = () => {
			this.elem.removeEventListener('mousemove', cb, true);
		};

		this.elem.addEventListener('mouseenter', mouseEnter);
		this.elem.addEventListener('mouseleave', mouseLeave);

		return () => {
			this.elem.removeEventListener('mouseenter', mouseEnter);
			this.elem.removeEventListener('mouseleave', mouseLeave);
			this.elem.removeEventListener('mousemove', cb, true);
		};
	}

	onMouseLeave(cb) {
		cb = this.wrapPointerCallback(cb);

		this.elem.addEventListener('mouseleave', cb);

		return () => this.elem.removeEventListener('mouseleave', cb);
	}

	onPointerDown(cb) {
		cb = this.wrapPointerCallback(cb);

		this.elem.addEventListener('touchstart', cb);
		this.elem.addEventListener('mousedown', cb);

		return () => {
			this.elem.removeEventListener('touchstart', cb);
			this.elem.removeEventListener('mousedown', cb);
		};
	}

	onPointerUp(cb) {
		cb = this.wrapPointerCallback(cb);

		this.elem.addEventListener('touchend', cb);
		this.elem.addEventListener('touchcancel', cb);
		this.elem.addEventListener('mouseup', cb);

		return () => {
			this.elem.removeEventListener('touchend', cb);
			this.elem.removeEventListener('touchcancel', cb);
			this.elem.removeEventListener('mouseup', cb);
		};
	}

	onPointerPress(cb) {
		const wrappedCb = evt => {
			evt = this.pointerEventPolyfill(evt);

			if (this.pointerUpOff) this.pointerUpOff();

			if (evt.target !== this.elem || (state.isTouchDevice && evt.pointerType !== 'touch')) return;

			cb.call(this, evt);
		};

		const pointerDown = evt => {
			evt = this.pointerEventPolyfill(evt);

			if (evt.target !== this.elem || (state.isTouchDevice && evt.pointerType !== 'touch')) return;

			document.addEventListener('touchend', wrappedCb, true);
			document.addEventListener('touchcancel', wrappedCb, true);
			document.addEventListener('mouseup', wrappedCb, true);

			this.pointerUpOff = () => {
				document.removeEventListener('touchend', wrappedCb, true);
				document.removeEventListener('touchcancel', wrappedCb, true);
				document.removeEventListener('mouseup', wrappedCb, true);

				this.pointerUpOff = undefined;
			};
		};

		this.elem.addEventListener('touchstart', pointerDown);
		this.elem.addEventListener('mousedown', pointerDown);

		return () => {
			this.elem.removeEventListener('touchstart', pointerDown);
			this.elem.removeEventListener('mousedown', pointerDown);

			document.removeEventListener('touchend', wrappedCb);
			document.removeEventListener('touchcancel', wrappedCb);
			document.removeEventListener('mouseup', wrappedCb);
		};
	}

	onPointerPressAndHold(cb) {
		this.elem.dataset.pressAndHoldTime = this.elem.dataset.pressAndHoldTime || 900;

		const pointerUp = () => {
			this.pointerUpOff();
		};

		const pointerDown = evt => {
			evt = this.pointerEventPolyfill(evt);

			if (evt.target !== this.elem || (state.isTouchDevice && evt.pointerType !== 'touch')) return;

			this.elem.classList.add('pointerHold');

			this.holdTimeout = setTimeout(() => {
				cb.call(this, evt);
			}, parseInt(this.elem.dataset.pressAndHoldTime));

			document.addEventListener('touchend', pointerUp, true);
			document.addEventListener('touchcancel', pointerUp, true);
			document.addEventListener('mouseup', pointerUp, true);
			this.elem.addEventListener('mouseleave', pointerUp, true);

			this.pointerUpOff = () => {
				clearTimeout(this.holdTimeout);

				this.elem.classList.remove('pointerHold');

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

	onKeyDown(cb) {
		this.elem.addEventListener('keydown', cb);

		return () => this.elem.removeEventListener('keydown', cb);
	}

	onKeyUp(cb) {
		this.elem.addEventListener('keyup', cb);

		return () => this.elem.removeEventListener('keyup', cb);
	}

	onChange(cb) {
		const wrappedCb = evt => {
			evt.value = evt.target.value || this.elem.value || this.value;

			cb(evt);
		};

		this.elem.addEventListener('change', wrappedCb);

		return () => this.elem.removeEventListener('change', wrappedCb);
	}
}

export default DomElem;
