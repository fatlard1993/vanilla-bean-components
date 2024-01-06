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

	setOption(key, value) {
		if (key === 'icon' || key === 'animation') {
			this.removeClass(/\bfa-\S+?\b/g);

			if (value) {
				this.addClass(
					...['support', this.options[key === 'icon' ? 'animation' : 'icon'], value]
						.filter(_ => !!_)
						.map(_ => `fa-${_}`),
				);
			}
		} else super.setOption(key, value);
	}
}

export default Icon;
