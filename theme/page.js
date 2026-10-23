import _button, { raised } from './button';
import { bareCode, codeFonts, highlightedCode } from './code';
import colors from './colors';
import focusRing from './focus';
import fonts from './fonts';
import _input, { number, checkbox } from './input';
import _scrollbar from './scrollbar';
import _table from './table';
import { fontSize, intents, radius, space } from './tokens';

export default theme => `
	html {
		height: 100%;
		color-scheme: ${colors.black.isDark() ? 'dark' : 'light'};
		font-size: 16px;
		${fonts.kodeMono}
	}

	body {
		display: flex;
		position: relative;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
		line-height: normal;
		tab-size: 2;
		background: ${colors.black};
		color: ${colors.white};
		margin: 0;
	}

	/* Whatever takes keyboard focus shows the one ring, at no specificity, so an app's own focus style still wins */
	:where(:focus-visible) {
		${focusRing(theme)}
	}

	/* Asked for less motion, nothing slides, spins or fades: it is simply there */
	@media (prefers-reduced-motion: reduce) {
		*, *::before, *::after, ::backdrop {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			scroll-behavior: auto !important;
		}
	}

	::selection {
		background: ${colors.lighter(colors.selected)};
		color: ${colors.black};
	}

	* {
		touch-action: manipulation;
		-webkit-text-size-adjust: none;
	}

	/* The page's font is inherited, so content that sets its own (a terminal, an embedded editor) keeps it. These are
	   the elements the browser gives a font or size of their own. */
	:where(h1, h2, h3, h4, h5, h6, small, big, code, kbd, pre, samp, tt, var, button, input, select, textarea, optgroup, option, legend) {
		font-family: inherit;
		font-size: inherit;
	}

	:where(sub, sup) {
		font-size: smaller;
	}

	#app {
		width: 100%;
		height: 100%;
	}

	@viewport {
		width: device-width;
		zoom: 1;
		min-zoom: 1;
		max-zoom: 1;
	}

	${codeFonts(theme)}

	${highlightedCode(theme)}

	${_scrollbar(theme)}

	a.variant-button { ${_button(theme)} }

	/* The bare a:visited is as specific as a.variant-button, so a visited link drawn as a button keeps its text by this */
	a.variant-button:visited:not(.disabled, .variant-flat, .variant-chip) {
		color: ${theme.colors.white};
	}

	/*
	 * The library's own components keep their look when the page's element styles are off. :where() gives these rules no
	 * specificity, so any rule an app writes still wins.
	 */
	:where(.vbc-button) { ${_button(theme)} }
	:where(.vbc-input) { ${_input(theme)} }
	${number(theme, ":where(.vbc-input[type='number'])")}
	${checkbox(theme, ":where(.vbc-input[type='checkbox'])")}
	:where(.vbc-table) { ${_table(theme)} }

	/* A tab's panel the app lays out as flex or grid still hides when its tab isn't the selected one */
	.vbc-tabpanel[hidden] {
		display: none !important;
	}

	/* A Button with no fill: for toolbars, menus and icon buttons. A Link drawn so outweighs the page's a:visited */
	.vbc-button:where(.variant-flat), a.variant-button.variant-flat {
		background-color: transparent;
		color: inherit;
		filter: none;

		&:hover, &:focus-visible {
			background-color: ${colors.alpha(colors.white, 0.08)};
		}

		&:active {
			background-color: ${colors.alpha(colors.white, 0.14)};
		}

		&.active, &.selected, &.pressed, &[aria-pressed='true'] {
			background-color: ${colors.alpha(colors.selected, 0.2)};
			color: ${colors.light(colors.selected)};
		}

		&:disabled, &.disabled {
			background-color: transparent;
			color: ${colors.gray};
		}
	}

	/* A small outlined pill: a filter, a choice among a few, a tag that does something */
	.vbc-button:where(.variant-chip), a.variant-button.variant-chip {
		padding: calc(${space.xs} - 1px) calc(${space.md} - 1px);
		border: 1px solid ${colors.border};
		border-radius: ${radius.pill};
		background-color: transparent;
		color: ${colors.muted};
		font-size: ${fontSize.sm};
		filter: none;

		&:hover, &:focus-visible {
			color: ${colors.white};
			border-color: ${colors.alpha(colors.white, 0.3)};
		}

		&.active, &.selected, &.pressed, &[aria-pressed='true'] {
			border-color: ${colors.light(colors.selected)};
			background-color: ${colors.alpha(colors.selected, 0.25)};
			color: ${colors.white};
		}

		&:disabled, &.disabled {
			background-color: transparent;
			color: ${colors.gray};
		}
	}

	/* The bevelled look that sinks as it's pressed */
	.vbc-button:where(.variant-raised), a.variant-button:where(.variant-raised) { ${raised(theme)} }

	/* A button that says what pressing it does: filled in its status role, or, flat or a chip, written in it */
	${intents
		.map(
			intent => `
	.vbc-button:where(.intent-${intent}):where(:not(.variant-flat, .variant-chip, .disabled, :disabled)) {
		background-color: ${colors[intent]};
		color: ${colors.mostReadable(colors[intent], [colors.white, colors.black])};
	}

	.vbc-button:where(.intent-${intent}):where(.variant-flat, .variant-chip):where(:not(.disabled, :disabled)) {
		color: ${colors.light(colors[intent])};
	}

	.vbc-button:where(.intent-${intent}.variant-chip) {
		border-color: ${colors.alpha(colors.light(colors[intent]), 0.5)};
	}`,
		)
		.join('\n')}

	/* Rendered markdown: headings marked with their level, in the document green */
	.vbc-markdown {
		:where(h1, h2, h3, h4, h5, h6) {
			color: ${colors.green};

			&:before {
				margin-right: ${space.xs};
				font-size: ${fontSize.xs};
				opacity: 0.7;
			}
		}

		/* A table wider than the screen scrolls inside itself rather than stretching the page */
		:where(table) {
			display: block;
			max-width: 100%;
			overflow-x: auto;
		}

		:where(h1):before { content: "#"; }
		:where(h2):before { content: "##"; }
		:where(h3):before { content: "###"; }
		:where(h4):before { content: "####"; }
		:where(h5):before { content: "#####"; }
		:where(h6):before { content: "######"; }
	}

	/* Bare elements styled inside one container (rendered markdown, say) while the page leaves them to the app */
	:where(.vbc-elements) {
${elements(theme).replace(/^(?=.)/gm, '\t')}
	}

	.fa-support:before {
		${fonts.fontAwesomeSolid}
		content: var(--fa);
	}

	/*
	 * Icon's iconAnimation option. FontAwesome's own animation classes animate the element that
	 * carries them, which is what you want on a bare Icon and not what you want on anything that
	 * also renders a label — Button and Link extend Icon, so an fa animation there spins the
	 * control, background and text included. These aim the same animations at the :before that
	 * draws the glyph, reusing FontAwesome's keyframes and honoring the same --fa-animation-*
	 * overrides, so a caller can animate the glyph and the element independently.
	 */
	[class*='icon-animation-']:before {
		animation-delay: var(--fa-animation-delay, 0s);
		animation-direction: var(--fa-animation-direction, normal);
		animation-iteration-count: var(--fa-animation-iteration-count, infinite);
	}

	.icon-animation-spin:before {
		animation-name: fa-spin;
		animation-duration: var(--fa-animation-duration, 2s);
		animation-timing-function: var(--fa-animation-timing, linear);
	}

	.icon-animation-spin-pulse:before {
		animation-name: fa-spin;
		animation-duration: var(--fa-animation-duration, 1s);
		animation-timing-function: var(--fa-animation-timing, steps(8));
	}

	.icon-animation-beat:before {
		animation-name: fa-beat;
		animation-duration: var(--fa-animation-duration, 1s);
		animation-timing-function: var(--fa-animation-timing, ease-in-out);
	}

	.icon-animation-fade:before {
		animation-name: fa-fade;
		animation-duration: var(--fa-animation-duration, 1s);
		animation-timing-function: var(--fa-animation-timing, ease-in-out);
	}

	.icon-animation-beat-fade:before {
		animation-name: fa-beat-fade;
		animation-duration: var(--fa-animation-duration, 1s);
		animation-timing-function: var(--fa-animation-timing, ease-in-out);
	}

	.icon-animation-bounce:before {
		animation-name: fa-bounce;
		animation-duration: var(--fa-animation-duration, 1s);
		animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
	}

	.icon-animation-flip:before {
		animation-name: fa-flip;
		animation-duration: var(--fa-animation-duration, 1.5s);
		animation-timing-function: var(--fa-animation-timing, ease-in-out);
	}

	.icon-animation-shake:before {
		animation-name: fa-shake;
		animation-duration: var(--fa-animation-duration, 0.75s);
		animation-timing-function: var(--fa-animation-timing, ease-in-out);
	}
`;

