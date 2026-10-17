import { styled } from '../../styled';
import { Popover } from '../Popover';

// How long a toast of each type stays before dismissing itself; warnings and errors wait to be tapped
const TIMEOUT_BY_TYPE = { info: 4000, success: 4000, warning: 0, error: 0 };
const STACK_EDGE = 16;
const STACK_GAP = 8;

// Toasts placed by no point stack in the bottom-right corner, the newest at the bottom
const stack = [];

const layOutStack = () => {
	let bottom = STACK_EDGE;

	for (const notify of [...stack].reverse()) {
		notify.elem.style.bottom = `${bottom}px`;
		bottom += notify.elem.offsetHeight + STACK_GAP;
	}
};

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

		&.stacked {
			position: fixed;
			inset: auto ${STACK_EDGE}px auto auto;
			margin: 0;
			transition: bottom 0.2s ease-out;
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
 * @param {number} [options.timeout] - Auto-dismiss timeout in milliseconds; defaults to 4000 for info and success, and 0 (stay until tapped) for warning and error
 * @param {string} [options.icon] - Custom icon name, defaults to type-appropriate icon
 * @param {number} [options.x] - X position for the notification; without x and y it stacks in the bottom-right corner
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

		const placed = options.x !== undefined && options.y !== undefined;

		return {
			role: type === 'error' || type === 'warning' ? 'alert' : 'status',
			'aria-atomic': 'true',
			...options,
			timeout: options.timeout ?? TIMEOUT_BY_TYPE[type],
			addClass: [type, !placed && 'stacked'].concat(options.addClass),
			icon:
				options.icon ||
				{ info: 'circle-info', success: 'check', warning: 'triangle-exclamation', error: 'skull-crossbones' }[type],
		};
	}

	build() {
		super.build();

		this.addCleanup('notifyStack', () => {
			if (stack.includes(this)) stack.splice(stack.indexOf(this), 1);
			layOutStack();
		});

		this.on({
			targetEvent: 'click',
			id: 'notifyDismiss',
			callback: e => {
				if (!e.target.closest('button, [role="button"]')) this.destroy();
			},
		});
	}

	show(options) {
		super.show(options);

		if (!this.hasClass('stacked') || !this.elem.isConnected) return;

		if (!stack.includes(this)) stack.push(this);
		layOutStack();
	}
}
