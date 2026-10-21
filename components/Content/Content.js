import { styled } from '../../styled';
import { Component } from '../../Component';

const length = value => (typeof value === 'number' ? `${value}px` : value);

/**
 * The part of a view that scrolls: it takes the room a toolbar or header leaves and scrolls what doesn't fit, so the
 * page around it stays put.
 * @param {object} [options={}] - Content configuration
 * @param {number|string} [options.padding] - Inner padding (a number is pixels); unset, a subclass's own CSS padding applies
 * @param {boolean|number|string} [options.column] - Keep what scrolls to a centered column, for reading on a wide
 *   screen: true is 960px wide, or give the width (a number is pixels). The sides keep at least a 12px gutter.
 * @param {...(Component|HTMLElement|string)} children - What scrolls
 * @returns {Content} Content component instance
 * @example new Content({ padding: '0 12px', append: list })
 */
class Content extends styled(
	Component,
	() => `
		flex: 1;
		min-height: 0;
		margin: 0 0 6px;
		overflow: auto;

		/* The column is the container's own side padding, so what's in it keeps its margins and stretches to fill */
		&.column {
			padding-inline: max(var(--content-gutter, 12px), (100% - var(--content-column, 960px)) / 2);
		}
	`,
) {
	static schema = {
		padding: {
			set(value) {
				if (value === undefined || value === null) this.elem.style.removeProperty('padding');
				else this.elem.style.padding = length(value);
			},
		},
		column: {
			set(value) {
				this.toggleClass('column', !!value);

				if (value && value !== true) this.elem.style.setProperty('--content-column', length(value));
				else this.elem.style.removeProperty('--content-column');
			},
		},
	};
}

export default Content;
