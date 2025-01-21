import { buildClassList } from '../utils';

/** Elem - A bare-bones general purpose element building block */
class Elem extends EventTarget {
	/**
	 * Create an Element
	 * @param {object} options - The options for initializing the component
	 * @param {string} options.tag - The HTML tag
	 * @param {object} options.style - Style properties to set in the HTMLElement
	 * @param {object} options.attributes - HTML attributes to set in the HTMLElement
	 * @param {...children} children - Child elements to add to append option
	 */
	constructor({ tag = 'div', ...optionsWithoutConfig } = {}, ...children) {
		super();

		this.tag = tag;
		this.elem = document.createElement(tag);
		this.options = {
			...optionsWithoutConfig,
			...(children.length > 0 ? { append: [optionsWithoutConfig.append, ...children] } : {}),
		};

		this.elem._elem = this;

		Object.entries(this.options).forEach(([key, value]) => this.setOption(key, value));
	}

	toString() {
		return '[object Elem]';
	}

	setOption(key, value) {
		if (key === 'style') this.setStyle(value);
		else if (key === 'attributes') this.setAttributes(value);
		else if (typeof this[key] === 'function') this[key].call(this, value);
		else if (typeof this.elem[key] === 'function') {
			if (value?.elem) value = value.elem;

			this.elem[key].call(this.elem, value);
		} else this.elem[key] = value;
	}

	get parentElem() {
		return this.elem?.parentElement;
	}

	get parent() {
		return this.parentElem?._elem;
	}

	get children() {
		return Array.from(this.elem.children).flatMap(({ _elem }) => [_elem]);
	}

	setOptions(options) {
		Object.entries(options).forEach(([name, value]) => (this.options[name] = value));

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

	empty() {
		this.elem.replaceChildren();
	}

	setStyle(style) {
		if (typeof style === 'string') return this.styles(() => style);
		if (typeof style === 'function') return this.styles(style);

		Object.entries(style).forEach(([key, value]) => {
			if (!key || /\d/.test(key)) return;

			this.elem.style[key] = value;
		});

		return this;
	}

	setAttributes(attributes) {
		Object.entries(attributes).forEach(([key, value]) => this.elem.setAttribute(key, value));

		return this;
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

			if (child?.elem) child = child.elem;

			this.elem.append(child);
		});

		return this;
	}

	prepend(...children) {
		[children].flat(Number.POSITIVE_INFINITY).forEach(child => {
			if (!child) return;

			if (child?.elem) child = child.elem;

			if (this.elem.firstChild) this.elem.insertBefore(child, this.elem.firstChild);
			else this.elem.append(child);
		});

		return this;
	}
}

export default Elem;
