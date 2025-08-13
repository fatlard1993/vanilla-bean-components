import { buildClassList } from '../utils';

/** Elem - A bare-bones general purpose element building block */
class Elem extends EventTarget {
	/**
	 * Create an Element wrapper with enhanced DOM manipulation
	 * @param {object} [options] - Element configuration
	 * @param {string} [options.tag] - HTML tag name
	 * @param {object} [options.style] - CSS properties as key-value pairs
	 * @param {object} [options.attributes] - HTML attributes as key-value pairs
	 * @param {string} [options.className] - CSS class names
	 * @param {string} [options.id] - Element ID
	 * @param {string} [options.textContent] - Element text content
	 * @param {string} [options.innerText] - Element visible text content
	 * @param {string} [options.innerHTML] - Element HTML content
	 * @param {string|Elem|HTMLElement} [options.content] - Element content (text or elements)
	 * @param {Elem|HTMLElement} [options.appendTo] - Parent element to append to
	 * @param {Elem|HTMLElement} [options.prependTo] - Parent element to prepend to
	 * @param {Array<Elem|HTMLElement>} [options.append] - Child elements to append
	 * @param {Array<Elem|HTMLElement>} [options.prepend] - Child elements to prepend
	 * @param {HTMLElement} [options.before] - Insert before this element
	 * @param {boolean} [options.disabled] - Disable form element
	 * @param {Function} [options.onclick] - Click event handler
	 * @param {...(Elem|HTMLElement|string)} children - Elements to append
	 * @example
	 * new Elem({ tag: 'button', textContent: 'Click me', onclick: () => alert('clicked') })
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

		Object.entries(this.options).forEach(([key, value]) => this._setOption(key, value));
	}

	/**
	 * String representation of Elem instance
	 * @returns {string} '[object Elem]'
	 */
	toString() {
		return '[object Elem]';
	}

	/**
	 * Handles option assignment by routing to appropriate method or property
	 * @param {string} key - Option property name
	 * @param {any} value - Option value to assign
	 * @private
	 */
	_setOption(key, value) {
		if (key === 'style') this.setStyle(value);
		else if (key === 'attributes') this.setAttributes(value);
		else if (typeof this[key] === 'function') this[key].call(this, value);
		else if (typeof this.elem[key] === 'function') {
			if (value?.elem) value = value.elem;

			this.elem[key].call(this.elem, value);
		} else this.elem[key] = value;
	}

	/**
	 * Get parent HTMLElement
	 * @returns {HTMLElement|null} Parent element
	 */
	get parentElem() {
		return this.elem?.parentElement;
	}

	/**
	 * Get parent Elem instance
	 * @returns {Elem|undefined} Parent Elem instance if exists
	 */
	get parent() {
		return this.parentElem?._elem;
	}

	/**
	 * Get child Elem instances
	 * @returns {Array<Elem>} Array of child Elem instances
	 */
	get children() {
		return Array.from(this.elem.children).flatMap(({ _elem }) => [_elem]);
	}

	/**
	 * Batch update options
	 * @param {object} options - Options to set
	 * @returns {Elem} This instance for chaining
	 */
	setOptions(options) {
		Object.entries(options).forEach(([name, value]) => (this.options[name] = value));

		return this;
	}

	/**
	 * Check if element has specified classes (supports regex patterns)
	 * @param {...(string|RegExp)} classes - Class names or regex patterns to check
	 * @returns {boolean} True if all classes are present
	 * @example
	 * elem.hasClass('active', 'visible')
	 * elem.hasClass(/^btn-/, 'active')
	 */
	hasClass(...classes) {
		return classes.flat(Number.POSITIVE_INFINITY).every(className => {
			const classRegex = className instanceof RegExp ? className : new RegExp(`\\b${className}\\b`, 'g');

			return classRegex.test(this.elem.className);
		});
	}

