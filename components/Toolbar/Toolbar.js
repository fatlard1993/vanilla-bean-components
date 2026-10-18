import { styled } from '../../styled';
import { Component } from '../../Component';

const length = value => (typeof value === 'number' ? `${value}px` : value);

/**
 * A row of controls: buttons, a search field, filters. It wraps onto more lines when it runs out of room, unless told
 * not to.
 * @param {object} [options={}] - Toolbar configuration
 * @param {number|string} [options.gap=12] - Space between controls (a number is pixels)
 * @param {boolean} [options.wrap=true] - Wrap onto more lines when there isn't room
 * @param {...(Component|HTMLElement|string)} children - The controls
 * @returns {Toolbar} Toolbar component instance
 * @example new Toolbar({ append: [new Button({ textContent: 'Add' }), new Input({ placeholder: 'Search' })] })
 */
class Toolbar extends styled(
	Component,
	() => `
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
		margin: 12px;
	`,
) {
	static schema = {
		gap: {
			default: 12,
			set(value) {
				this.elem.style.gap = length(value);
			},
		},
		wrap: {
			default: true,
			set(value) {
				this.elem.style.flexWrap = value ? 'wrap' : 'nowrap';
			},
		},
	};
}

export default Toolbar;
