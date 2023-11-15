import { DomElem } from '../DomElem';

class NoData extends DomElem {
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, domElem) => `
					margin: 6px auto;
					padding: 6px 12px;
					text-align: center;

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);
	}
}

export default NoData;
