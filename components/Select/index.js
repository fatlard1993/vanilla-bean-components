import DomElem from '../DomElem';
import Input from '../Input';

export class Select extends Input {
	constructor(options) {
		super({
			tag: 'select',
			...options,
		});
	}

	render(options = this.options) {
		super.render(options);

		if (options.options) {
			this.appendChildren(options.options.map(textContent => new DomElem({ tag: 'option', textContent })));
		}
	}
}

export default Select;
