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
		if (name === 'icon' || name === 'animation') {
			this.removeClass(/\bfa-\S+?\b/g);

			if (value) {
				this.addClass(
					...['support', this.options[name === 'icon' ? 'animation' : 'icon'], value]
						.filter(_ => !!_)
						.map(_ => `fa-${_}`),
				);
			}
		} else super.setOption(name, value);
	}
}

export default Icon;
