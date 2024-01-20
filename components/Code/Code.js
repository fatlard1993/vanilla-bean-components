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

	setOption(key, value) {
		if (key === 'language') {
			if (this.options.multiline) {
				this._code.removeClass(/\blanguage-\S+\b/g);
				this._code.addClass(`language-${value}`);
			}

			this.removeClass(/\blanguage-\S+\b/g);
			this.addClass(`language-${value}`);
		} else if (key === 'code') {
			(this.options.multiline ? this._code : this).options.innerHTML = codeToHTML(value, this.options.language);
		} else super.setOption(key, value);
	}
}

export default Code;
