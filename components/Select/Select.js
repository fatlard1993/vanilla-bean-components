import { Elem } from '../../Elem';
import { Input } from '../Input';

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
	static schema = {
		tag: { default: 'select' },
		autocomplete: { default: 'off' },
		options: {
			set(value) {
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

				// Re-apply the current value - option elements may not have existed when value was processed.
				//
				// The empty case is excluded because `value` is inherited from Input with a default of
				// '', so by the time this runs there is no way to tell an unset value from one the
				// caller chose. Assigning '' to a select whose options all carry real values sets
				// selectedIndex to -1: nothing is highlighted, and `select.value` reports '' for a
				// control the user sees as populated. Skipping leaves the platform's own selection --
				// the first option -- which is what the control actually displays.
				//
				// An explicit '' is still honoured when an option carries it, since then it names a real
				// choice rather than "no value at all".
				const selected = this.options.value;
				const emptyIsSelectable = () => Array.from(this.elem.options).some(option => option.value === '');

				if (selected !== undefined && (selected !== '' || emptyIsSelectable())) this.elem.value = selected;
			},
		},
	};

	/**
	 * Gets the currently selected value with enhanced option handling.
	 * @returns {*} Selected option value, label, or text content
	 */
	get value() {
		// Use elem.options (HTMLOptionsCollection) - works across optgroups
		const selected = Array.from(this.elem.options).find(({ selected }) => selected);

		if (!selected) return this.elem.value;

		// option.value is never null/undefined per spec (it's the value attribute, or
		// textContent when absent) - hasAttribute is required to actually reach the label fallback
		if (selected.hasAttribute('value')) return selected.value;

		return selected.label || selected.textContent;
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
