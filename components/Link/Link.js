import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'a', variant: 'link', tooltip: { icon: 'link', style: { fontSize: '12px' } } };
const variant_enum = Object.freeze(['link', 'button']);

/**
 * Link component with tooltip support and display variants.
 *
 * Extends TooltipWrapper to provide enhanced anchor elements with automatic tooltip icons
 * and configurable styling variants for different use cases.
 * @param {object} [options={}] - Link configuration options
 * @param {string} [options.tag='a'] - HTML tag, defaults to anchor element
 * @param {string} [options.variant='link'] - Link display variant ('link', 'button')
 * @param {string} [options.href] - URL to link to
 * @param {string} [options.target] - Link target attribute
 * @param {string} [options.textContent] - Link text content
 * @param {object|string} [options.tooltip] - Tooltip configuration or text
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Link} Link component instance
 */
class Link extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	variant_enum = variant_enum;

	constructor(options = {}, ...children) {
		super({ ...defaultOptions, ...options }, ...children);
	}

	_setOption(key, value) {
		if (key === 'variant') {
			this.removeClass(/\bvariant-\S+\b/g);
			this.addClass(`variant-${value}`);
		} else super._setOption(key, value);
	}
}

export default Link;
