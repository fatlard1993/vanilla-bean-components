import { styled } from '../../styled';
import { Popover } from '../Popover';
import { duration, radius, space } from '../../theme/tokens';

const StyledPopover = styled(
	Popover,
	({ colors }) => `
		padding: ${space.xs};
		pointer-events: none;
		max-width: 240px;
		margin: auto;
		/* Inverted, so a hint reads apart from the surfaces it floats over */
		background-color: ${colors.white};
		border-color: ${colors.white};
		border-radius: ${radius.sm};
		color: ${colors.black};
		opacity: 0;
		transform: scaleX(0);
		transition: opacity ${duration.base}, transform ${duration.fast}, overlay ${duration.base} allow-discrete, display ${duration.base} allow-discrete;
		text-indent: 0;
		white-space: normal;
		text-align: start;

		&:popover-open {
			opacity: 1;
			transform: scaleX(1);
			transition: overlay ${duration.base} allow-discrete, display ${duration.base} allow-discrete, opacity ${duration.base}, transform ${duration.base};
		}

		@starting-style {
			&:popover-open {
				opacity: 0;
				transform: scaleX(-1);
			}
		}

		&:before {
			padding: 0 ${space.sm} 0 ${space.xs};
		}

		&:empty:before {
			padding: 0;
		}
	`,
);

// How far a tooltip sits from the edge it is placed against, and how far a corner one overlaps the corner
const GAP = 2;
const CORNER_OVERLAP = 9;
// Kept this far inside the viewport
const EDGE = 4;

const POSITIONS = Object.freeze([
	'center',
	'top',
	'bottom',
	'left',
	'right',
	'topLeft',
	'topRight',
	'bottomLeft',
	'bottomRight',
]);

/**
 * Tooltip popover component with configurable positioning and smooth animations.
 *
 * Extends Popover to provide tooltip-specific styling and positioning options.
 * Supports multiple position presets and animated open/close transitions.
 * @param {object} [options={}] - Tooltip configuration options
 * @param {('center'|'top'|'bottom'|'left'|'right'|'topLeft'|'topRight'|'bottomLeft'|'bottomRight')} [options.position='topRight'] - Where
 *   it sits against the element it explains (its parent), when opened with no point of its own
 * @param {boolean|number} [options.autoOpen=false] - Open a moment after it's added to the page, as a Popover does
 * @param {string} [options.textContent] - Tooltip text content
 * @param {string} [options.icon] - Icon to display in tooltip
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Tooltip} Tooltip component instance
 */
class Tooltip extends StyledPopover {
	static schema = {
		autoOpen: { default: false },
		position: {
			default: 'topRight',
			enum: POSITIONS,
			set(value) {
				this.removeClass(...POSITIONS);
				this.addClass(value);
			},
		},
	};

	static prepareOptions(options) {
		return { ...options, addClass: ['tooltip'].concat(options.addClass) };
	}

	/**
	 * Opens the tooltip: at a point when given one, otherwise at its `position` against the element it explains.
	 * @param {object} [options] - A point to place it at: { x, y }
	 */
	open(options) {
		super.open(options);

		if (this.isOpen && (options?.x === undefined || options?.y === undefined)) this._placeByPosition();
	}

	edgeAwarePlacement(options) {
		super.edgeAwarePlacement(options);

		this.elem.style.maxHeight = 'none';
	}

	// In the top layer nothing is placed by its parent's box, so the preset is measured out here: from the parent's
	// rect in viewport coordinates (the tooltip is fixed, so a scrolled page carries nothing off), once shown, so its
	// own size is known, and kept on the screen
	_placeByPosition() {
		const anchor = this.elem.parentElement;

		if (!anchor) return;

		const { left, top, right, bottom, width, height } = anchor.getBoundingClientRect();
		const { offsetWidth: w, offsetHeight: h } = this.elem;
		const centerX = left + width / 2 - w / 2;
		const centerY = top + height / 2 - h / 2;
		const [x, y] = {
			center: [centerX, centerY],
			top: [centerX, top - GAP - h],
			bottom: [centerX, bottom + GAP],
			left: [left - GAP - w, centerY],
			right: [right + GAP, centerY],
			topLeft: [left + CORNER_OVERLAP - w, top + CORNER_OVERLAP - h],
			topRight: [right - CORNER_OVERLAP, top + CORNER_OVERLAP - h],
			bottomLeft: [left + CORNER_OVERLAP - w, bottom - CORNER_OVERLAP],
			bottomRight: [right - CORNER_OVERLAP, bottom - CORNER_OVERLAP],
		}[this.options.position];
		// The viewport without its scrollbars; a document not laid out (a test) has no client size, the window still has
		const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
		const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
		const within = (value, max) => Math.max(EDGE, Math.min(value, max - EDGE));

		this.elem.style.left = `${within(x, viewportWidth - w)}px`;
		this.elem.style.top = `${within(y, viewportHeight - h)}px`;
		this.elem.style.right = 'unset';
		this.elem.style.bottom = 'unset';
		this.elem.style.maxHeight = 'none';
	}
}

export default Tooltip;
