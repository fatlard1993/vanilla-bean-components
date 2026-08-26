import { TooltipWrapper } from '../TooltipWrapper';

/** The decoration every Link tooltip carries, merged onto whatever the caller passed. */
const linkTooltip = { icon: 'link', style: { fontSize: '12px' } };

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
			// One source for the decoration, read by both the default and the merge below; it used to
			// be spelled out twice, once here and once inline in `set()`.
			//
			// The `default` has to stay. Replacing its *contents* with null changes no rendered
			// tooltip -- `set()` supplies the decoration either way -- but removing the descriptor
			// entirely means `set()` never runs for a Link that was given no tooltip, and the link
			// decoration disappears. What the default provides is the presence of a value to set,
			// not the value itself.
			get default() {
				return linkTooltip;
			},
			// Merge the decoration onto the caller's value so a plain string tooltip still gets the
			// link icon, not just the object form. `next` continues the schema chain to
			// TooltipWrapper's own tooltip set(), which expects an object or a string.
			set(value, next) {
				next(typeof value === 'object' ? { ...linkTooltip, ...value } : { ...linkTooltip, textContent: value });
			},
		},
	};
}

export default Link;
