import { classSafeNanoid } from '../utils';
import theme from '../theme';

import { shimCSS } from './shimCSS';

/**
 * Overlay a Component base class with a set of configuration options
 * @param {object} BaseComponent - The base class to overlay
 * @param {object} options - The options to embed
 * @returns {object} The overlaid Component class
 */
export const configured = function (BaseComponent, options = {}) {
	return class ConfiguredComponent extends BaseComponent {
		constructor(overlayOptions = {}, ...children) {
			super({ ...options, ...overlayOptions }, ...children);
		}
	};
};

/**
 * Overlay a Component base class with a styles function
 * @param {object} BaseComponent - The base class to overlay
 * @param {Function} styles - The styles to embed
 * @param {object} options - The options to embed
 * @returns {object} The overlaid Component class
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

	const componentId = classSafeNanoid();

	shimCSS({ scope: `.${componentId}`, styles });

	return configured(BaseComponent, { ...options, addClass: [componentId, ...(options.addClass || [])] });
};
