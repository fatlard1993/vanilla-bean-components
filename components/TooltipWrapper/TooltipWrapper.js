import { Icon } from '../Icon';
import { Tooltip } from '../Tooltip';

/** A Component with support for a tooltip */
class TooltipWrapper extends Icon {
	/**
	 * @param {Object} options - The options for initializing the component
	 * @param {(String|Object)} options.tooltip - The content used for the tooltip element
	 */
	constructor(options = {}, ...children) {
		super(
			{
				...options,
				styles: (theme, component) => `
				${
					options.tooltip
						? `
							position: relative;
							display: inline-block;

							&:hover {
								overflow: visible;
								vertical-align: top;

								.tooltip {
									display: block;
								}
							}
						`
						: ''
				}

				${options.styles?.(theme, component) || ''}
			`,
			},
			...children,
		);
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
			}
		} else super.setOption(key, value);
	}
}

export default TooltipWrapper;
