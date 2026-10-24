import { Component } from '../../Component';
import { styled } from '../../styled';
import { Button } from '../Button';
import { Elem } from '../../Elem';

const StyledComponent = styled(
	Component,
	({ colors, focusRing, fontSize, radius, space }) => `
		padding: ${space.xs} ${space.sm};
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: ${space.xs};
		font-size: ${fontSize.sm};
		line-height: 1;
		background-color: ${colors.black};
		border: 1px solid ${colors.alpha(colors.teal, 0.35)};
		border-radius: ${radius.sm};
		white-space: nowrap;
		user-select: none;
		cursor: default;
		list-style: none;

		&:not(.readOnly):not(.add-tag):hover {
			border-color: ${colors.light(colors.teal)};
		}

		&:focus-visible {
			${focusRing()}
		}

		&.add-tag {
			padding: 0;
			border: none;
			background: none;
			gap: ${space.xs};
			cursor: text;
		}

		&:not(.add-tag) button {
			width: 14px !important;
			height: 14px !important;
			font-size: ${fontSize.xs};
			opacity: 0.4;
			flex-shrink: 0;
			background: transparent !important;

			&:after { display: none; }

			&:hover, &:focus {
				opacity: 0.9;
				background: transparent !important;
				top: -1px;
			}
		}
	`,
);

/**
 * A single tag chip within a TagList.
 *
 * Renders its text alongside a remove button, which calls onRemove (or, with none, destroys the tag). In read-only
 * mode the button is omitted and the chip is display-only.
 * @param {object} [options={}] - Tag configuration options
 * @param {string} [options.tag='li'] - HTML tag for the chip element
 * @param {number} [options.tabIndex=0] - Tab order for the chip
 * @param {boolean} [options.readOnly=false] - Omits the remove button and applies the readOnly class
 * @param {string} [options.textContent] - The tag's text; also mirrored onto the element as
 *   `data-value`, which TagList matches against its value
 * @param {Function} [options.onRemove] - Called when the remove button is pressed; its TagList takes the tag out of its value
 * @param {...(Component|HTMLElement|string)} children - Child elements to append
 * @returns {Tag} Tag component instance
 */
class Tag extends StyledComponent {
	static schema = {
		tag: { default: 'li' },
		tabIndex: { default: 0 },
		readOnly: {
			default: false,
			set(value) {
				this.toggleClass('readOnly', !!value);
			},
		},
		// Called by the remove button
		onRemove: {},
		textContent: {
			set(value) {
				this.elem.setAttribute('data-value', value);
				this._textSpan.elem.textContent = value;
			},
		},
	};

	build() {
		this._textSpan = new Elem({ tag: 'span', appendTo: this });

		if (!this.options.readOnly) {
			new Button({
				icon: 'close',
				appendTo: this,
				onPointerPress: () => (this.options.onRemove ? this.options.onRemove(this) : this.destroy()),
			});
		}
	}
}

export default Tag;
