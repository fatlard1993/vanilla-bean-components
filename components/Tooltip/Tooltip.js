import { styled } from '../../styled';
import { Popover } from '../Popover';

const StyledPopover = styled(
	Popover,
	({ colors }) => `
		position: absolute;
		padding: 3px;
		z-index: 1;
		pointer-events: none;
		max-width: 240px;
		margin: auto;
		background-color: ${colors.white};
		color: ${colors.black};
		opacity: 0;
		transform: scaleX(0);
		transition: opacity 0.4s, transform 0.1s, overlay 0.4s allow-discrete, display 0.4s allow-discrete;
		text-indent: 0;

		&:popover-open {
			opacity: 1;
			transform: scaleX(1);
			transition: overlay 0.4s allow-discrete, display 0.4s allow-discrete, opacity 0.4s, transform 0.4s;
		}

		@starting-style {
			&:popover-open {
				opacity: 0;
				transform: scaleX(-1);
			}
		}

		&:before {
			padding: 0 6px 0 3px;
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

const defaultOptions = { position: 'topRight', autoOpen: false };

const position_enum = ['center', 'top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

class Tooltip extends StyledPopover {
	position_enum = position_enum;
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				addClass: ['tooltip', ...(options.addClass || [])],
			},
			children,
		);
	}

	_setOption(key, value) {
		if (key === 'position') {
			if (!position_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid position. The position must be one of the following values: ${this.position_enum.join(
						', ',
					)}`,
				);
			}

			this.removeClass(...position_enum);
			this.addClass(value);
		} else super._setOption(key, value);
	}
}

export default Tooltip;
