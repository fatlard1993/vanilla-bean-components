import DomElem from '../DomElem';

export class Label extends DomElem {
	constructor({ label, styles = () => '', appendChild, appendChildren, ...options }) {
		super({
			styles: ({ colors, ...theme }) => `
				position: relative;
				display: block;
				font-size: 1em;
				width: 95%;
				margin: 0 auto 12px;
				border-left: 3px solid ${colors.lightest(colors.grey)};
				padding: 3px 12px 12px;
				background-color: ${colors.darkest(colors.grey)};

				${styles({ colors, ...theme })}
			`,
			appendChildren: [
				new DomElem({
					styles: theme => `
						margin: 12px 0;
						color: ${theme.white};
					`,
					textContent: label,
				}),
				...(appendChildren ? (Array.isArray(appendChildren) ? appendChildren : [appendChildren]) : []),
				...(appendChild ? [appendChild] : []),
			],
			...options,
		});
	}
}

export default Label;
