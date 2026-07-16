import { copyToClipboard } from '../../utils';
import { Elem } from '../../Elem';
import { Component } from '../../Component';
import { Button } from '../Button';
import { Notify } from '../Notify';

/**
 * Code display component with syntax highlighting and optional copy functionality.
 *
 * Renders code blocks with language-specific styling and automatic multiline detection.
 * Supports inline code spans and multiline code blocks with optional copy-to-clipboard button.
 * @param {object} [options={}] - Code component configuration options
 * @param {string} [options.tag='code'] - HTML tag, automatically set to 'pre' for multiline code
 * @param {string} [options.language='javascript'] - Programming language for syntax highlighting class
 * @param {string|boolean} [options.multiline='auto'] - Whether to render as multiline block ('auto' detects newlines)
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
				if (this.options.multiline && this._code) {
					this._code.removeClass(/\blanguage-\S+\b/g);
					this._code.addClass(`language-${value}`);
				}

				this.removeClass(/\blanguage-\S+\b/g);
				this.addClass(`language-${value}`);
			},
		},
		code: {
			set(value) {
				(this.options.multiline && this._code ? this._code : this).elem.textContent = value;
			},
		},
		// Resolved in prepareOptions (decides the tag); read from this.options in build()
		multiline: { default: 'auto' },
		copyButton: { default: false },
	};

	static prepareOptions(options) {
		const multiline =
			(options.multiline ?? 'auto') === 'auto' ? (options.code || '').includes('\n') : options.multiline;

		return { ...options, multiline, tag: multiline ? 'pre' : 'code' };
	}

	build() {
		if (this.options.multiline) {
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
					onPointerPress: () => {
						const clipboardWriteSuccess = copyToClipboard(this.options.code);

						if (clipboardWriteSuccess) {
							const { right: x, top: y } = this.elem.getBoundingClientRect();

							new Notify({ content: 'Copied text to clipboard!', timeout: 1000, x, y });
						}
					},
				}),
			);
	}
}

export default Code;
