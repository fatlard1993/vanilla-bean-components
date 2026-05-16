import { styled } from '../../styled';
import { Icon } from '../Icon';
import { Tooltip } from '../Tooltip';

const StyledIcon = styled(
	Icon,
	() => `
		&.hasTooltip {
			position: relative;
			display: inline-block;

			&:hover {
				overflow: visible;
				vertical-align: top;
			}
		}
	`,
);

/**
 * Wrapper component that adds tooltip functionality to any component.
 *
 * Extends Icon to provide automatic tooltip management with hover triggers,
 * positioning, and lifecycle management. Tooltips appear on hover with configurable delay.
 * @param {object} [options={}] - TooltipWrapper configuration options
 * @param {string|object} [options.tooltip] - Tooltip text or configuration object
 * @param {string} [options.icon] - Icon to display in the component
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {TooltipWrapper} TooltipWrapper component instance
 */
export default class TooltipWrapper extends StyledIcon {
	_setOption(key, value) {
		if (key === 'tooltip') {
			if (value == null) return;
			const tooltipOptions = typeof value === 'object' ? value : { textContent: value };

			if (this._tooltip) {
				this._tooltip.setOptions(tooltipOptions);
			} else {
				this._tooltip = new Tooltip({
					appendTo: this.elem,
					...tooltipOptions,
				});

				this.addClass('hasTooltip');

				this.on({
					targetEvent: 'pointerover',
					callback: ({ clientX, clientY }) => {
						this.tooltipTimeout = setTimeout(() => this._tooltip.show({ x: clientX, y: clientY }), 700);
					},
				});

				this.on({
					targetEvent: 'pointerout',
					callback: () => {
						clearTimeout(this.tooltipTimeout);
						this._tooltip.hide();
					},
				});

				// Add cleanup for tooltip
				this.replaceCleanup('tooltip', () => {
					if (this._tooltip) {
						this._tooltip.destroy?.();
						this._tooltip = null;
					}
					clearTimeout(this.tooltipTimeout);
				});
			}
		} else super._setOption(key, value);
	}
}
