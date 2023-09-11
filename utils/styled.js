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
					styles: theme => `
					${styles(theme)}

					${overlayStyles(theme)}
				`,
					...options,
					...overlayOptions,
				},
				...children,
			);
		}
	};
};
