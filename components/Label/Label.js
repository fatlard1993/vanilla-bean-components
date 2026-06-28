import { styled } from '../../styled';
import { Component } from '../../Component';
import { TooltipWrapper } from '../TooltipWrapper';

const StyledLabel = styled(
	TooltipWrapper,
	({ colors, fonts }) => `
		position: relative;
		display: inline-block;
		font-size: 1em;
		width: calc(100% - 24px);
		margin: 0 0 6px;
		padding: 6px 12px 6px 12px;
		background-color: ${colors.white.setAlpha(0.04)};
		color: ${colors.white};
		transition: all 0.5s;

		&:after {
			transition: all 0.5s;
		}

		& label {
			display: block;
			margin: 0;
			color: ${colors.white};
			padding-left: 3px;
		}

		&.variant-overlay {
			& label {
				position: relative;
				z-index: 1;
				transform: translate(0, 0);
				transition: transform 0.5s, color 0.5s;
			}

			& input {
				transform: translate(0, 0);
				transition: transform 0.5s;
			}
		}

		&.variant-overlay:not(:focus-within):has(input:placeholder-shown) {
			& label {
				pointer-events: none;
				color: ${colors.gray};
				transform: translate(12px, 20px);
			}

			& input {
				transform: translate(0, -12px);
			}
		}

		&.variant-inline, &.variant-inline-after {
			display: flex;

			& label {
				display: inline-block;
				vertical-align: top;
				margin-top: 5px;
				margin-right: 9px;
				line-height: 2;
			}

			& input:not([type=checkbox]), & textarea, & select {
				flex: 1;
			}
		}

		&.variant-inline-after {
			& label {
				margin-left: 9px;
				margin-right: 0;
			}
		}

		&.variant-collapsible {
			border: 2px solid ${colors.lighter(colors.teal).setAlpha(0.5)};
			border-radius: 3px;

			&.collapsed {
				width: 50%;

				& > label {
					color: ${colors.superWhite};

					&:before {
						content: "" !important;
						opacity: 1;
						color: ${colors.lightest(colors.blue)};
					}
				}

				& > *:not(label) {
					display: none !important;
				}
			}

			& > label {
				cursor: pointer;

				&:before {
					${fonts.fontAwesomeSolid}

					content: "";
					opacity: 0.5;
					font-size: 14px;
					padding-right: 6px;
					color: ${colors.white};

					transition: opacity 0.8s, color 1s;
				}
			}
		}

		& > *:not(label):not(.tooltip) {
			margin-top: 6px;
		}
	`,
);

const variant_enum = Object.freeze(['overlay', 'collapsible', 'inline', 'inline-after', 'simple']);

const defaultOptions = { variant: 'simple' };

/**
 * Label component with multiple display variants and input association.
 *
 * Provides flexible label styling with support for overlay, collapsible, inline, and simple variants.
 * Automatically associates with input components and supports interactive collapsible behavior.
 * @param {object|string} [options={}] - Label configuration options, or label text string
 * @param {('overlay'|'collapsible'|'inline'|'inline-after'|'simple')} [options.variant='simple'] - Label display variant
 * @param {string|object} [options.label] - Label text content or label component options
 * @param {Component|string} [options.for] - Input component or ID to associate label with
 * @param {boolean} [options.collapsed] - Whether collapsible variant starts collapsed
 * @param {string} [options.tooltip] - Tooltip text for the label
 * @param {...(Component|HTMLElement|string)} children - Child elements, typically input components
 * @returns {Label} Label component instance
 */
class Label extends StyledLabel {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	variant_enum = variant_enum;

	constructor(options = {}, ...children) {
		if (typeof options === 'string') options = { label: options };

		super(
			{
				...(children.length > 0 && { for: children[0] }),
				...defaultOptions,
				...options,
			},
			...children,
		);
	}

	build() {
		this._labelText = new Component({ tag: 'label' });

		const handleClick = () => {
			if (this.options.variant !== 'collapsible') return;
			const nowCollapsed = !this.hasClass('collapsed');
			this[nowCollapsed ? 'addClass' : 'removeClass']('collapsed');
			this._labelText.elem.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
		};

		this._labelText.elem.addEventListener('click', handleClick);
		this.addCleanup('labelClick', () => this._labelText.elem.removeEventListener('click', handleClick));

		if (this.options.variant === 'collapsible') {
			this._labelText.elem.setAttribute('aria-expanded', this.options.collapsed ? 'false' : 'true');
		}

		this[this.options.variant === 'inline-after' ? 'append' : 'prepend'](this._labelText);
	}

	static handlers = {
		label(value) {
			if (typeof value === 'object') this._labelText?.setOptions(value);
			else if (this._labelText) this._labelText.options.content = value;
		},
		collapsed(value) {
			this[value ? 'addClass' : 'removeClass']('collapsed');
			if (this.options.variant === 'collapsible' && this._labelText) {
				this._labelText.elem.setAttribute('aria-expanded', value ? 'false' : 'true');
			}
		},
		variant(value) {
			this.removeClass(/\bvariant-\S+\b/g);
			this.addClass(`variant-${value}`);

			if (this._labelText) {
				const shouldBeAfter = value === 'inline-after';
				const isAfter = this._labelText.elem === this.elem.lastElementChild;
				if (shouldBeAfter !== isAfter) this[shouldBeAfter ? 'append' : 'prepend'](this._labelText);
				if (value === 'collapsible') {
					this._labelText.elem.setAttribute('aria-expanded', this.hasClass('collapsed') ? 'false' : 'true');
				}
			}
		},
		for(value) {
			let forId = typeof value === 'string' ? value : value?.id || value?.elem?.id;

			if (!forId && value?._component) {
				forId = value.elem.id = value.uniqueId;
			}

			if (this._labelText) this._labelText.elem.htmlFor = forId ?? '';
		},
	};
}

export default Label;
