/* eslint-disable spellcheck/spell-checker */
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

		label {
			display: block;
			margin: 0;
			color: ${colors.white};
		}

		&.variant-overlay {
			label {
				position: relative;
				z-index: 1;
				transform: translate(0, 0);
				transition: transform 0.5s, color 0.5s;
			}

			input {
				transform: translate(0, 0);
				transition: transform 0.5s;
			}
		}

		&.variant-overlay:not(:focus-within):has(input:placeholder-shown) {
			label {
				pointer-events: none;
				color: ${colors.gray};
				transform: translate(12px, 20px);
			}

			input {
				transform: translate(0, -12px);
			}
		}

		&.variant-inline, &.variant-inline-after {
			display: flex;

			label {
				display: inline-block;
				vertical-align: top;
				margin-top: 5px;
				margin-right: 9px;
				line-height: 2;
			}

			input:not([type=checkbox]), textarea, select {
				flex: 1;
			}
		}

		&.variant-inline-after {
			label {
				margin-left: 9px;
				margin-right: 0;
			}
		}

		&.variant-collapsible {
			--aug-border-bg: linear-gradient(-66deg, ${colors.lighter(colors.teal).setAlpha(0.5)}, ${colors.blue.setAlpha(0.5)});
			--aug-border-all: 2px;
			--aug-tl1: 12px;
			--aug-tr-extend1: 42%;
			--aug-tr1: 12px;
			--aug-bl1: 6px;
			--aug-br1: 6px;

			&.collapsed {
				width: 50%;

				--aug-tr-extend1: 0%;

				> label {
					color: ${colors.superWhite};

					&:before {
						content: "" !important;
						opacity: 1;
						color: ${colors.lightest(colors.blue)};
					}
				}

				> *:not(label) {
					display: none !important;
				}
			}

			> label {
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

		> *:not(label):not(.tooltip) {
			margin-top: 6px;
		}
	`,
);

const variant_enum = Object.freeze(['overlay', 'collapsible', 'inline', 'inline-after', 'simple']);

const defaultOptions = { variant: 'simple' };

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

	render() {
		this._labelText = new Component({
			tag: 'label',
			[this.options.variant === 'inline-after' ? 'appendTo' : 'prependTo']: this,
			onPointerPress: () => {
				if (this.options.variant === 'collapsible') {
					this[this.hasClass('collapsed') ? 'removeClass' : 'addClass']('collapsed');
				}
			},
		});

		super.render();
	}

	_setOption(key, value) {
		if (key === 'label') {
			if (typeof value === 'object') this._labelText.setOptions(value);
			else this._labelText.options.content = value;
		} else if (key === 'collapsed') this[value ? 'addClass' : 'removeClass']('collapsed');
		else if (key === 'variant') {
			this.removeClass(/\bvariant-\S+\b/g);
			this.addClass(`variant-${value}`);

			this.options.augmentedUI = value === 'collapsible' ? 'tl-clip tr-2-clip-x br-clip bl-clip border' : false;

			this[this.options.variant === 'inline-after' ? 'append' : 'prepend'](this._labelText);
		} else if (key === 'for') {
			let forId = typeof value === 'string' ? value : value?.id || value?.elem?.id;

			if (!forId && value?._component) {
				forId = value.elem.id = value.uniqueId;
			}

			this._labelText.elem.htmlFor = forId;
		} else super._setOption(key, value);
	}
}

export default Label;
