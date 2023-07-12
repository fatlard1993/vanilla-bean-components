import { DomElem } from '../DomElem';

class View extends DomElem {
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
				height: 100%;
				display: flex;
				flex-direction: column;

				${options.styles ? options.styles(theme) : ''}
			`,
		});
	}
}

export default View;
