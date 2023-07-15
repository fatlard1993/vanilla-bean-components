import { Icon } from '../Icon';

const defaultOptions = { position: 'topRight' };

class Tooltip extends Icon {
	position_enum = Object.freeze(['top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight']);
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		super({
			...defaultOptions,
			...options,
			styles: theme => `
				display: none;
				position: absolute;
				padding: 3px;
				z-index: 1;
				border-radius: 3px;
				pointer-events: none;
				max-width: 240px;
				background-color: ${theme.colors.white};
				color: ${theme.colors.black};

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

				${options.styles?.(theme) || ''}
			`,
		});

		this.addClass('tooltip');
	}

	setOption(name, value) {
		if (name === 'position') {
			if (!this.position_enum.includes(value)) {
				throw new Error(
					`"${value}" is not a valid position. The position must be one of the following values: ${this.position_enum.join(
						', ',
					)}`,
				);
			}

			this.removeClass(...this.position_enum);
			this.addClass(value);
		} else super.setOption(name, value);
	}
}

export default Tooltip;
