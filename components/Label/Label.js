/* eslint-disable spellcheck/spell-checker */
import { styled } from '../../styled';
import { Component } from '../../Component';
import { TooltipWrapper } from '../TooltipWrapper';

const StyledComponent = styled(
	TooltipWrapper,
	({ colors, fonts }) => `
		position: relative;
		display: inline-block;
		font-size: 1em;
		width: calc(100% - 24px);
		margin: 0 0 9px;
		padding: 6px 12px 9px 12px;
		background-color: ${colors.white.setAlpha(0.06)};
		color: ${colors.white};
		transition: all 0.5s;

		&:after {
			transition: all 0.5s;
		}

		label {
			display: block;
		}

		&.variant-overlay:not(:focus-within):has(input:placeholder-shown) {
			label {
				pointer-events: none;
				position: absolute;
				top: 15px;
				left: 20px;
				color: ${colors.gray};
			}
		}

		&.variant-inline, &.variant-inline-after {
			display: flex;

			label {
				display: inline-block;
				vertical-align: top;
				margin-top: 3px;
				margin-right: 9px;
				line-height: 2;
			}

			input:not([type=checkbox]), textarea, select {
				flex: 1;
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

			label {
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

class Label extends StyledComponent {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };
	variant_enum = variant_enum;

	constructor(options = {}, ...children) {
		if (typeof options === 'string') options = { label: options };

		super(
			{
				for: children[0],
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
			styles: ({ colors }) => ({
				display: 'block',
				color: colors.white,
				margin: 0,
			}),
			onPointerPress: () => {
				if (this.options.variant === 'collapsible') {
					this[this.hasClass('collapsed') ? 'removeClass' : 'addClass']('collapsed');
				}
			},
		});

		super.render();
	}

	setOption(key, value) {
		if (key === 'label') {
			if (typeof value === 'object') this._labelText.setOptions(value);
			else this._labelText.options.content = value;
		} else if (key === 'collapsed') this[value ? 'addClass' : 'removeClass']('collapsed');
		else if (key === 'variant') {
			this.removeClass(/\bvariant-\S+\b/g);
			this.addClass(`variant-${value}`);

			this.elem.setAttribute(
				'data-augmented-ui',
				value === 'collapsible' ? 'tl-clip tr-2-clip-x br-clip bl-clip border' : '',
			);
		} else if (key === 'for') {
			let forId = typeof value === 'string' ? value : value?.id || value?.elem?.id;

			if (!forId && value?._component) {
				forId = value.elem.id = value.classId;
			}

			this._labelText.elem.htmlFor = forId;
		} else super.setOption(key, value);
	}
}

export default Label;
