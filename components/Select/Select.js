import { DomElem } from '../DomElem';
import { Input } from '../Input';

const defaultOptions = {
	tag: 'select',
	priorityOptions: new Set(['textContent', 'content', 'appendTo', 'prependTo', 'options']),
};

class Select extends Input {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	setOption(key, value) {
		if (key === 'options') {
			this.empty();

			if (!value) return;

			this.append(
				value.map(
					option =>
						new DomElem({
							tag: 'option',
							...(typeof option === 'object' ? option : { label: option }),
						}),
				),
			);
		} else super.setOption(key, value);
	}

	get value() {
		const selected = Array.from(this.elem.children).find(({ selected }) => selected);

		return selected?.value || selected?.label || selected?.textContent || this.elem.value;
	}

	set value(newValue) {
		this.elem.value = newValue;
	}
}

export default Select;
