import { Popover } from '../Popover';

const type_enum = Object.freeze(['info', 'success', 'warning', 'error']);

export default class Notify extends Popover {
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
			icon,
			styles: (theme, domElem) => `
				&:before {
					${theme.fonts.fontAwesomeSolid};

					position: relative;
					pointer-events: none;
					padding: 0 9px 0 0;
				}

				&.info {
					background-color: ${theme.colors.blackish(theme.colors.blue)};
					border-color: ${theme.colors.light(theme.colors.blue)};

					&:before {
						color: ${theme.colors.light(theme.colors.blue)};
					}
				}

				&.success {
					background-color: ${theme.colors.blackish(theme.colors.green)};
					border-color: ${theme.colors.light(theme.colors.green)};

					&:before {
						color: ${theme.colors.light(theme.colors.green)};
					}
				}

				&.warning {
					background-color: ${theme.colors.blackish(theme.colors.yellow)};
					border-color: ${theme.colors.light(theme.colors.yellow)};

					&:before {
						color: ${theme.colors.light(theme.colors.yellow)};
					}
				}

				&.error {
					background-color: ${theme.colors.blackish(theme.colors.red)};
					border-color: ${theme.colors.light(theme.colors.red)};

					&:before {
						color: ${theme.colors.light(theme.colors.red)};
					}
				}

				${options.styles?.(theme, domElem) || ''}
			`,
		});

		this.addClass(type);
		// if (icon) this.addClass(`fa-${icon}`);

		if (timeout) this.timeout = setTimeout(() => this.elem.remove(), timeout);
	}
}
