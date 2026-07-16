import { styled } from '../../styled';
import { Popover } from '../Popover';

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

/**
 * Notification popover component with type-based styling and auto-dismiss functionality.
 *
 * Extends Popover to provide notification-specific behavior including automatic icons,
 * color-coded styling based on notification type, and optional timeout dismissal.
 * @param {object} [options={}] - Notify configuration options
 * @param {string} [options.type='success'] - Notification type ('info', 'success', 'warning', 'error')
 * @param {string|Component} [options.content] - Notification content to display
 * @param {number} [options.timeout] - Auto-dismiss timeout in milliseconds
 * @param {string} [options.icon] - Custom icon name, defaults to type-appropriate icon
 * @param {number} [options.x] - X position for the notification
 * @param {number} [options.y] - Y position for the notification
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Notify} Notify component instance
 */
export default class Notify extends StyledPopover {
	static schema = {
		type: { default: 'success', enum: ['info', 'success', 'warning', 'error'] },
		timeout: {
			set(value) {
				clearTimeout(this.timeout);
				if (!value) return;
				this.timeout = setTimeout(() => this.destroy(), value);
				this.replaceCleanup('timeout', () => clearTimeout(this.timeout));
			},
		},
	};

	static prepareOptions(options) {
		const { type } = options;

		return {
			role: type === 'error' || type === 'warning' ? 'alert' : 'status',
			'aria-atomic': 'true',
			...options,
			addClass: [type].concat(options.addClass),
			icon:
				options.icon ||
				{ info: 'circle-info', success: 'check', warning: 'triangle-exclamation', error: 'skull-crossbones' }[type],
		};
	}

	build() {
		super.build();

		this.on({
			targetEvent: 'pointerdown',
			id: 'notifyDismiss',
			callback: e => {
				if (!e.target.closest('button, [role="button"]')) this.destroy();
			},
		});
	}
}
