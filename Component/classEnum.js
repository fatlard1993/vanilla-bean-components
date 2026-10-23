/**
 * A schema descriptor for an option drawn as one class from a set: `variant: 'flat'` on an element marked
 * `variant-flat`. Setting it takes away the class of the value before and validates the new one against the set;
 * null or undefined leaves no class.
 * @param {string} prefix - The class prefix, and usually the option's name: 'variant', 'intent', 'size'
 * @param {Array<string>} values - The values the option takes
 * @param {object} [config] - Further shape for the descriptor
 * @param {string} [config.default] - The value the option starts at
 * @param {Function} [config.classes] - The classes a value adds, when it is more than `prefix-value`
 * @param {Function} [config.set] - Runs after the class is placed, as the component, with (value, next)
 * @returns {object} A static schema descriptor: enum, default and set
 * @example
 * static schema = {
 *   variant: classEnum('variant', ['flat', 'chip', 'raised']),
 *   size: classEnum('size', ['small', 'large'], { default: 'small' }),
 * };
 */
export const classEnum = (
	prefix,
	values,
	{ default: initial, classes = value => [`${prefix}-${value}`], set } = {},
) => ({
	enum: values,
	...(initial !== undefined && { default: initial }),
	set(value, next) {
		this.removeClass(new RegExp(`\\b${prefix}-\\S+\\b`, 'g'));

		if (value !== undefined && value !== null) this.addClass(...classes(value));

		set?.call(this, value, next);
	},
});

export default classEnum;
