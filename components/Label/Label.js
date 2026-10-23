import { styled } from '../../styled';
import { Component } from '../../Component';
import { TooltipWrapper } from '../TooltipWrapper';
import { radius, space } from '../../theme/tokens';

const StyledLabel = styled(
	TooltipWrapper,
	({ colors, fonts }) => `
		position: relative;
		display: inline-block;
		font-size: 1em;
		width: calc(100% - 24px);
		margin: 0 0 ${space.sm};
		padding: ${space.sm} ${space.md};
		background-color: ${colors.raised};
		color: ${colors.white};
		transition: all 0.5s;

		&:after {
			transition: all 0.5s;
		}

		/* Its own label, not one inside what it holds (a RadioButton's options are labels too) */
		& > label {
			display: block;
			margin: 0;
			color: ${colors.white};
			padding-left: ${space.xs};
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
				color: ${colors.muted};
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
				margin-right: ${space.md};
				line-height: 2;
			}

			& input:not([type=checkbox]), & textarea, & select {
				flex: 1;
			}
		}

		/* Drawn after its control even when the control was appended after the text was placed */
		&.variant-inline-after {
			& > .label-text {
				order: 1;
			}

			& label {
				margin-left: ${space.md};
				margin-right: 0;
			}
		}

		&.variant-collapsible {
			border: 2px solid ${colors.lighter(colors.teal).setAlpha(0.5)};
			border-radius: ${radius.sm};

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
					padding-right: ${space.sm};
					color: ${colors.white};

					transition: opacity 0.8s, color 1s;
				}
			}
		}

		& > *:not(label):not(.tooltip) {
			margin-top: ${space.sm};
		}
	`,
);

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
	static schema = {
		variant: {
			default: 'simple',
			enum: ['overlay', 'collapsible', 'inline', 'inline-after', 'simple'],
			set(value) {
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
		},
		label: {
			set(value) {
				if (typeof value === 'object') this._labelText?.setOptions(value);
				else if (this._labelText) this._labelText.options.content = value;
			},
		},
		collapsed: {
			set(value) {
				this[value ? 'addClass' : 'removeClass']('collapsed');
				if (this.options.variant === 'collapsible' && this._labelText) {
					this._labelText.elem.setAttribute('aria-expanded', value ? 'false' : 'true');
				}
			},
		},
		for: {
			set(value) {
				let forId = typeof value === 'string' ? value : value?.id || value?.elem?.id;

				if (!forId) {
					// Two shapes reach here: a component, which carries `elem` and `uniqueId`, and a raw
					// element, which carries a `_component` backreference. The guard tested for the element
					// shape while the body used the component shape, so neither worked -- a component
					// produced an empty `for` and an element threw on `value.elem.id`. A label that looks
					// associated but is not is worse than one that never claimed to be.
					const component = value?.uniqueId ? value : value?._component;
					const elem = value?.elem ?? (value?._component ? value : undefined);

					if (component && elem) forId = elem.id = component.uniqueId;
				}

				if (this._labelText) this._labelText.elem.htmlFor = forId ?? '';
			},
		},
	};

	static prepareOptions(options, children) {
		return {
			...(children.length > 0 && { for: children[0] }),
			...options,
		};
	}

	constructor(options = {}, ...children) {
		// String shorthand must resolve before Component spreads options
		super(typeof options === 'string' ? { label: options } : options, ...children);
	}

	build() {
		this._labelText = new Component({ tag: 'label', addClass: 'label-text' });

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
}

export default Label;
