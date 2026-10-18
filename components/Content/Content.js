import { styled } from '../../styled';
import { Component } from '../../Component';

const length = value => (typeof value === 'number' ? `${value}px` : value);

/**
 * The part of a view that scrolls: it takes the room a toolbar or header leaves and scrolls what doesn't fit, so the
 * page around it stays put.
 * @param {object} [options={}] - Content configuration
 * @param {number|string} [options.padding=0] - Inner padding (a number is pixels)
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
	`,
) {
	static schema = {
		padding: {
			default: 0,
			set(value) {
				this.elem.style.padding = length(value);
			},
		},
	};
}

export default Content;
