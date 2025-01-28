import { Elem } from '../../Elem';
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

	_setOption(key, value) {
		if (key === 'options') {
			this.empty();

			if (!value) return;

			this.append(
				value.map(
					option =>
						new Elem({
							tag: 'option',
							...(typeof option === 'object' ? option : { label: option, value: option }),
						}),
				),
			);
		} else super._setOption(key, value);
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
