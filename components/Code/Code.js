import Prism from 'prismjs';

import { removeExcessIndentation } from '../../utils';
import { DomElem } from '../DomElem';

const defaultOptions = { tag: 'code', language: 'javascript', multiline: 'auto' };

class Code extends DomElem {
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
				styles: (theme, domElem) => `
					display: ${options.multiline ? '' : 'inline-'}block;
					border-radius: 0.2em;

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
	}

	render(options = this.options) {
		if (options.multiline) {
			this._code = new DomElem({ tag: 'code', appendTo: this.elem });
		}

		super.render(options);
	}

	setOption(name, value) {
		if (name === 'language') {
			if (this.options.multiline) {
				this._code.removeClass(/\blanguage-.+\b/g);
				this._code.addClass(`language-${value}`);
			}

			this.removeClass(/\blanguage-.+\b/g);
			this.addClass(`language-${value}`);
		} else if (name === 'code') {
			const codeHTML = Prism.highlight(
				removeExcessIndentation(value),
				Prism.languages[this.options.language],
				this.options.language,
			);

			(this.options.multiline ? this._code : this).innerHTML = codeHTML;
		} else super.setOption(name, value);
	}
}

export default Code;
