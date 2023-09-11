import { DomElem } from '../DomElem';

class Icon extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: theme => `
				&.fa-support:before {
					${theme.fonts.fontAwesomeSolid}
				}

				${options.styles?.(theme) || ''}
			`,
			},
			...children,
		);
	}

	setOption(name, value) {
		if (name === 'icon') {
			this.removeClass(/\bfa-.+?\b/g);

			if (value) this.addClass('fa-support', `fa-${value}`);
		} else super.setOption(name, value);
	}
}

export default Icon;
