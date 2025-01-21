import postcss from 'postcss';
import plugin_autoprefixer from 'autoprefixer';
import plugin_nested from 'postcss-nested';

/**
 * Process a piece of css text with postCSS
 * @param {string} styleText - CSS string
 * @returns {string} Processed CSS string
 */
export const postCSS = async styleText => {
	if (!styleText) return '';

	return (
		postcss([plugin_nested, plugin_autoprefixer])
			.process(styleText, { from: undefined })
			.then(({ css }) => css)
			// eslint-disable-next-line no-console
			.catch(process.env.NODE_ENV === 'development' ? console.error : () => {})
	);
};
