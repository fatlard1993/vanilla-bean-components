import { classSafeNanoid } from '../utils';
import theme from '../theme';

import { shimCSS } from './shimCSS';

/**
 * Create a Component class with embedded configuration options (no styling)
 * @param {typeof import('../Component')} BaseComponent - The component class to extend
 * @param {object} options - Default options to merge into all instances
 * @returns {typeof import('../Component')} Extended component class with embedded options
 */
export const configured = function (BaseComponent, options = {}) {
	return class ConfiguredComponent extends BaseComponent {
		constructor(overlayOptions = {}, ...children) {
			super({ ...options, ...overlayOptions }, ...children);

			this.addClass(options.addClass, overlayOptions.addClass);
		}
	};
};

/**
 * Create a Component class with scoped styles and optional configuration
 * Generates unique class identifier and processes styles through complete pipeline
 * @param {typeof import('../Component')} BaseComponent - The component class to extend
 * @param {Function} styles - Theme function returning CSS string, or template literal
 * @param {object} [options] - Default options to embed in component instances
 * @returns {typeof import('../Component')} Extended component class with scoped styling
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

	return configured(BaseComponent, { ...options, addClass: [componentId].concat(options.addClass) });
};
