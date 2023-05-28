import DomElem from '../DomElem/DomElem';
import Input from '../Input/Input';

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
			this.appendChildren(
				options.options.map(
					option =>
						new DomElem({
							tag: 'option',
							selected: options.value === (typeof option === 'object' ? option.value : option),
							...(typeof option === 'object' ? option : { label: option }),
						}),
				),
			);
		}
	}

	get value() {
		const selected = Array.from(this.elem.children).find(({ selected }) => selected);

		return selected?.value || selected?.label || selected?.textContent;
	}

	set value(newValue) {
		const selected = Array.from(this.elem.children).find(({ selected }) => selected);
		const toSelect = Array.from(this.elem.children).find(
			({ value, label, textContent }) => value === newValue || label === newValue || textContent === newValue,
		);

		selected.selected = false;
		toSelect.selected = true;
	}
}

export default Select;
