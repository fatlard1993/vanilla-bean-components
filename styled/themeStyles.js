import theme from '../theme';

import { removeExcessIndentation } from '../utils/string';

/**
 * @typedef {object} StyleConfig
 * @property {Function} styles - Theme function that returns CSS string or style object
 * @property {string} [scope] - Optional CSS selector to wrap the styles
 */

/**
 * Process a theme function into CSS string with optional scoping
 * Handles both CSS string and style object returns from theme functions
 * @param {StyleConfig} styleConfig - Configuration with styles function and optional scope
 * @returns {string|object} Processed CSS string (scoped if specified) or style object for direct application
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
