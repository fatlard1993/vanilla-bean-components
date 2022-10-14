import './index.css';

import DomElem from '../DomElem';

export class NoData extends DomElem {
	constructor({ className, ...rest }) {
		super('div', { className: ['noData', className], ...rest });
	}
}

export default NoData;
