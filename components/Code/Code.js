import Prism from 'prismjs';

import { removeExcessIndentation } from '../../utils';
import { DomElem } from '../DomElem';

const defaultOptions = { tag: 'code', language: 'javascript', multiline: 'auto' };

const codeToHTML = (code, language) =>
	Prism.highlight(removeExcessIndentation(code), Prism.languages[language], language);

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

					&[class*="language-"] {
						margin: 0;
					}

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
	}

	render() {
		if (this.options.multiline) {
			this._code = new DomElem({
				tag: 'code',
				innerHTML: codeToHTML(this.options.code, this.options.language),
				appendTo: this.elem,
			});
		}

		super.render();
	}

	setOption(name, value) {
		if (name === 'language') {
			if (this.options.multiline) {
				this._code.removeClass(/\blanguage-\S+\b/g);
				this._code.addClass(`language-${value}`);
			}

			this.removeClass(/\blanguage-\S+\b/g);
			this.addClass(`language-${value}`);
		} else if (name === 'code') {
			this[this.options.multiline ? '_code' : 'elem'].innerHTML = codeToHTML(this.options.code, this.options.language);
		} else super.setOption(name, value);
	}
}

export default Code;
