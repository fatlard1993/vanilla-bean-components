import { styled } from '../../styled';
import { Icon } from '../Icon';
import { Tooltip } from '../Tooltip';

const StyledIcon = styled(
	Icon,
	() => `
		/* A button keeps its own display (an icon-only one centers its glyph); anything else holds its tooltip as a box */
		&.has-tooltip:where(:not(.vbc-button, .variant-button)) {
			display: inline-block;
		}

		&.has-tooltip {
			position: relative;

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
 * @param {string|object|false} [options.tooltip] - Tooltip text or configuration object; false for none
 * @param {string} [options.icon] - Icon to display in the component
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {TooltipWrapper} TooltipWrapper component instance
 */
export default class TooltipWrapper extends StyledIcon {
	static schema = {
		tooltip: {
			set(value) {
				this._applyTooltip(value);
			},
		},
	};

	_applyTooltip(value) {
		if (value === false) {
			this._tooltip?.destroy?.();
			this._tooltip = null;
			this.removeClass('has-tooltip');

			return;
		}

		if (value == null) return;
		const tooltipOptions = typeof value === 'object' ? value : { textContent: value };

		if (this._tooltip) {
			this._tooltip.setOptions(tooltipOptions);
			// A re-render emptied the element; the tooltip is put back before the task ends, so it is moved, not discarded
			if (!this.elem.contains(this._tooltip.elem)) this.append(this._tooltip);
		} else {
			this._tooltip = new Tooltip({
				appendTo: this.elem,
				...tooltipOptions,
			});

			this.addClass('has-tooltip');

			// pointerenter and pointerleave, not over and out: crossing into a child is not leaving the element. Opened
			// with no point, the tooltip sits at its position against this element rather than under the pointer
			this.on({
				targetEvent: 'pointerenter',
				callback: () => {
					clearTimeout(this.tooltipTimeout);
					this.tooltipTimeout = setTimeout(() => this._tooltip?.open(), 700);
				},
			});

			this.on({
				targetEvent: 'pointerleave',
				callback: () => {
					clearTimeout(this.tooltipTimeout);
					if (!this.elem.contains(document.activeElement)) this._tooltip?.close();
				},
			});

			this.on({
				// focusin and focusout bubble, so a focused child (a wrapped input, say) shows the tooltip too
				targetEvent: 'focusin',
				callback: () => {
					clearTimeout(this.tooltipTimeout);
					this._tooltip?.open();
				},
			});

			this.on({
				targetEvent: 'focusout',
				callback: ({ relatedTarget }) => {
					if (this.elem.contains(relatedTarget)) return;
					clearTimeout(this.tooltipTimeout);
					this._tooltip?.close();
				},
			});

			this.replaceCleanup('tooltip', () => {
				if (this._tooltip) {
					this._tooltip.destroy?.();
					this._tooltip = null;
				}
				clearTimeout(this.tooltipTimeout);
			});
		}
	}
}
