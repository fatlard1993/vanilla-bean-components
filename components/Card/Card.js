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
 * @param {boolean} [options.disabled] - A pressable card that can't be pressed now: dimmed, no hover, and aria-disabled
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

			&:not(.disabled):hover, &:focus-visible {
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

		/* Dimmed whole, so what the card holds fades too, whatever colors it sets for itself */
		&:disabled, &.disabled {
			opacity: 0.5;
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
		// A <button> is disabled by the browser; any other tag is told so for assistive technology, and swallows its presses
		disabled: {
			set(value, next) {
				if (this.elem.tagName === 'BUTTON') return next(value);

				this.toggleClass('disabled', !!value);

				if (value) this.elem.setAttribute('aria-disabled', 'true');
				else this.elem.removeAttribute('aria-disabled');
			},
		},
		interactive: {
			set(value) {
				this.toggleClass('interactive', !!value);

				// A <button> or <a> is reachable and pressable by keyboard already; pressable leaves them be
				this.pressable(!!value);
			},
		},
	};

	// Ahead of every other listener on the element, so a disabled card presses nothing
	build() {
		this.elem.addEventListener(
			'click',
			event => {
				if (this.elem.tagName === 'BUTTON' || this.elem.getAttribute('aria-disabled') !== 'true') return;

				event.preventDefault();
				event.stopImmediatePropagation();
			},
			{ capture: true, signal: this.signal },
		);
	}

	static prepareOptions(options) {
		// A card that goes somewhere is a link, and answers the pointer as a pressable one does
		return { interactive: !!options.onPointerPress || (options.tag === 'a' && !!options.href), ...options };
	}
}

export default Card;
