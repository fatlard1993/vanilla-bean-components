import { DomElem } from '../../DomElem';

class VanillaBeanDomElem extends DomElem {
	constructor(options = {}, ...children) {
		super(options, ...children);

		if (process.env.NODE_ENV === 'development') {
			this.addClass(...this.ancestry().map(({ constructor }) => constructor.name));
		}
	}

	ancestry(targetClass = this) {
		if (!targetClass || targetClass?.constructor?.name === 'Object') return [];

		return [targetClass, ...this.ancestry(Object.getPrototypeOf(targetClass))];
	}
}

export default VanillaBeanDomElem;
