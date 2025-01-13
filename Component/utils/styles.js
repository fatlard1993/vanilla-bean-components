import postcss from 'postcss';
import plugin_autoprefixer from 'autoprefixer';
import plugin_nested from 'postcss-nested';

import rootContext from '../../rootContext';
import theme from '../../theme';

import Component, { createClassId } from '../Component';

import { removeExcessIndentation } from './string';

/**
 * Overlay a Component base class with a styles function
 * @param {Class} BaseComponent - The base class to overlay
 * @param {Function} styles - The styles to embed
 * @param {object} options - The options to embed
 * @return {Class} The overlaid Component class
 */
export const styled = function (BaseComponent, styles = () => '', options = {}) {
	const isTagFunction = Array.isArray(styles) && styles.raw;

	if (isTagFunction) {
		const [, ...args] = arguments;
		const styleText = styles
			.flatMap((string, index) => {
				if (index === 0) return string;
				return [typeof args[index] === 'function' ? args[index](theme) : args[index], string];
			})
			.join('');

		styles = () => styleText;

		options = {};
	}

	const componentId = createClassId();

	shimCSS({ scope: `.${componentId}`, styles });

	return class StyledComponent extends BaseComponent {
		constructor(overlayOptions = {}, ...children) {
			super(
				{
					...options,
					...overlayOptions,
					addClass: [componentId, ...(options.addClass || []), ...(overlayOptions.addClass || [])],
				},
				...children,
			);
		}
	};
};

styled.Component = (...args) => styled(Component, ...args);

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

export const themeStyles = ({ styles = () => '', scope }) => {
	const themedStyles = styles(theme);

	if (typeof themedStyles === 'object') return themedStyles;
	if (!/\S/.test(themedStyles)) return '';

	const scopedStyleText = (process.env.NODE_ENV === 'development' ? x => x : removeExcessIndentation)(
		scope ? `${scope} { ${themedStyles} }` : themedStyles,
	);

	return scopedStyleText;
};

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

export const shimCSS = styleConfig => {
	if (document.readyState === 'complete') return postCSS(themeStyles(styleConfig)).then(css => appendStyles(css));
	else {
		rootContext.onLoadStyleQueue = rootContext.onLoadStyleQueue || [];
		rootContext.onLoadCSS = rootContext.onLoadCSS || '';

		rootContext.onLoadStyleQueue.push(styleConfig);

		if (!rootContext.onLoadStyleListener) {
			rootContext.onLoadStyleListener = async () => {
				const styleText = rootContext.onLoadStyleQueue.map(themeStyles).join('\n');
				const processedCSS = await postCSS(styleText);

				appendStyles(processedCSS);
			};

			window.addEventListener('load', rootContext.onLoadStyleListener);
		}
	}
};
