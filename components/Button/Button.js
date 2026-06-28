import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'button' };

/**
 * Interactive button component with keyboard accessibility and tooltip support.
 *
 * Extends TooltipWrapper to provide button-specific behavior including keyboard
 * activation (Space/Enter keys) and proper semantic button element.
 * @param {object} [options={}] - Button configuration options
 * @param {string} [options.tag='button'] - HTML tag name, defaults to button for proper semantics
 * @param {Function} [options.onPointerPress] - Handler called when button is activated via click, touch, or keyboard
 * @param {string} [options.textContent] - Button label text
 * @param {string} [options.icon] - FontAwesome icon name (without 'fa-' prefix)
 * @param {string} [options.tooltip] - Tooltip text shown on hover
 * @param {boolean} [options.disabled] - Whether button is disabled
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Button} Button component instance
 * @example
 * // Basic button
 * new Button({
 *   textContent: 'Click me',
 *   onPointerPress: () => console.log('clicked')
 * });
 *
 * // Button with tooltip
 * new Button({
 *   textContent: 'Save',
 *   tooltip: 'Save current changes',
 *   onPointerPress: handleSave
 * });
 */
export default class Button extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		const userOnKeyUp = options.onKeyUp;

		super(
			{
				...defaultOptions,
				...options,
				onKeyUp: event => {
					userOnKeyUp?.call(this, event);
					if (event.code === 'Space' || event.code === 'Enter') {
						this.options.onPointerPress?.(event);
					}
				},
			},
			...children,
		);
	}
}
