import { copyToClipboard } from '../../utils';
import { Elem } from '../Elem';
import { Component } from '../Component';
import { Button } from '../Button';
import { Notify } from '../Notify';

const defaultOptions = { tag: 'code', language: 'javascript', multiline: 'auto' };

class Code extends Component {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		if ((options.multiline || defaultOptions.multiline) === 'auto') {
			options.multiline = (options.code || '').includes('\n');
		}

		super(
			{
				...defaultOptions,
				...options,
				...(options.multiline ? { tag: 'pre' } : { tag: 'code' }),
			},
			...children,
		);
	}

	render() {
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

		super.render();
	}

	setOption(key, value) {
		if (key === 'language') {
			if (this.options.multiline) {
				this._code.removeClass(/\blanguage-\S+\b/g);
				this._code.addClass(`language-${value}`);
			}

			this.removeClass(/\blanguage-\S+\b/g);
			this.addClass(`language-${value}`);
		} else if (key === 'code') {
			(this.options.multiline ? this._code : this).elem.textContent = value;
		} else super.setOption(key, value);
	}
}

export default Code;
