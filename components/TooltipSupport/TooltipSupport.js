import { Icon } from '../Icon';
import { Tooltip } from '../Tooltip';

/** A DomElem with support for a tooltip */
class TooltipSupport extends Icon {
	/**
	 * Create a DomElem component with TooltipSupport
	 * @param {Object} options - The options for initializing the component
	 * @param {(String|Object)} options.tooltip - The content used for the tooltip element
	 */
	constructor(options = {}) {
		super({
			...options,
			styles: theme => `
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

				${options.styles ? options.styles(theme) : ''}
			`,
		});
	}

	setOption(name, value) {
		if (name === 'tooltip') {
			const tooltipOptions = typeof value === 'object' ? value : { textContent: value };

			if (this._tooltip) this._tooltip.setOptions(tooltipOptions);
			else {
				this._tooltip = new Tooltip({
					appendTo: this.elem,
					...tooltipOptions,
				});
			}
		} else super.setOption(name, value);
	}
}

export default TooltipSupport;