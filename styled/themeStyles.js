import theme from '../theme';

import { removeExcessIndentation } from '../utils/string';

/** @typedef {{ styles: () => string, scope: string }} StyleConfig */

/**
 * Process a css decorator function, hydrating with theme and wrapping in optional scope
 * @param {StyleConfig} styleConfig - The style function and scope to generate the css string
 * @returns {string} Processed CSS string
 */
export const themeStyles = ({ styles = () => '', scope }) => {
	const themedStyles = styles(theme);

	if (typeof themedStyles === 'object') return themedStyles;
	if (!/\S/.test(themedStyles)) return '';

	const scopedStyleText = (process.env.NODE_ENV === 'development' ? x => x : removeExcessIndentation)(
		scope ? `${scope} { ${themedStyles} }` : themedStyles,
	);

	return scopedStyleText;
};
