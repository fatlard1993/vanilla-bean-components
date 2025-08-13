import postcss from 'postcss';
import plugin_autoprefixer from 'autoprefixer';
import plugin_nested from 'postcss-nested';

/**
 * Process CSS through the PostCSS pipeline with autoprefixer and nested syntax support
 * @param {string} styleText - Raw CSS string to process
 * @returns {Promise<string>} Promise resolving to processed CSS string (empty string on error)
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
