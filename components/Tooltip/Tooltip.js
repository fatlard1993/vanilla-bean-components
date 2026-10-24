import { styled } from '../../styled';
import { Popover } from '../Popover';
import { duration, radius, space } from '../../theme/tokens';

const StyledPopover = styled(
	Popover,
	({ colors }) => `
		position: absolute;
		padding: ${space.xs};
		z-index: 1;
		pointer-events: none;
		max-width: 240px;
		margin: auto;
		/* Inverted, so a hint reads apart from the surfaces it floats over */
		background-color: ${colors.white};
		border-color: ${colors.white};
		border-radius: ${radius.sm};
		color: ${colors.black};
		opacity: 0;
		transform: scaleX(0);
		transition: opacity ${duration.base}, transform ${duration.fast}, overlay ${duration.base} allow-discrete, display ${duration.base} allow-discrete;
		text-indent: 0;

		&:popover-open {
			opacity: 1;
			transform: scaleX(1);
			transition: overlay ${duration.base} allow-discrete, display ${duration.base} allow-discrete, opacity ${duration.base}, transform ${duration.base};
		}

		@starting-style {
			&:popover-open {
				opacity: 0;
				transform: scaleX(-1);
			}
		}

		&:before {
			padding: 0 ${space.sm} 0 ${space.xs};
		}

		&:empty:before {
			padding: 0;
		}

		&.center {
			top: 2px;
			left: 50%;
			transform: translateX(-50%);
		}
		&.top {
			left: 50%;
			bottom: calc(100% - 3px);
			transform: translateX(-50%);
		}
		&.bottom {
			left: 50%;
			top: calc(100% - 3px);
			transform: translateX(-50%);
		}
		&.left {
			top: 2px;
			right: calc(100% + 2px);
		}
		&.right {
			top: 2px;
			left: calc(100% + 2px);
		}
		&.topLeft {
			right: calc(100% - 9px);
			bottom: calc(100% - 9px);
		}
		&.topRight {
			left: calc(100% - 9px);
			bottom: calc(100% - 9px);
		}
		&.bottomLeft {
			right: calc(100% - 9px);
			top: calc(100% - 9px);
		}
		&.bottomRight {
			left: calc(100% - 9px);
			top: calc(100% - 9px);
		}
	`,
);

const POSITIONS = Object.freeze([
	'center',
	'top',
	'bottom',
	'left',
	'right',
	'topLeft',
	'topRight',
	'bottomLeft',
	'bottomRight',
]);

/**
 * Tooltip popover component with configurable positioning and smooth animations.
 *
 * Extends Popover to provide tooltip-specific styling and positioning options.
 * Supports multiple position presets and animated open/close transitions.
 * @param {object} [options={}] - Tooltip configuration options
 * @param {('center'|'top'|'bottom'|'left'|'right'|'topLeft'|'topRight'|'bottomLeft'|'bottomRight')} [options.position='topRight'] - Tooltip position relative to parent
 * @param {boolean|number} [options.autoOpen=false] - Open a moment after it's added to the page, as a Popover does
 * @param {string} [options.textContent] - Tooltip text content
 * @param {string} [options.icon] - Icon to display in tooltip
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Tooltip} Tooltip component instance
 */
class Tooltip extends StyledPopover {
	static schema = {
		autoOpen: { default: false },
		position: {
			default: 'topRight',
			enum: POSITIONS,
			set(value) {
				this.removeClass(...POSITIONS);
				this.addClass(value);
			},
		},
	};

	static prepareOptions(options) {
		return { ...options, addClass: ['tooltip'].concat(options.addClass) };
	}
}

export default Tooltip;
