import { Elem } from '../../Elem';
import { Input } from '../Input';

const defaultOptions = {
	tag: 'select',
	priorityOptions: new Set(['textContent', 'content', 'appendTo', 'prependTo', 'options']),
};

/**
 * Select dropdown component extending Input with dynamic option management.
 *
 * Provides enhanced HTML select functionality with dynamic option rendering
 * and improved value handling for both string and object-based options.
 * @param {object} [options={}] - Select configuration options
 * @param {string} [options.tag='select'] - HTML tag, uses select element
 * @param {Array<string|object>} [options.options] - Array of select options
 * @param {*} [options.value] - Currently selected value
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Select} Select component instance
 */
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

	/**
	 * Gets the currently selected value with enhanced option handling.
	 * @returns {*} Selected option value, label, or text content
	 */
	get value() {
		const selected = Array.from(this.elem.children).find(({ selected }) => selected);

		return selected?.value || selected?.label || selected?.textContent || this.elem.value;
	}

	/**
	 * Sets the selected value.
	 * @param {*} newValue - Value to select
	 */
	set value(newValue) {
		this.elem.value = newValue;
	}
}

export default Select;
