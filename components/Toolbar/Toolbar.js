import { styled } from '../../styled';
import { Component, classEnum } from '../../Component';
import { cssLength } from '../../utils';

/**
 * A row of controls: buttons, a search field, filters. It wraps onto more lines when it runs out of room, unless told
 * not to. Given a heading it's a page's header: the title takes the room the controls leave, and anything with the
 * class `start` (a back button) sits before it.
 * @param {object} [options={}] - Toolbar configuration
 * @param {number|string} [options.gap=12] - Space between controls (a number is pixels)
 * @param {boolean} [options.wrap=true] - Wrap onto more lines when there isn't room
 * @param {string} [options.heading] - A title at the start, truncated to fit; it stays through empty()
 * @param {('bar')} [options.variant] - 'bar' is a page's top bar: flush, on a surface, ruled off from what's below
 * @param {...(Component|HTMLElement|string)} children - The controls
 * @returns {Toolbar} Toolbar component instance
 * @example new Toolbar({ append: [new Button({ textContent: 'Add' }), new Input({ placeholder: 'Search' })] })
 * @example new Toolbar({ variant: 'bar', heading: 'Fields', append: new Button({ icon: 'plus' }) })
 */
class Toolbar extends styled(
	Component,
	({ colors, fontSize, safeArea, space }) => `
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
		margin: ${space.md};

		& > .heading {
			flex: 1 1 auto;
			min-width: 0;
			font-size: ${fontSize.lg};
			font-weight: 600;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		& > .start {
			order: -1;
		}

		&.variant-bar {
			flex-shrink: 0;
			box-sizing: border-box;
			min-height: 48px;
			margin: 0;
			/* At the top of the screen, it reaches under a phone's notch and keeps its contents clear of it */
			padding: calc(${space.sm} + ${safeArea.top}) calc(${space.md} + ${safeArea.right}) ${space.sm}
				calc(${space.md} + ${safeArea.left});
			background-color: ${colors.surface};
			border-bottom: 1px solid ${colors.border};
		}
	`,
) {
	static schema = {
		gap: {
			default: 12,
			set(value) {
				this.elem.style.gap = cssLength(value);
			},
		},
		wrap: {
			default: true,
			set(value) {
				this.elem.style.flexWrap = value ? 'wrap' : 'nowrap';
			},
		},
		heading: {
			set(value) {
				if (value === undefined || value === null || value === '') {
					this._heading?.elem.remove();
					this._heading = null;

					return;
				}

				this._heading ??= new Component({ addClass: 'heading', attributes: { role: 'heading', 'aria-level': '1' } });
				this._heading.options.textContent = value;
				// Truncated, the whole of it is still a hover away
				this._heading.elem.title = value;

				if (this._heading.elem.parentElement !== this.elem) this.elem.prepend(this._heading.elem);
			},
		},
		variant: classEnum('variant', ['bar']),
	};

	/**
	 * Removes the controls, keeping the heading.
	 * @returns {Toolbar} The toolbar
	 */
	empty() {
		super.empty();

		if (this._heading) this.elem.prepend(this._heading.elem);

		return this;
	}
}

export default Toolbar;
