import { styled } from '../../utils';
import DomElem from '../DomElem';

const LabelText = styled(
	DomElem,
	theme => `
		margin: 12px 0;
		color: ${theme.white};
	`,
);

export class Label extends DomElem {
	constructor({ label, styles = () => '', appendChild, appendChildren, ...options }) {
		super({
			tag: 'label',
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
				new LabelText({ content: label }),
				...(appendChildren ? (Array.isArray(appendChildren) ? appendChildren : [appendChildren]) : []),
				...(appendChild ? [appendChild] : []),
			],
			...options,
		});
	}
}

export default Label;
