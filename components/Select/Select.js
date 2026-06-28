import { Elem } from '../../Elem';
import { Input } from '../Input';

const defaultOptions = {
	tag: 'select',
	get priorityOptions() {
		return new Set(['textContent', 'content', 'appendTo', 'prependTo', 'options']);
	},
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

	static handlers = {
		options(value) {
			this.empty();

			if (!value) return;

			for (const option of value) {
				// Optgroup: { label: 'Group', options: [...] }
				if (typeof option === 'object' && Array.isArray(option.options)) {
					const group = document.createElement('optgroup');
					if (option.label) group.label = option.label;
					for (const o of option.options) {
						group.append(new Elem({ tag: 'option', ...(typeof o === 'object' ? o : { label: o, value: o }) }).elem);
					}
					this.elem.append(group);
				} else {
					this.append(
						new Elem({ tag: 'option', ...(typeof option === 'object' ? option : { label: option, value: option }) }),
					);
				}
			}
		},
	};

	/**
	 * Gets the currently selected value with enhanced option handling.
	 * @returns {*} Selected option value, label, or text content
	 */
	get value() {
		// Use elem.options (HTMLOptionsCollection) — works across optgroups
		const selected = Array.from(this.elem.options).find(({ selected }) => selected);

		return selected?.value ?? selected?.label ?? selected?.textContent ?? this.elem.value;
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
