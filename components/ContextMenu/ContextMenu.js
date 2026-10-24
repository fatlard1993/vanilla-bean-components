import { Component } from '../../Component';
import { Elem } from '../../Elem';
import { styled } from '../../styled';
import { Menu } from '../Menu';
import { Popover } from '../Popover';
import { duration, fontSize, space } from '../../theme/tokens';

// Between the menu and the button it hangs from, and between the menu and the viewport's edge
const ANCHOR_GAP = 4;
const VIEWPORT_EDGE = 8;

const reticleWidth = 32; // Click indicator width in px
// The hexangle's own proportion is width * 0.857142857 = 27.43px; 28 keeps the placement offset on
// whole pixels and is 2% off natural.
const reticleHeight = 28;

/*
 * An upward hexangle — narrow flat top, full width at 72% down, flat bottom — outlined by a 2.5px
 * ring, with a mark where each of three oversized discs crosses it and a dot at the middle.
 *
 * The discs are 8px radius and would merge into a blob without clipping; the ring — a clip-path
 * here — slices them into the three marks.
 *
 * The outer points match the corner cuts of augmented-ui's all-hexangle-up, which this clip-path
 * replaces (top corners 35.7142857% wide by 72.1687836% tall, bottom corners 13.7728802% by
 * 27.8312164%). The discs sit
 * on the midpoints of the top edge and the two lower diagonals, which lands each mark centered on
 * its edge.
 *
 * The inner points come from offsetting each edge 2.5px inward and intersecting the results — done
 * in pixel space, because on a box this much wider than it is tall an even pixel ring is an uneven
 * percentage one. They are traced the opposite way round, so the winding cancels the outer loop and
 * the middle is punched out under the default nonzero fill rule (evenodd support is too young).
 *
 * To adjust the ring width, recompute the inner loop as a set: offset each outer edge inward by the
 * new width in pixel space and re-intersect. The values are not independently tunable.
 */
const Reticle = styled(
	Component,
	({ colors }) => `
	/* Placed by the point's viewport coordinates, so a scrolled page doesn't carry it off */
	position: fixed;
	width: ${reticleWidth}px;
	height: ${reticleHeight}px;
	color: ${colors.red};
	/* It lands under the cursor by definition, and it is decoration — it must not eat the click. */
	pointer-events: none;

	--reticle-color: currentColor;
	--reticle-size: calc(${reticleWidth}px * 0.25);

	transform-origin: 50% 56%;
	transform: rotateZ(0deg);
	transition:
		transform ${duration.base} ease-out,
		color ${duration.base} ease-out;
	background: radial-gradient(circle at 50% 56%, var(--reticle-color) 2px, transparent 2px);

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at top center, var(--reticle-color) var(--reticle-size), transparent var(--reticle-size)),
			radial-gradient(
				circle at bottom 13.92% right 6.89%,
				var(--reticle-color) var(--reticle-size),
				transparent var(--reticle-size)
			),
			radial-gradient(
				circle at bottom 13.92% left 6.89%,
				var(--reticle-color) var(--reticle-size),
				transparent var(--reticle-size)
			);
		clip-path: polygon(
			35.71% 0%, 64.29% 0%, 100% 72.17%, 86.23% 100%, 13.77% 100%, 0% 72.17%, 35.71% 0%,
			8.98% 72.17%, 18.33% 91.07%, 81.67% 91.07%, 91.02% 72.17%, 59.73% 8.93%, 40.27% 8.93%, 8.98% 72.17%
		);
	}

	@starting-style {
		transform: rotateZ(360deg) scale(3);
		color: transparent;
	}
`,
);

