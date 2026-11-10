import { Elem } from '../../Elem';
import { styled } from '../../styled';
import { classEnum } from '../../Component';
import { duration, intents, space } from '../../theme/tokens';
import { Button } from '../Button';
import { Popover } from '../Popover';

// How long a toast of each intent stays before dismissing itself; warnings and dangers wait to be tapped
const TIMEOUT_BY_INTENT = { info: 4000, success: 4000, warning: 0, danger: 0 };
const ICON_BY_INTENT = {
	info: 'circle-info',
	success: 'check',
	warning: 'triangle-exclamation',
	danger: 'skull-crossbones',
};
const STACK_EDGE = parseInt(space.lg);
const STACK_GAP = parseInt(space.sm);
// A toast paused by a pointer or focus gets at least this long once they leave, so it doesn't vanish under the hand
const RESUME_MIN = 1500;
// The most toasts the stack shows at once; older ones fold behind a button that shows them all
const MAX_VISIBLE = 3;

// Toasts placed by no point stack in the bottom-right corner, the newest at the bottom. They sit above the phone's
// home indicator, and above whatever an app keeps along the bottom edge (a tab bar) when it sets --vbc-notify-offset.
const stack = [];
let unfolded = false;
let moreButton;

const stackBottom = bottom => `calc(${bottom}px + var(--vbc-notify-offset, 0px) + env(safe-area-inset-bottom, 0px))`;

// Above the newest toasts, how many older ones are folded away; pressed, it shows them all until the stack is short again
const showFolded = (count, bottom) => {
	if (!count) {
		moreButton?.destroy();
		moreButton = null;
		return;
	}

	if (!moreButton?.elem.isConnected) {
		moreButton = new Button({
			variant: 'raised',
			addClass: 'notify-more',
			style: {
				position: 'fixed',
				inset: 'auto',
				margin: '0',
				right: `calc(${STACK_EDGE}px + env(safe-area-inset-right, 0px))`,
			},
			appendTo: document.body,
			onPointerPress: () => {
				unfolded = true;
				layOutStack();
			},
		});
		// In the top layer with the toasts, or a modal dialog would cover it while they show
		moreButton.elem.setAttribute('popover', 'manual');
		moreButton.elem.showPopover?.();
	}

	moreButton.options.textContent = `+${count} more`;
	moreButton.elem.style.bottom = stackBottom(bottom);
};

const layOutStack = () => {
	if (stack.length <= MAX_VISIBLE) unfolded = false;

	const folded = unfolded ? [] : stack.slice(0, Math.max(stack.length - MAX_VISIBLE, 0));
	let bottom = STACK_EDGE;

	for (const notify of [...stack].reverse()) {
		notify.elem.style.display = folded.includes(notify) ? 'none' : '';

		if (folded.includes(notify)) continue;

		notify.elem.style.bottom = stackBottom(bottom);
		bottom += notify.elem.offsetHeight + STACK_GAP;
	}

	showFolded(folded.length, bottom);
};

// What makes two toasts the same message: the same words, said the same way. A toast with actions is about one thing
// (undo deleting this, not that), so it is never the same as another.
const sameMessage = (a, b) => {
	const text = notify => {
		const { content, textContent, actions } = notify.options;
		const said = content ?? textContent;

		return !actions?.length && typeof said === 'string' ? said : null;
	};

	return text(a) !== null && text(a) === text(b) && a.options.intent === b.options.intent;
};

const StyledPopover = styled(
	Popover,
	({ colors, fonts, media, safeArea }) => `
		&:before {
			${fonts.fontAwesomeSolid};

			position: relative;
			pointer-events: none;
			padding: 0 ${space.sm} 0 0;
		}

		${intents
			.map(
				intent => `
		&.intent-${intent} {
			/* The one surface, tinted by its status */
			background: linear-gradient(${colors.alpha(colors[intent], 0.14)}, ${colors.alpha(colors[intent], 0.14)}) ${colors.surface};
			border-color: ${colors.light(colors[intent])};

			&:before {
				color: ${colors.light(colors[intent])};
			}
		}`,
			)
			.join('\n')}

		& > .notify-count {
			margin-left: auto;
			padding-left: ${space.md};
			font-variant-numeric: tabular-nums;
			color: ${colors.muted};
		}

		&.repeated {
			animation: notify-repeat ${duration.base} ease-out;
		}

		@keyframes notify-repeat {
			40% {
				transform: scale(1.04);
			}
		}

		& > .notify-actions {
			display: flex;
			gap: ${space.sm};
			/* At the toast's far end, however wide a phone stretches it */
			margin-left: auto;
			padding-left: ${space.md};
			align-self: center;

			/* Flat, but still plainly a button on the toast's colour */
			& .vbc-button {
				box-shadow: inset 0 0 0 1px ${colors.alpha(colors.white, 0.35)};
				padding: calc(${space.xs} - 1px) ${space.md};
			}
		}

		&.stacked {
			position: fixed;
			inset: auto calc(${STACK_EDGE}px + ${safeArea.right}) auto auto;
			margin: 0;

			/* A phone's toasts span its width */
			@media ${media.phone} {
				left: calc(${space.md} + ${safeArea.left});
				right: calc(${space.md} + ${safeArea.right});
				width: auto;
			}
			transition: bottom ${duration.fast} ease-out;
		}
	`,
);