	/**
	 * Add CSS classes to element
	 * @param {...(string|Array<string>)} classes - Class names to add
	 * @returns {Elem} This instance for chaining
	 * @example
	 * elem.addClass('active', 'visible')
	 * elem.addClass(['btn', 'btn-primary'])
	 */
	addClass(...classes) {
		this.elem.classList.add(...buildClassList(classes));

		return this;
	}

	/**
	 * Remove CSS classes from element (supports regex patterns)
	 * @param {...(string|RegExp)} classes - Class names or regex patterns to remove
	 * @returns {Elem} This instance for chaining
	 * @example
	 * elem.removeClass('active', 'hidden')
	 * elem.removeClass(/^temp-/)
	 */
	removeClass(...classes) {
		classes.flat(Number.POSITIVE_INFINITY).forEach(className => {
			let classRegex;
			if (className instanceof RegExp) {
				classRegex = new RegExp(
					className.source,
					className.flags.includes('g') ? className.flags : className.flags + 'g',
				);
			} else {
				classRegex = new RegExp(`\\b${className}\\b`, 'g');
			}

			if (classRegex.test(this.elem.className)) {
				this.elem.className = this.elem.className.replaceAll(classRegex, '');
			}
		});

		return this;
	}

	/**
	 * Remove all child elements
	 * @returns {void}
	 */
	empty() {
		this.elem.replaceChildren();
	}

	/**
	 * Apply CSS styles to element
	 * @param {object} style - CSS properties as key-value pairs
	 * @returns {Elem} This instance for chaining
	 * @example
	 * elem.setStyle({ color: 'red', fontSize: '16px' })
	 */
	setStyle(style) {
		if (!style || typeof style !== 'object' || Array.isArray(style)) return this;

		Object.entries(style).forEach(([key, value]) => {
			if (!key || /\d/.test(key)) return;

			this.elem.style[key] = value;
		});

		return this;
	}

	/**
	 * Set HTML attributes on element
	 * @param {object} attributes - Attributes as key-value pairs
	 * @returns {Elem} This instance for chaining
	 * @example
	 * elem.setAttributes({ 'data-id': '123', role: 'button' })
	 */
	setAttributes(attributes) {
		Object.entries(attributes).forEach(([key, value]) => this.elem.setAttribute(key, value));

		return this;
	}

	/**
	 * Set element content (text or elements)
	 * @param {string|Elem|HTMLElement} content - Content to set
	 * @returns {Elem} This instance for chaining
	 * @example
	 * elem.content('Hello world')
	 * elem.content(new Elem({ tag: 'span', textContent: 'Child' }))
	 */
	content(content) {
		if (typeof content === 'string') this.elem.textContent = content;
		else {
			this.empty();
			this.append(content);
		}

		return this;
	}

	/**
	 * Append this element to a parent
	 * @param {Elem|HTMLElement} parentElem - Parent element to append to
	 * @returns {void}
	 */
	appendTo(parentElem) {
		if (parentElem?.append) parentElem.append(this.elem);
	}

	/**
	 * Prepend this element to a parent
	 * @param {Elem|HTMLElement} parentElem - Parent element to prepend to
	 * @returns {void}
	 */
	prependTo(parentElem) {
		if (parentElem.firstChild) parentElem.insertBefore(this.elem, parentElem.firstChild);
		else parentElem.append(this.elem);
	}

	/**
	 * Append child elements to this element
	 * @param {...(Elem|HTMLElement)} children - Elements to append
	 * @returns {Elem} This instance for chaining
	 * @example
	 * elem.append(child1, child2, [child3, child4])
	 */
	append(...children) {
		[children].flat(Number.POSITIVE_INFINITY).forEach(child => {
			if (!child) return;

			if (child?.elem) child = child.elem;

			this.elem.append(child);
		});

		return this;
	}

	/**
	 * Prepend child elements to this element
	 * @param {...(Elem|HTMLElement)} children - Elements to prepend
	 * @returns {Elem} This instance for chaining
	 * @example
	 * elem.prepend(child1, child2, [child3, child4])
	 */
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