const StyledPopover = styled(
	Popover,
	({ colors }) => `
		padding: 0;
		overflow: hidden auto;
		transform: scaleY(0);
		transition:
			opacity ${duration.base},
			transform ${duration.fast},
			overlay ${duration.base} allow-discrete,
			display ${duration.base} allow-discrete;

		&::backdrop {
			background-color: ${colors.alpha(colors.black, 0)};
			transition:
				display ${duration.slow} allow-discrete,
				overlay ${duration.slow} allow-discrete,
				background-color ${duration.slow};
		}

		/* It unfolds from where it was asked for, and dims the page behind it */
		&:popover-open {
			opacity: 1;
			transform: scaleY(1);
			transition:
				overlay ${duration.slow} allow-discrete,
				display ${duration.slow} allow-discrete,
				opacity ${duration.slow},
				transform ${duration.slow};

			&::backdrop {
				background-color: ${colors.overlay};
			}
		}

		@starting-style {
			&:popover-open {
				opacity: 0;
				transform: scaleY(0);

				&::backdrop {
					background-color: ${colors.alpha(colors.black, 0)};
				}
			}
		}

		/* The menu fills the box, however wide its widest row makes it */
		& > ul {
			flex: 1 1 auto;
			min-width: 0;
		}

		& li {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			/* The list's first-line indent as padding, so a row's text starts where it did and its detail line lines up */
			text-indent: 0;
			padding-left: ${space.md};
		}

		& li .label, & li .detail {
			display: block;
		}

		& li .detail {
			margin-top: 2px;
			color: ${colors.muted};
			font-size: ${fontSize.xs};
			white-space: normal;
		}

		& li.heading, & li.heading:hover {
			padding: ${space.md} ${space.sm} 2px;
			border-bottom: none;
			cursor: default;
			color: ${colors.muted} !important;
			font-size: ${fontSize.xs};
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
	`,
);

// A heading names the group under it; an item with a detail shows it as a second, smaller line
const menuItem = (item, choose) => {
	if (item.heading !== undefined) return { textContent: item.heading, role: 'presentation', addClass: 'heading' };

	const { detail, textContent, onPointerPress, ...rest } = item;

	return {
		...rest,
		...(detail === undefined
			? { textContent }
			: {
					append: [
						new Elem({ tag: 'span', addClass: 'label', textContent }),
						new Elem({ tag: 'span', addClass: 'detail', textContent: detail }),
					],
				}),
		onPointerPress: event => choose(onPointerPress, event),
	};
};

/**
 * A menu that opens at a point (a right-click, a long press) or under the button that asked for it.
 *
 * Choosing an item runs its onPointerPress and closes the menu, unless sticky. Escape and a press outside close it too,
 * and so does opening it again from the same button, so a button toggles its menu. It is placed by its own measured
 * size, so it flips away from the edges it would cross, and focus moves into it on opening and back on closing.
 * @param {object} [options] - ContextMenu configuration
 * @param {Array<object>} [options.items] - Menu items, e.g. { textContent, detail, onPointerPress }, and headings, { heading }
 * @param {boolean} [options.sticky] - Stay open after an item is chosen
 * @param {number} [options.maxWidth] - Widest the menu may be
 * @param {boolean} [options.reticle] - Mark the point a menu opened at; false leaves it unmarked
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {ContextMenu} ContextMenu component instance
 * @example
 * const menu = new ContextMenu({ items: [{ textContent: 'Rename', onPointerPress: rename }] });
 * card.on({ targetEvent: 'contextmenu', callback: event => { event.preventDefault(); menu.open({ x: event.clientX, y: event.clientY }); } });
 * moreButton.onPointerPress(() => menu.open({ anchor: moreButton }));
 */
class ContextMenu extends StyledPopover {
	static schema = {
		autoOpen: { default: false },
		outsideClose: { default: true },
		maxWidth: { default: 240 },
		sticky: { default: false },
		reticle: { default: true },
		items: {
			set(value) {
				if (!this.menu) this.menu = new Menu({ appendTo: this });

				this.menu.options.items = (value ?? []).map(item =>
					menuItem(item, (onPointerPress, event) => {
						onPointerPress?.(event);

						if (!this.options.sticky) this.close();
					}),
				);
			},
		},
	};

