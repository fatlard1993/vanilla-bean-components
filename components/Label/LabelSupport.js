import DomElem from '../DomElem';
import Label from './Label';

export class LabelSupport extends DomElem {
	constructor({ label, tooltip, appendTo, appendChild, appendChildren, ...options }) {
		const children = [
			...(appendChildren ? (Array.isArray(appendChildren) ? appendChildren : [appendChildren]) : []),
			...(appendChild ? [appendChild] : []),
		];

		super({
			appendTo,
			appendChildren: label ? undefined : children,
			...options,
		});

		this.elem.id = this.classId;

		if (label) {
			this.label = new Label({
				...(typeof label === 'object' ? label : { label }),
				attr: { for: this.elem.id },
				tooltip,
				appendTo,
				appendChildren: [this.elem, ...children],
			});
		}
	}
}

export default LabelSupport;
