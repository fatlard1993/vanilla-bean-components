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
			},
			...children,
		);
	}

	render() {
		if (this.options.multiline) {
			this._code = new DomElem({
				tag: 'code',
				textContent: removeExcessIndentation(this.options.code),
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
			(this.options.multiline ? this._code : this).options.textContent = removeExcessIndentation(value);
		} else super.setOption(key, value);
	}
}

export default Code;
