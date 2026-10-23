import { Elem } from '../../Elem';
import { styled } from '../../styled';
import { space } from '../../theme/tokens';
import { Button } from '../Button';
import { Popover } from '../Popover';

// How long a toast of each type stays before dismissing itself; warnings and errors wait to be tapped
const TIMEOUT_BY_TYPE = { info: 4000, success: 4000, warning: 0, error: 0 };
const STACK_EDGE = parseInt(space.lg);
const STACK_GAP = parseInt(space.sm);
// A toast paused by a pointer or focus gets at least this long once they leave, so it doesn't vanish under the hand
const RESUME_MIN = 1500;

// Toasts placed by no point stack in the bottom-right corner, the newest at the bottom. They sit above the phone's
// home indicator, and above whatever an app keeps along the bottom edge (a tab bar) when it sets --vbc-notify-offset.
const stack = [];

const layOutStack = () => {
	let bottom = STACK_EDGE;

	for (const notify of [...stack].reverse()) {
		notify.elem.style.bottom = `calc(${bottom}px + var(--vbc-notify-offset, 0px) + env(safe-area-inset-bottom, 0px))`;
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
			padding: 0 ${space.sm} 0 0;
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

		& > .notify-actions {
			display: flex;
			gap: ${space.sm};
			margin-left: ${space.md};
			align-self: center;

			/* Flat, but still plainly a button on the toast's colour */
			& .vbc-button {
				box-shadow: inset 0 0 0 1px ${colors.alpha(colors.white, 0.35)};
				padding: calc(${space.xs} - 1px) ${space.md};
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
 * @param {Array<object>} [options.actions] - Buttons on the toast, e.g. { textContent: 'Undo', onPress }; onPress gets
 * (notify, event) and may be async, and the toast closes once it settles unless it returns false
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Notify} Notify component instance
 */
export default class Notify extends StyledPopover {
	static schema = {
		type: { default: 'success', enum: ['info', 'success', 'warning', 'error'] },
		timeout: {
			set(value) {
				this._startTimer(value);
			},
		},
		actions: {
			set(value) {
				this._renderActions(value);
			},
		},
	};

	static prepareOptions(options) {
		const { type } = options;

		const placed = options.x !== undefined && options.y !== undefined;

		// Setting the message would replace the toast's children, actions included, so beside actions it gets its own
		// element and the actions come last
		if (options.actions?.length) {
			const { content, textContent, actions, ...rest } = options;
			const message = new Elem({
				addClass: 'notify-message',
				...(content === undefined ? { textContent } : { content }),
			});

			options = { ...rest, append: [message].concat(rest.append ?? []), actions };
		}

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

		// A hand over the toast, or focus in it, holds it open: an action shouldn't leave while it's being reached for
		const hold = () => this._pauseTimer();
		const release = event => {
			if (event.type === 'focusout' && this.elem.contains(event.relatedTarget)) return;
			if (event.type === 'focusout' && this.elem.matches(':hover')) return;
			if (event.type === 'pointerleave' && this.elem.contains(document.activeElement)) return;

			this._resumeTimer();
		};

		this.on({ targetEvent: 'pointerenter', id: 'notifyHold', callback: hold });
		this.on({ targetEvent: 'pointerleave', id: 'notifyRelease', callback: release });
		this.elem.addEventListener('focusin', hold);
		this.elem.addEventListener('focusout', release);
		this.addCleanup('notifyFocusHold', () => {
			this.elem.removeEventListener('focusin', hold);
			this.elem.removeEventListener('focusout', release);
		});

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

	_startTimer(ms) {
		clearTimeout(this.timeout);
		this._remaining = ms || 0;
		this._deadline = null;
		if (!ms) return;

		this._deadline = Date.now() + ms;
		this.timeout = setTimeout(() => this.destroy(), ms);
		this.replaceCleanup('timeout', () => clearTimeout(this.timeout));
	}

	_pauseTimer() {
		if (!this._deadline) return;

		clearTimeout(this.timeout);
		this._remaining = Math.max(this._deadline - Date.now(), 0);
		this._deadline = null;
		this._paused = true;
	}

	_resumeTimer() {
		// An action still running keeps the toast up until it settles, however the pointer moves
		if (!this._paused || this._acting) return;

		this._paused = false;
		this._startTimer(Math.max(this._remaining, RESUME_MIN));
	}

	_renderActions(actions) {
		this._actions?.remove();
		this._actions = null;

		if (!actions?.length) return;

		this._actions = new Elem({ addClass: 'notify-actions', appendTo: this.elem });

		const buttons = actions.map(
			({ onPress, ...buttonOptions }) =>
				new Button({
					variant: 'flat',
					...buttonOptions,
					appendTo: this._actions,
					onPointerPress: async event => {
						// Once pressed, the actions wait: a second press can't run a restore twice
						if (buttons.some(button => button.options.disabled)) return;

						buttons.forEach(button => (button.options.disabled = true));
						this._acting = true;

						try {
							if ((await onPress?.(this, event)) === false) return;

							this.destroy();
						} catch (error) {
							globalThis.reportError ? globalThis.reportError(error) : console.error(error); // eslint-disable-line no-console
						} finally {
							this._acting = false;
							if (this.elem.isConnected) buttons.forEach(button => (button.options.disabled = false));
						}
					},
				}),
		);
	}

	show(options) {
		super.show(options);

		if (!this.hasClass('stacked') || !this.elem.isConnected) return;

		if (!stack.includes(this)) stack.push(this);
		layOutStack();
	}
}
