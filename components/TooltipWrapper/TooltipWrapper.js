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

/** A Component with support for a tooltip */
export default class TooltipWrapper extends StyledIcon {
	_setOption(key, value) {
		if (key === 'tooltip') {
			const tooltipOptions = typeof value === 'object' ? value : { textContent: value };

			if (this._tooltip) {
				this._tooltip.setOptions(tooltipOptions);
			} else {
				this._tooltip = new Tooltip({
					appendTo: this.elem,
					...tooltipOptions,
				});

				this.addClass('hasTooltip');

				this._tooltipOverId = this.on({
					targetEvent: 'pointerover',
					callback: ({ clientX, clientY }) => {
						this.tooltipTimeout = setTimeout(() => this._tooltip.show({ x: clientX, y: clientY }), 700);
					},
				});

				this._tooltipOutId = this.on({
					targetEvent: 'pointerout',
					callback: () => {
						clearTimeout(this.tooltipTimeout);
						this._tooltip.hide();
					},
				});

				// Add cleanup for tooltip
				this.addCleanup('tooltip', () => {
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
