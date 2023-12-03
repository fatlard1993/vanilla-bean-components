import { DomElem } from '../DomElem';

class Icon extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, domElem) => `
					&.fa-support:before {
						${theme.fonts.fontAwesomeSolid}
					}

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
	}

	setOption(name, value) {
		if (name === 'icon') {
			this.removeClass(/\bfa-\S+?\b/g);

			if (value) this.addClass('fa-support', `fa-${value}`);
		} else super.setOption(name, value);
	}
}

export default Icon;
