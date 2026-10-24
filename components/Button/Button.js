import { classEnum } from '../../Component';
import { intents } from '../../theme/tokens';
import { TooltipWrapper } from '../TooltipWrapper';

/**
 * Interactive button component with keyboard accessibility and tooltip support.
 *
 * Extends TooltipWrapper to provide button-specific behavior on a semantic button element, which activates on
 * Space/Enter by itself; a Button given another tag is made pressable (Component#pressable): the button role, a tab
 * stop, and Enter and Space pressing it as a click.
 * @param {object} [options={}] - Button configuration options
 * @param {string} [options.tag='button'] - HTML tag name, defaults to button for proper semantics
 * @param {Function} [options.onPointerPress] - Handler called when button is activated via click, touch, or keyboard
 * @param {string} [options.textContent] - Button label text
 * @param {string} [options.icon] - FontAwesome icon name (without 'fa-' prefix)
 * @param {string} [options.tooltip] - Tooltip text shown on hover
 * @param {boolean} [options.disabled] - Whether button is disabled
 * @param {('flat'|'chip'|'raised')} [options.variant] - 'flat' has no fill, for toolbars and icon buttons; 'chip' is a
 *   small outlined pill, for filters and choices; 'raised' is bevelled and sinks as it's pressed
 * @param {('info'|'success'|'warning'|'danger')} [options.intent] - What pressing it does, drawn in that status role:
 *   'danger' for a delete, 'success' for a confirm. A flat or chip button takes it as its text color
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
	static schema = {
		tag: { default: 'button' },
		variant: classEnum('variant', ['flat', 'chip', 'raised']),
		intent: classEnum('intent', intents),
	};

	// The class the theme gives a Button's look to, whatever the page does for bare buttons
	static prepareOptions(options) {
		return { ...options, addClass: ['vbc-button', options.addClass] };
	}

	// A <button> presses by keyboard itself; on any other tag it's given the same
	build() {
		this.pressable();
	}
}
