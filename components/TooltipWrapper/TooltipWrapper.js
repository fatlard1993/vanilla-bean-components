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

				this.on({
					targetEvent: 'pointerover',
					callback: ({ clientX, clientY }) => this._tooltip.show({ x: clientX, y: clientY }),
				});

				this.on({
					targetEvent: 'pointerout',
					callback: () => this._tooltip.hide(),
				});
			}
		} else super.setOption(key, value);
	}
}