	build() {
		super.build();

		this._onKeydown = event => {
			if (event.key === 'Escape' && this.isOpen) {
				event.preventDefault();
				this.close();
			}
		};

		this.addCleanup('contextMenuKeys', () => document.removeEventListener('keydown', this._onKeydown));
		this.addCleanup('reticle', () => this._removeReticle());
	}

	/**
	 * Opens the menu at a point, or under an element; opening it again from the same element closes it.
	 * @param {object} [options] - Where to open
	 * @param {number} [options.x] - The point's x, in viewport pixels
	 * @param {number} [options.y] - The point's y, in viewport pixels
	 * @param {HTMLElement|Elem} [options.anchor] - The element to hang under, or over when there's more room above
	 */
	open({ x, y, anchor } = {}) {
		if (!this.elem.isConnected) return;

		const anchorElem = anchor?.elem ?? anchor;

		if (anchorElem && this.isOpen && this._anchor === anchorElem) {
			this.close();
			return;
		}

		this._setAnchor(anchorElem);
		this._opener = document.activeElement;

		// Measured from a clean slate, so a menu whose items changed isn't held to its last size
		this.elem.style.maxWidth = `${this.options.maxWidth}px`;
		this.elem.style.maxHeight = '';

		super.open();

		// Placed by what it measures now it is open, rather than by a guess at its rows
		this._removeReticle();

		if (anchorElem) this._placeUnder(anchorElem);
		else if (x !== undefined && y !== undefined) {
			if (this.options.reticle) {
				this._reticle = new Reticle({
					appendTo: document.body,
					style: { left: `${x - reticleWidth / 2}px`, top: `${y - reticleHeight / 2}px` },
				});
			}

			this.edgeAwarePlacement({
				x,
				y,
				maxWidth: Math.min(this.elem.offsetWidth || this.options.maxWidth, this.options.maxWidth),
				maxHeight: Math.min(this.elem.offsetHeight, window.innerHeight - 48),
			});
		}

		document.addEventListener('keydown', this._onKeydown);
		this.menu?.elem.querySelector('li:not([role="presentation"])')?.focus();
	}

	/**
	 * Closes the menu and hands focus back to where it was.
	 */
	close() {
		const wasOpen = this.isOpen;

		this._removeReticle();
		this._setAnchor(null);
		document.removeEventListener('keydown', this._onKeydown);
		super.close();

		if (wasOpen && this._opener?.isConnected) this._opener.focus();
		this._opener = null;
	}

	_removeReticle() {
		this._reticle?.elem.remove();
		this._reticle = null;
	}

	_setAnchor(anchor) {
		this._anchor?.setAttribute('aria-expanded', 'false');
		this._anchor = anchor ?? null;

		if (!anchor) return;

		anchor.setAttribute('aria-haspopup', 'menu');
		anchor.setAttribute('aria-expanded', 'true');
	}

	// Under the element, or over it when there's more room above; its left edge lined up, moved in from the viewport's
	_placeUnder(anchor) {
		const at = anchor.getBoundingClientRect();
		const viewportWidth = document.documentElement.clientWidth;
		const viewportHeight = window.innerHeight;
		const width = Math.min(this.elem.offsetWidth || this.options.maxWidth, this.options.maxWidth);
		const below = viewportHeight - at.bottom - ANCHOR_GAP - VIEWPORT_EDGE;
		const above = at.top - ANCHOR_GAP - VIEWPORT_EDGE;
		const downward = this.elem.offsetHeight <= below || below >= above;
		const height = Math.min(this.elem.offsetHeight, downward ? below : above);

		Object.assign(this.elem.style, {
			maxHeight: `${Math.max(downward ? below : above, 0)}px`,
			left: `${Math.max(VIEWPORT_EDGE, Math.min(at.left, viewportWidth - width - VIEWPORT_EDGE))}px`,
			top: `${downward ? at.bottom + ANCHOR_GAP : at.top - ANCHOR_GAP - height}px`,
			right: 'unset',
			bottom: 'unset',
		});
	}
}

export default ContextMenu;