/**
 * What the page gives bare elements: headings, links, code, form fields, buttons, tables and quotes. Page's themeElements
 * option turns these off for an app that styles its own elements; the library's components keep their look either way.
 * @param {object} theme - The theme
 * @returns {string} CSS
 */
export const elements = theme => `
	h1, h2, h3, h4, h5, h6 {
		color: ${colors.white};
		font-weight: 600;
		line-height: 1.25;
	}

	h1 {
		font-size: ${fontSize.xxl};

		&:first-child {
			margin-top: 0;
		}
	}

	h2 {
		font-size: ${fontSize.xl};
	}

	h3 {
		font-size: ${fontSize.lg};
	}

	h4, h5, h6 {
		font-size: ${fontSize.md};
	}

	a {
		color: ${colors.light(colors.blue)};

		&:visited {
			color: ${colors.light(colors.purple)};
		}

		&.disabled {
			pointer-events: none;

			&:hover .tooltip {
				display: none;
			}
		}
	}

	${bareCode(theme)}

	input, select, textarea { ${_input(theme)} }
	${number(theme)}
	${checkbox(theme)}

	button { ${_button(theme)} }

	kbd {
		padding: 1px ${space.sm};
		border-radius: ${radius.sm};
		border-bottom: 2px solid ${colors.darker(colors.gray)};
		background-color: ${colors.dark(colors.gray)};
		color: ${colors.white};
		font-size: ${fontSize.sm};
	}

	table { ${_table(theme)} }

	blockquote {
		background-color: ${colors.white.setAlpha(0.06)};
    border-left: 6px solid ${colors.white.setAlpha(0.06)};
    margin: 0;
    padding: 1px ${space.md};

		&.NOTE {
			background-color: ${colors.alpha(colors.info, 0.09)};
			border-color: ${colors.alpha(colors.info, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.info)};
			}
		}

		&.TIP {
			background-color: ${colors.alpha(colors.success, 0.09)};
			border-color: ${colors.alpha(colors.success, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.success)};
			}
		}

		&.IMPORTANT {
			background-color: ${colors.alpha(colors.purple, 0.09)};
			border-color: ${colors.alpha(colors.purple, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.purple)};
			}
		}

		&.WARNING {
			background-color: ${colors.alpha(colors.warning, 0.09)};
			border-color: ${colors.alpha(colors.warning, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.warning)};
			}
		}

		&.CAUTION {
			background-color: ${colors.alpha(colors.danger, 0.09)};
			border-color: ${colors.alpha(colors.danger, 0.3)};

			p:first-child {
				font-weight: bold;
				color: ${colors.lighter(colors.danger)};
			}
		}
	}
`;
