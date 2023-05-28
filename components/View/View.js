import DomElem from '../DomElem/DomElem';

export class View extends DomElem {
	constructor({ styles = () => '', ...options }) {
		super({
			styles: theme => `
				height: 100%;
				display: flex;
				flex-direction: column;

				${styles(theme)}
			`,
			...options,
		});
	}
}

export default View;
