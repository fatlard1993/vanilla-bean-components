import { DomElem } from '../DomElem';

class Overlay extends DomElem {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				position: fixed;
				z-index: 1;
				background-color: ${theme.colors.darkest(theme.colors.gray)};
				padding: 6px 12px;
				border-radius: 3px;
				border: 1px solid ${theme.colors.lightest(theme.colors.gray)};

				${options.styles ? options.styles(theme) : ''}
			`,
		});
	}
}

export default Overlay;