/**
 * Notification popover component with intent-based styling and auto-dismiss functionality.
 *
 * Extends Popover to provide notification-specific behavior including automatic icons,
 * color-coded styling based on its intent, and optional timeout dismissal.
 * @param {object} [options={}] - Notify configuration options
 * @param {('info'|'success'|'warning'|'danger')} [options.intent='success'] - What the message is about, drawn in that status role
 * @param {string|Component} [options.content] - Notification content to display
 * @param {number} [options.timeout] - Auto-dismiss timeout in milliseconds; defaults to 4000 for info and success, and 0 (stay until tapped) for warning and danger
 * @param {string} [options.icon] - Custom icon name, defaults to the intent's icon
 * @param {number} [options.x] - X position for the notification; without x and y it stacks in the bottom-right corner
 * @param {number} [options.y] - Y position for the notification
 * @param {Array<object>} [options.actions] - Buttons on the toast, e.g. { textContent: 'Undo', onPointerPress }; its
 * onPointerPress gets (notify, event) and may be async, and the toast closes once it settles unless it returns false
 *
 * A stacked toast that says what one already showing says (the same intent and words, and no actions) isn't shown
 * again: the one showing counts it (×2, ×3) and starts its clock over. The stack shows the newest three; older ones
 * fold behind a "+N more" button.
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Notify} Notify component instance
 */
export default class Notify extends StyledPopover {
	static schema = {
		intent: classEnum('intent', intents, { default: 'success' }),
		// Counted from opening, not from rendering: a toast made with autoOpen false waits for its open()
		timeout: {
			set(value) {
				if (this.isOpen) this._startTimer(value);
			},
		},
		actions: {
			set(value) {
				this._renderActions(value);
			},
		},
	};

	static prepareOptions(options) {
		const { intent } = options;

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
			role: intent === 'danger' || intent === 'warning' ? 'alert' : 'status',
			'aria-atomic': 'true',
			...options,
			timeout: options.timeout ?? TIMEOUT_BY_INTENT[intent],
			addClass: [!placed && 'stacked'].concat(options.addClass),
			icon: options.icon || ICON_BY_INTENT[intent],
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
		this.elem.addEventListener('focusin', hold, { signal: this.signal });
		this.elem.addEventListener('focusout', release, { signal: this.signal });

		// Closed, however it closed, it leaves the stack and stops its clock; destroyed, the same
		const leave = () => {
			clearTimeout(this._timer);
			this._deadline = null;
			this._paused = false;
			if (stack.includes(this)) stack.splice(stack.indexOf(this), 1);
			layOutStack();
		};

		this.on({ targetEvent: 'close', id: 'notifyLeave', callback: leave });
		this.addCleanup('notifyStack', leave);

		this.on({
			targetEvent: 'click',
			id: 'notifyDismiss',
			callback: e => {
				if (!e.target.closest('button, [role="button"]')) this.destroy();
			},
		});
	}

	_startTimer(ms) {
		clearTimeout(this._timer);
		this._remaining = ms || 0;
		this._deadline = null;
		if (!ms) return;

		this._deadline = Date.now() + ms;

		// The cleanup holds this timer's own id: the one it replaces runs now, and must not clear the timer just set
		const timer = setTimeout(() => this.destroy(), ms);

		this._timer = timer;
		this.replaceCleanup('timeout', () => clearTimeout(timer));
	}

	_pauseTimer() {
		if (!this._deadline) return;

		clearTimeout(this._timer);
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
		this._actions?.elem.remove();
		this._actions = null;

		if (!actions?.length) return;

		this._actions = new Elem({ addClass: 'notify-actions', appendTo: this.elem });

		const buttons = actions.map(
			({ onPointerPress, ...buttonOptions }) =>
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
							if ((await onPointerPress?.(this, event)) === false) return;

							this.destroy();
						} catch (error) {
							globalThis.reportError ? globalThis.reportError(error) : console.error(error); // eslint-disable-line no-console
						} finally {
							this._acting = false;

							if (this.elem.isConnected) {
								buttons.forEach(button => (button.options.disabled = false));

								// The toast stays: its clock starts again unless a hand or focus is still on it
								if (!this.elem.matches(':hover') && !this.elem.contains(document.activeElement)) this._resumeTimer();
							}
						}
					},
				}),
		);
	}

	/**
	 * Counts the same message said again: the count shows on the toast, and its clock starts over.
	 */
	repeat() {
		this._count = (this._count ?? 1) + 1;
		this._countBadge ??= new Elem({ tag: 'span', addClass: 'notify-count', appendTo: this.elem });
		Object.assign(this._countBadge.elem, { textContent: `×${this._count}`, title: `Said ${this._count} times` });

		this.removeClass('repeated');
		void this.elem.offsetWidth; // a restart of the pulse, which the class alone wouldn't replay
		this.addClass('repeated');

		if (!this._paused) this._startTimer(this.options.timeout);
	}

	open(options) {
		const twin = this.hasClass('stacked') && !this.isOpen && stack.find(notify => sameMessage(notify, this));

		if (twin) {
			twin.repeat();
			this.destroy();
			return;
		}

		super.open(options);

		if (!this.isOpen) return;

		this._startTimer(this.options.timeout);
		// Opened under a hand, under focus, or mid-action, it waits as it would had they arrived after
		if (this._acting || this.elem.matches(':hover') || this.elem.contains(document.activeElement)) this._pauseTimer();

		if (!this.hasClass('stacked')) return;

		if (!stack.includes(this)) stack.push(this);
		layOutStack();
	}
}
