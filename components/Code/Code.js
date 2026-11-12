import { copyToClipboard } from '../../utils';
import { Elem } from '../../Elem';
import { Component } from '../../Component';
import { Button } from '../Button';
import { Notify } from '../Notify';

// 'auto' is a block when the code has a newline; true or false says outright
const isBlock = ({ multiline, code }) =>
	(multiline ?? 'auto') === 'auto' ? String(code ?? '').includes('\n') : Boolean(multiline);

/**
 * Code display component with syntax highlighting and optional copy functionality.
 *
 * Renders code blocks with language-specific styling and automatic multiline detection.
 * Supports inline code spans and multiline code blocks with optional copy-to-clipboard button.
 * @param {object} [options={}] - Code component configuration options
 * @param {string} [options.tag='code'] - HTML tag, automatically set to 'pre' for multiline code
 * @param {string} [options.language='javascript'] - Programming language for syntax highlighting class
 * @param {string|boolean} [options.multiline='auto'] - Whether to render as multiline block ('auto' follows the code: a block while it has a newline)
 * @param {string} [options.code] - Code content to display
 * @param {boolean} [options.copyButton] - Whether to show copy-to-clipboard button
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Code} Code component instance
 */
class Code extends Component {
	static schema = {
		language: {
			default: 'javascript',
			set(value) {
				if (this._code) {
					this._code.removeClass(/\blanguage-\S+\b/g);
					this._code.addClass(`language-${value}`);
				}

				this.removeClass(/\blanguage-\S+\b/g);
				this.addClass(`language-${value}`);
			},
		},
		code: {
			set(value) {
				// A change of shape builds the element again, code and all
				if (this._reshape()) return;

				(this._code ?? this).elem.textContent = value;
			},
		},
		// Decides the tag: 'auto' follows the code as it changes, true or false holds
		multiline: {
			default: 'auto',
			set() {
				this._reshape();
			},
		},
		copyButton: { default: false },
	};

	static prepareOptions(options) {
		return { ...options, tag: isBlock(options) ? 'pre' : 'code' };
	}

	/**
	 * Swaps the element for the other kind when the code calls for it: a `pre` holding a `code` for a block, a bare
	 * `code` inline. The new element takes the old one's place and attributes, and is built again from the options.
	 * @returns {boolean} Whether the element was swapped
	 * @private
	 */
	_reshape() {
		const tag = isBlock(this.options) ? 'pre' : 'code';

		if (!this.rendered || this.elem.tagName.toLowerCase() === tag) return false;

		const old = this.elem;
		const elem = document.createElement(tag);

		for (const { name, value } of old.attributes) elem.setAttribute(name, value);

		// Its children are let go as a re-render lets them go: discarded unless put back
		this.empty();
		old.replaceWith(elem);
		delete old._component;

		this.elem = elem;
		this.tag = tag;
		elem._component = this;
		this._code = undefined;

		// The connection observer watched the old element; one is made again for the new when the options ask
		this.elemObserver?.disconnect();
		this.elemObserver = undefined;

		// Built again in place: re-rendering appends to appendTo again, which would move it to the end
		const { parentNode, nextSibling } = elem;

		this.render();

		if (parentNode && (elem.parentNode !== parentNode || elem.nextSibling !== nextSibling)) {
			parentNode.insertBefore(elem, nextSibling);
		}

		return true;
	}

	build() {
		if (isBlock(this.options)) {
			this._code = new Elem({
				tag: 'code',
				textContent: this.options.code,
				appendTo: this.elem,
			});
		}

		if (this.options.copyButton)
			this.append(
				new Button({
					icon: 'copy',
					tooltip: 'Copy to clipboard',
					onPointerPress: async () => {
						const { right: x, top: y } = this.elem.getBoundingClientRect();

						if (await copyToClipboard(this.options.code)) {
							new Notify({ content: 'Copied text to clipboard!', timeout: 1000, x, y });
						} else {
							new Notify({
								intent: 'warning',
								content: 'The clipboard is out of reach here; select the text and copy it',
								x,
								y,
							});
						}
					},
				}),
			);
	}
}

export default Code;
