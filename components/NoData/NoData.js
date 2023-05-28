import DomElem from '../DomElem';

export class NoData extends DomElem {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: ({ colors, ...theme }) => `
				margin: 6px auto;
				padding: 6px 12px;
				text-align: center;

				${styles({ colors, ...theme })}
			`,
			...options,
		});
	}
}

export default NoData;
