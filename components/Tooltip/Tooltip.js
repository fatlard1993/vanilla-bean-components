import { Popover } from '../Popover';

const defaultOptions = { position: 'topRight' };

const position_enum = ['center', 'top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

class Tooltip extends Popover {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				autoOpen: false,
				styles: (theme, component) => `
					display: none;
					position: absolute;
					padding: 3px;
					z-index: 1;
					pointer-events: none;
					max-width: 240px;
					margin: auto;
					background-color: ${theme.colors.white};
					color: ${theme.colors.black};
					opacity: 0;
					animation-name: fadeIn, visible;
					animation-timing-function: ease-in, ease-out;
					animation-iteration-count: 1, infinite;
					animation-duration: 0.2s, 1s;
					animation-delay: 1s, 1.2s;

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

					@keyframes fadeIn {
						from {
							opacity: 0;
						}
						to {
							opacity: 1;
						}
					}

					@keyframes visible {
						from {
							opacity: 1;
						}
						to {
							opacity: 1;
						}
					}

					${options.styles?.(theme, component) || ''}
				`,
			},
			...children,
		);

		this.addClass('tooltip');
	}

	setOption(key, value) {
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
		} else super.setOption(key, value);
	}
}

export default Tooltip;
