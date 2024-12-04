import postcss from 'postcss';
import plugin_autoprefixer from 'autoprefixer';
import plugin_nested from 'postcss-nested';
import { removeExcessIndentation } from './string';

/**
 * Overlay a DomElem base class with a styles function
 * @param {Class} domElem - The DomElem base class to overlay
 * @param {Function} styles - The styles to embed
 * @return {Class} The overlaid DomElem class
 */
export const styled = (domElem, styles = () => '', options) => {
	return class StyledElem extends domElem {
		constructor({ styles: overlayStyles = () => '', ...overlayOptions } = {}, ...children) {
			super(
				{
					styles: (...args) => `
						${styles(...args)}

						${overlayStyles(...args)}
					`,
					...options,
					...overlayOptions,
				},
				...children,
			);
		}
	};
};

/**
 * Append a style tag with custom css onto the page at runtime
 * @param {String} css - The css string to inject into the page
 * @param {String} [id] - An optional id to attach to the style tag
 * @returns {HTMLStyleElement} The created style tag
 */
export const appendStyles = (css, id) => {
	const style = document.createElement('style');

	style.innerHTML = css;
	if (id) style.id = id;

	document.head.append(style);

	return style;
};

export const processStyles = async ({ styles = () => '', theme, context, scope }) => {
	const styleText = styles(theme, context);

	if (!/\S/.test(styleText)) return;

	return (
		postcss([plugin_nested, plugin_autoprefixer])
			.process(
				(process.env.NODE_ENV === 'development' ? x => x : removeExcessIndentation)(
					scope ? `${scope} { ${styleText} }` : styleText,
				),
				{
					from: undefined,
				},
			)
			.then(({ css }) => css)
			// eslint-disable-next-line no-console
			.catch(process.env.NODE_ENV === 'development' ? console.error : () => {})
	);
};

export const applyStyles = async ({ styles, theme, context, scope }) =>
	processStyles({ styles, theme, context, scope }).then(css => appendStyles(css));
