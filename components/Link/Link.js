import { TooltipWrapper } from '../TooltipWrapper';

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
	static schema = {
		tag: { default: 'a' },
		variant: {
			default: 'link',
			enum: ['link', 'button'],
			set(value) {
				this.removeClass(/\bvariant-\S+\b/g);
				this.addClass(`variant-${value}`);
			},
		},
		tooltip: {
			get default() {
				return { icon: 'link', style: { fontSize: '12px' } };
			},
		},
	};
}

export default Link;
