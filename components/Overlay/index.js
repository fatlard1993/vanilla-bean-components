import DomElem from '../DomElem';

export class Overlay extends DomElem {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: ({ colors, ...theme }) => `
				position: absolute;
				background-color: ${colors.darkest(colors.grey)};
				padding: 6px 12px;
				border-radius: 3px;
				border: 1px solid ${colors.lightest(colors.grey)};

				${styles({ colors, ...theme })}
			`,
			...options,
		});
	}
}

export default Overlay;
