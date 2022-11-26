import DomElem from '../DomElem';
import Input from '../Input';

export class Select extends Input {
	constructor({ options = [], ...rest }) {
		super({
			tag: 'select',
			appendChildren: options.map(textContent => new DomElem({ tag: 'option', textContent })),
			...rest,
		});
	}
}

export default Select;
