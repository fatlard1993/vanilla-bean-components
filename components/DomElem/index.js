import dom from '../../utils/dom';

// import state from '../state';

import { buildClassName } from '../../utils/class';

export class DomElem {
	constructor({ tag = 'div', autoRender, ...options }) {
		// console.log('new DomElem', this.constructor.name, { tag, autoRender, ...options });

		this.elem = document.createElement(tag);

		this.elem._domElem = this;
		this.options = options || {};

		if (autoRender !== false) this.addAnimation(() => this.render(options));
	}

	render(options = this.options) {
		// console.log('DomElem render', this.constructor.name, options);

		// this.cleanup();

		if (options) {
			Object.keys(options).forEach(name => {
				let value = options[name];
				const valueIsArr = Array.isArray(value);

				if (name === 'className' && valueIsArr) value = buildClassName(value);

				if (value instanceof DomElem || DomElem.isPrototypeOf(value)) value = value.elem;

				const domElemFunction = typeof this[name] === 'function';
				const elemFunction = typeof this.elem[name] === 'function';

				// console.log({ name, value, domElemFunction, elemFunction });

				if (name === 'style') {
					Object.keys(value).forEach(key => (this.elem.style[key] = value[key]));
				} else if (domElemFunction) this[name].call(this, value);
				else if (elemFunction) this.elem[name].call(this.elem, value);
				else this.elem[name] = value;
			});
		}

		this.elem.className = `${this.elem.className ? `${this.elem.className} ` : ''}${[
			...new Set(this.ancestry().map(({ constructor: { name } }) => name)),
		].join(' ')}`;

		if (this.options.onRender) this.options.onRender(options);

		// dom.createElem(tagName, {
		// 	onPointerPress: evt => {
		// 		if (state.disablePointerPress) {
		// 			state.disablePointerPress = false;

		// 			return;
		// 		}

		// 		if (typeof onPointerPress === 'function') onPointerPress(evt);
		// 	},
		// 	...options,
		// });
	}

	remove() {
		dom.remove(this.elem);
	}

	cleanup() {
		this.remove();
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

	pointerEventPolyfill(evt) {
		if (typeof evt === 'undefined') evt = window.event;

		evt.stop = () => {
			if (evt.cancelable) evt.preventDefault();

			evt.cancelBubble = true;

			if (evt.stopPropagation) evt.stopPropagation();
		};

		evt.pointerType = evt.type.startsWith('mouse') ? 'mouse' : 'touch';

		return evt;
	}

	wrapPointerCallback(cb) {
		return evt => {
			evt = this.pointerEventPolyfill(evt);

			if (dom.isMobile && evt.pointerType !== 'touch') return;

			cb.call(this, evt);
		};
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

		this.elem.addEventListener('mouseenter', mouseEnter, true);
		this.elem.addEventListener('mouseleave', mouseLeave, true);
	}

	onMouseLeave(cb) {
		this.elem.addEventListener('mouseleave', cb, true);
	}

	onPointerDown(cb) {
		cb = this.wrapPointerCallback(cb);

		this.elem.addEventListener('touchstart', cb);
		this.elem.addEventListener('mousedown', cb);

		this.pointerDownOff = () => {
			this.elem.removeEventListener('touchstart', cb);
			this.elem.removeEventListener('mousedown', cb);

			this.pointerDownOff = undefined;
		};
	}

	onPointerUp(cb) {
		cb = this.wrapPointerCallback(cb);

		this.elem.addEventListener('touchend', cb);
		this.elem.addEventListener('touchcancel', cb);
		this.elem.addEventListener('mouseup', cb, true);

		this.pointerUpOff = () => {
			this.elem.removeEventListener('touchend', cb);
			this.elem.removeEventListener('touchcancel', cb);
			this.elem.removeEventListener('mouseup', cb, true);

			this.pointerUpOff = undefined;
		};
	}

	onPointerPress(cb) {
		const wrappedCb = evt => {
			evt = this.pointerEventPolyfill(evt);

			if (this.pointerUpOff) this.pointerUpOff();

			if (evt.target !== this.elem || (dom.isMobile && evt.pointerType !== 'touch')) return;

			cb.call(this, evt);
		};

		this.pointerDownOff = () => {
			this.elem.removeEventListener('touchstart', pointerDown);
			this.elem.removeEventListener('mousedown', pointerDown);

			this.pointerDownOff = undefined;
		};

		const pointerDown = evt => {
			evt = this.pointerEventPolyfill(evt);

			if (evt.target !== this.elem || (dom.isMobile && evt.pointerType !== 'touch')) return;

			document.addEventListener('touchend', wrappedCb);
			document.addEventListener('touchcancel', wrappedCb);
			document.addEventListener('mouseup', wrappedCb, true);

			this.pointerUpOff = () => {
				document.removeEventListener('touchend', wrappedCb);
				document.removeEventListener('touchcancel', wrappedCb);
				document.removeEventListener('mouseup', wrappedCb, true);

				this.pointerUpOff = undefined;
			};
		};

		this.elem.addEventListener('touchstart', pointerDown);
		this.elem.addEventListener('mousedown', pointerDown);
	}

	onPointerPressAndHold(cb) {
		this.elem.dataset.pressAndHoldTime = this.elem.dataset.pressAndHoldTime || 900;

		this.pointerDownOff = () => {
			this.elem.removeEventListener('touchstart', pointerDown);
			this.elem.removeEventListener('mousedown', pointerDown);

			this.pointerDownOff = undefined;
		};

		const pointerUp = () => {
			this.pointerUpOff();
		};

		const pointerDown = evt => {
			evt = this.pointerEventPolyfill(evt);

			if (evt.target !== this.elem || (dom.isMobile && evt.pointerType !== 'touch')) return;

			this.elem.classList.add('pointerHold');

			this.holdTimeout = setTimeout(() => {
				cb.call(this, evt);
			}, parseInt(this.elem.dataset.pressAndHoldTime));

			document.addEventListener('touchend', pointerUp);
			document.addEventListener('touchcancel', pointerUp);
			this.elem.addEventListener('mouseleave', pointerUp);
			document.addEventListener('mouseup', pointerUp, true);

			this.pointerUpOff = () => {
				clearTimeout(this.holdTimeout);

				this.elem.classList.remove('pointerHold');

				document.removeEventListener('touchend', pointerUp);
				document.removeEventListener('touchcancel', pointerUp);
				this.elem.removeEventListener('mouseleave', pointerUp);
				document.removeEventListener('mouseup', pointerUp, true);

				this.pointerUpOff = undefined;
			};
		};

		this.elem.addEventListener('touchstart', pointerDown);
		this.elem.addEventListener('mousedown', pointerDown);
	}

	onKeyDown(cb) {
		this.elem.addEventListener('keydown', cb);

		this.keyDownOff = () => {
			this.elem.removeEventListener('keydown', cb);

			this.keyDownOff = undefined;
		};
	}

	onKeyUp(cb) {
		this.elem.addEventListener('keyup', cb);

		this.keyUpOff = () => {
			this.elem.removeEventListener('keyup', cb);

			this.keyUpOff = undefined;
		};
	}

	onChange(cb) {
		this.elem.addEventListener('change', evt => {
			evt.value = evt.target.value || this.elem.value;

			cb(evt);
		});
	}
}

export default DomElem;
