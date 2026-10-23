import { styled } from '../../styled';
import { duration } from '../../theme/tokens';
import { Component } from '../../Component';

/**
 * A raised patch of the page holding one thing: a record in a list, a summary, a group of details. Given an accent it
 * carries a stripe of that color down its left edge; given onPointerPress it answers the pointer.
 * @param {object} [options={}] - Card configuration
 * @param {string|object} [options.accent] - A color for the left edge (a CSS color or a theme color)
 * @param {boolean} [options.interactive] - Answer hover and focus, and Enter or Space like a press; on by default when
 *   onPointerPress is given
 * @param {...(Component|HTMLElement|string)} children - What the card holds
 * @returns {Card} Card component instance
 * @example new Card({ accent: theme.colors.green, onPointerPress: open }, title, meta)
 */
class Card extends styled(
	Component,
	({ colors, focusRing, radius, space }) => `
		display: block;
		box-sizing: border-box;
		min-width: 0;
		padding: ${space.md};
		border-radius: ${radius.md};
		background-color: ${colors.raised};
		color: inherit;
		text-decoration: none;
		/* A card made a <button> or <a> stays a card, not the page's button look */
		border: none;
		font: inherit;
		text-align: inherit;
		white-space: normal;
		filter: none;

		&.accented {
			box-shadow: inset 3px 0 var(--card-accent);
		}

		&.interactive {
			cursor: pointer;
			transition: background-color ${duration.fast};

			&:hover, &:focus-visible {
				background-color: ${colors.alpha(colors.white, 0.09)};
			}

			&:focus-visible {
				${focusRing()}
			}
		}

		/* As a <button>, its states are a card's: these outweigh the page's button:hover and button:disabled */
		&:hover, &:active {
			filter: none;
		}

		&:disabled {
			background-color: ${colors.alpha(colors.white, 0.03)};
			color: ${colors.alpha(colors.white, 0.4)};
			cursor: not-allowed;
		}
	`,
) {
	static schema = {
		accent: {
			set(value) {
				this.toggleClass('accented', !!value);

				if (value) this.elem.style.setProperty('--card-accent', String(value));
				else this.elem.style.removeProperty('--card-accent');
			},
		},
		interactive: {
			set(value) {
				this.toggleClass('interactive', !!value);

				// A <button> or <a> is reachable and pressable by keyboard already; anything else is made so
				if (['BUTTON', 'A'].includes(this.elem.tagName)) return;

				if (value) {
					this.elem.tabIndex = 0;
					this.elem.setAttribute('role', 'button');
					this.on({
						targetEvent: 'keydown',
						id: 'cardKeyboardPress',
						callback: event => {
							if (event.target !== this.elem || !this.hasClass('interactive')) return;
							if (event.key !== 'Enter' && event.key !== ' ') return;

							event.preventDefault();
							this.options.onPointerPress?.(event);
						},
					});
				} else {
					this.elem.removeAttribute('tabindex');
					this.elem.removeAttribute('role');
				}
			},
		},
	};

	static prepareOptions(options) {
		return { interactive: !!options.onPointerPress, ...options };
	}
}

export default Card;
