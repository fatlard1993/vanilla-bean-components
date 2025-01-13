import { styled } from '../../utils';
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

				.tooltip {
					display: block;
				}
			}
		}
	`,
);

/** A Component with support for a tooltip */
export default class TooltipWrapper extends StyledIcon {
	/**
	 * @param {Object} options - The options for initializing the component
	 * @param {(String|Object)} options.tooltip - The content used for the tooltip element
	 */
	constructor(options = {}, ...children) {
		super(options, children);
	}

	setOption(key, value) {
		if (key === 'tooltip') {
			const tooltipOptions = typeof value === 'object' ? value : { textContent: value };

			if (this._tooltip) this._tooltip.setOptions(tooltipOptions);
			else {
				this._tooltip = new Tooltip({
					appendTo: this.elem,
					...tooltipOptions,
				});

				this.addClass('hasTooltip');
			}
		} else super.setOption(key, value);
	}
}
