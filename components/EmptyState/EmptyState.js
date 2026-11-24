import { styled } from '../../styled';
import { Component } from '../../Component';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Elem } from '../../Elem';
import { radius } from '../../theme/tokens';

/**
 * What a list or view shows when it has nothing in it: an icon, a title, a line saying why or what to do, and
 * optionally the button that does it.
 * @param {object} [options={}] - EmptyState configuration
 * @param {string} [options.icon] - A Font Awesome icon name
 * @param {string} [options.title] - The headline, e.g. 'No fields yet'
 * @param {string} [options.message] - A line under it
 * @param {object|Component} [options.action] - Button options ({ textContent, onPointerPress }) or a Component
 * @param {boolean} [options.loading] - Show a turning ring in place of the icon, while what would fill the view is on its way
 * @param {number} [options.progress] - How far a long load has come, from 0 to 1, shown as a bar under the message
 * @param {...(Component|HTMLElement|string)} children - Appended below the rest
 * @returns {EmptyState} EmptyState component instance
 * @example new EmptyState({ icon: 'seedling', title: 'No fields yet', message: 'Draw one on the map.' })
 * @example new EmptyState({ loading: true })
 */
class EmptyState extends styled(
	Component,
	({ colors, fontSize, space }) => `
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: ${space.sm};
		flex: 1;
		padding: 40px ${space.lg};
		text-align: center;
		color: ${colors.muted};

		/* A part with nothing to show takes no room, whatever display an app's styling gives it */
		& > [hidden] {
			display: none !important;
		}

		& > .icon {
			font-size: 40px;
			opacity: 0.7;
		}

		/* Drawn, not a glyph: a font glyph turns about its text box, which is not its own centre, and wobbles */
		& > .spinner {
			box-sizing: border-box;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			background:
				conic-gradient(transparent 25%, ${colors.light(colors.info)}),
				${colors.alpha(colors.white, 0.12)};
			mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
			animation: empty-state-spin 0.9s linear infinite;
		}

		@keyframes empty-state-spin {
			to {
				transform: rotate(1turn);
			}
		}

		& > .title {
			font-size: ${fontSize.lg};
			font-weight: 600;
			color: ${colors.white};
		}

		& > .message {
			max-width: 36em;
		}

		& > .action {
			margin-top: ${space.sm};
		}

		& > .progress {
			appearance: none;
			width: min(320px, 100%);
			height: 6px;
			margin-top: ${space.sm};
			border: none;
			border-radius: ${radius.pill};
			overflow: hidden;
			background: ${colors.alpha(colors.white, 0.12)};

			&::-webkit-progress-bar {
				background: transparent;
			}

			&::-webkit-progress-value {
				background: ${colors.light(colors.info)};
				transition: width 0.2s ease-out;
			}

			&::-moz-progress-bar {
				background: ${colors.light(colors.info)};
			}
		}

		& > :empty:not(.icon, .spinner, .progress) {
			display: none;
		}
	`,
) {
	static schema = {
		icon: {
			set() {
				this._showIcon();
			},
		},
		loading: {
			set(value) {
				this.toggleClass('loading', !!value);
				this._showIcon();
			},
		},
		progress: {
			set() {
				this._showProgress();
			},
		},
		title: {
			set(value) {
				this._title.options.textContent = value ?? '';
				this._showProgress();
			},
		},
		message: {
			set(value) {
				this._message.options.textContent = value ?? '';
			},
		},
		action: {
			set(value) {
				this._action?.elem.remove();
				this._action = null;

				if (!value) return;

				this._action = value instanceof Component ? value : new Button(value);
				this._action.addClass('action');
				this.elem.insertBefore(this._action.elem, this._progress.elem.nextSibling);
			},
		},
	};

	build() {
		this._icon = new Icon({ addClass: 'icon', appendTo: this });
		this._icon.elem.hidden = true;
		this._spinner = new Elem({ addClass: 'spinner', appendTo: this });
		this._spinner.elem.hidden = true;
		this._title = new Component({ addClass: 'title', appendTo: this });
		this._message = new Component({ addClass: 'message', appendTo: this });
		this._progress = new Elem({ tag: 'progress', addClass: 'progress', appendTo: this });
		this._progress.elem.max = 1;
		this._progress.elem.hidden = true;
		this._action = null;
	}

	_showProgress() {
		const { progress, title } = this.options;
		const bar = this._progress.elem;

		bar.hidden = typeof progress !== 'number' || Number.isNaN(progress);
		bar.value = Math.min(Math.max(progress || 0, 0), 1);
		bar.setAttribute('aria-label', title || 'Loading');
	}

	_showIcon() {
		const { loading, icon } = this.options;

		this._spinner.elem.hidden = !loading;
		this._icon.options.icon = icon ?? '';
		this._icon.elem.hidden = loading || !icon;
	}
}

export default EmptyState;
