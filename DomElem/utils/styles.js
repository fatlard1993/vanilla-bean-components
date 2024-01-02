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
 */
export const appendStyles = css => {
	const style = document.createElement('style');

	style.innerHTML = css;

	document.head.append(style);
};

export const processStyles = async ({ styles = () => '', theme, context, scope }) =>
	postcss([plugin_nested, plugin_autoprefixer])
		.process(
			(process.env.NODE_ENV === 'development' ? x => x : removeExcessIndentation)(
				scope ? `${scope} { ${styles(theme, context)} }` : styles(theme, context),
			),
			{
				from: undefined,
			},
		)
		.then(({ css }) => css)
		// eslint-disable-next-line no-console
		.catch(process.env.NODE_ENV === 'development' ? console.error : () => {});
