import { classSafeNanoid } from '../utils';
import theme from '../theme';

import { shimCSS } from './shimCSS';

/**
 * Creates Component class with embedded configuration options (no styling applied).
 * @param {typeof import('../Component').default} BaseComponent - Component class to extend
 * @param {object} options - Default options merged into all component instances
 * @returns {typeof import('../Component').default} Extended component class with embedded options
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
 * Creates Component class with scoped styles and optional configuration.
 *
 * Generates unique class identifier, processes styles through the theme system,
 * and injects as scoped CSS. Supports both function syntax and template literal syntax.
 * @param {typeof import('../Component').default} BaseComponent - Component class to extend
 * @param {Function|TemplateStringsArray} [styles] - Theme function returning CSS string, or template literal strings array
 * @param {object} [options] - Default options embedded in component instances
 * @returns {typeof import('../Component').default|Function} Extended component class with scoped styling, or template literal function
 */
export const styled = function (BaseComponent, styles = () => '', options = {}) {
	const isTagFunction = Array.isArray(styles) && styles.raw;

	if (arguments.length === 1 && typeof BaseComponent === 'function') {
		const tagFunction = function (templateLiteral, ...interpolations) {
			if (Array.isArray(templateLiteral) && templateLiteral.raw) {
				const styleText = templateLiteral
					.flatMap((string, index) => {
						if (index === 0) return string;

						const interpolation = interpolations[index - 1];

						return [typeof interpolation === 'function' ? interpolation(theme) : interpolation, string];
					})
					.join('');

				const componentId = classSafeNanoid();

				shimCSS({ scope: `.${componentId}`, styles: () => styleText });

				return configured(BaseComponent, { addClass: [componentId] });
			}

			return styled(BaseComponent, templateLiteral, ...interpolations);
		};

		const componentId = classSafeNanoid();

		const StyledComponent = configured(BaseComponent, { addClass: [componentId] });

		Object.setPrototypeOf(tagFunction, StyledComponent.prototype);
		tagFunction.prototype = StyledComponent.prototype;

		return new Proxy(tagFunction, {
			construct(target, args) {
				return new StyledComponent(...args);
			},
		});
	}

	if (isTagFunction) {
		const [, , ...args] = arguments;
		const styleText = styles
			.flatMap((string, index) => {
				if (index === 0) return string;
				return [typeof args[index - 1] === 'function' ? args[index - 1](theme) : args[index - 1], string];
			})
			.join('');

		styles = () => styleText;

		options = {};
	}

	const componentId = classSafeNanoid();

	shimCSS({ scope: `.${componentId}`, styles });

	return configured(BaseComponent, { ...options, addClass: [componentId].concat(options.addClass || []) });
};
