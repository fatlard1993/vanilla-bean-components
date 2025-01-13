import { styled } from '../../utils';
import { Popover } from '../Popover';

const type_enum = Object.freeze(['info', 'success', 'warning', 'error']);

const StyledPopover = styled(
	Popover,
	({ colors, fonts }) => `
		&:before {
			${fonts.fontAwesomeSolid};

			position: relative;
			pointer-events: none;
			padding: 0 9px 0 0;
		}

		&.info {
			background-color: ${colors.blackish(colors.blue)};
			border-color: ${colors.light(colors.blue)};

			&:before {
				color: ${colors.light(colors.blue)};
			}
		}

		&.success {
			background-color: ${colors.blackish(colors.green)};
			border-color: ${colors.light(colors.green)};

			&:before {
				color: ${colors.light(colors.green)};
			}
		}

		&.warning {
			background-color: ${colors.blackish(colors.yellow)};
			border-color: ${colors.light(colors.yellow)};

			&:before {
				color: ${colors.light(colors.yellow)};
			}
		}

		&.error {
			background-color: ${colors.blackish(colors.red)};
			border-color: ${colors.light(colors.red)};

			&:before {
				color: ${colors.light(colors.red)};
			}
		}
	`,
);

export default class Notify extends StyledPopover {
	type_enum = type_enum;

	constructor(options) {
		const { timeout, type = 'success' } = options;
		const icon =
			options.icon ||
			{ info: 'circle-info', success: 'check', warning: 'triangle-exclamation', error: 'skull-crossbones' }[type];

		super({
			onPointerPress: () => this.elem.remove(),
			state: 'manual',
			...options,
			addClass: [type, ...(options.addClass || [])],
			icon,
		});

		if (timeout) this.timeout = setTimeout(() => this.elem.remove(), timeout);
	}
}
