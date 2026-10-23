import focusRing from './focus';
import { radius, space } from './tokens';

export default theme => {
	const { colors, fonts } = theme;

	return `
	display: inline-block;
	/* 32px tall at the page's size, from the line and the padding; a button with smaller text is smaller */
	line-height: 1.25;
	padding: ${space.sm} ${space.md};
	margin: 0;
	box-sizing: border-box;
	text-decoration: none;
	color: ${colors.white};
	background-color: ${colors.blue};
	border: none;
	border-radius: ${radius.md};
	text-align: center;
	position: relative;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: visible;
	cursor: pointer;
	touch-action: manipulation;
	transition: filter 0.15s, background-color 0.15s, color 0.15s;

	/* Lighter and darker by filter, so a button given a color of its own still answers the pointer */
	&:hover, &:focus-visible {
		filter: brightness(1.15);
	}

	&:focus-visible {
		${focusRing(theme)}
	}

	&:active, &.active, &.pressed {
		filter: brightness(0.88);
	}

	&.disabled, &:disabled {
		background-color: ${colors.dark(colors.gray)};
		color: ${colors.alpha(colors.white, 0.6)};
		cursor: no-drop;
		filter: none;
	}

	&.selected {
		box-shadow: 0 0 0 2px ${colors.light(colors.selected)};
	}

	&:before {
		${fonts.fontAwesomeSolid};

		position: relative;
		pointer-events: none;
		padding: 0 ${space.sm} 0 0;
	}

	/*
	 * An animated glyph turns about the center of its own box; even padding keeps it centered, and the same total
	 * width means starting an animation never shifts the label beside it.
	 */
	&[class*='icon-animation-']:before {
		padding: 0 ${space.xs};
	}

	&:empty, &.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;

		&:before {
			padding: 0;
		}
	}
`;
};

/**
 * The raised look: a bevel that sinks as it's pressed. Button's variant 'raised', over the default's colors and shape.
 * @param {object} theme - The theme
 * @param {object} theme.colors - Its colors
 * @returns {string} CSS
 */
export const raised = ({ colors }) => `
	padding: 4px 6px 6px 6px;
	border-radius: 0;
	filter: none;

	&:before {
		padding: 0 6px 0 3px;
	}

	&[class*='icon-animation-']:before {
		padding: 0 4.5px;
	}

	&:empty, &.icon {
		padding: 3px 0 8px 0;
	}

	&:after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(to right, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
			linear-gradient(to left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em),
			linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
			linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.2em, rgba(0, 0, 0, 0) 0.25em);
		pointer-events: none;
	}

	/*
	 * The nudge is a translate rather than top: it moves what's painted without moving the box, so a button placed by
	 * bottom stays under the finger for the whole press instead of jumping, and no click lands on what was behind it.
	 */
	&:hover, &:focus {
		filter: none;
		translate: 0 -1px;

		&:after {
			background-image: linear-gradient(
					to right,
					rgba(0, 0, 0, 0.3),
					rgba(0, 0, 0, 0.1) 0.05em,
					rgba(0, 0, 0, 0) 0.08em
				),
				linear-gradient(to left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em),
				linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
				linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.24em, rgba(0, 0, 0, 0) 0.28em);
		}
	}

	&:active,
	&.active,
	&.pressed,
	&.disabled,
	&:disabled {
		filter: none;
		translate: 0 1px;

		&:before {
			top: 1px;
		}

		&:after {
			background-image: linear-gradient(
					to right,
					rgba(0, 0, 0, 0.5),
					rgba(0, 0, 0, 0.3) 0.05em,
					rgba(0, 0, 0, 0.2) 0.08em
				),
				linear-gradient(to left, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em),
				linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 0.05em, rgba(0, 0, 0, 0) 0.08em),
				linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2) 0.08em, rgba(0, 0, 0, 0) 0.16em);
		}
	}

	&.pressed {
		box-shadow: 0 0 7px 3px rgba(0, 0, 0, 40%), inset 0 0 7px 3px rgba(0, 0, 0, 40%);
	}

	&.selected {
		box-shadow: none;
		outline: 2px dashed ${colors.red};
	}
`;
