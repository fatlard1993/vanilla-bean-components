/* eslint-disable spellcheck/spell-checker */
import { styled } from '../../utils';
import { DomElem } from '../DomElem';
import { TooltipWrapper } from '../TooltipWrapper';

const LabelText = styled(
	DomElem,
	theme => `
		display: block;
		margin: 12px 0;
		color: ${theme.colors.white};
	`,
);

class Label extends TooltipWrapper {
	constructor(options = {}, ...children) {
		if (typeof options === 'string') options = { label: options };

		super(
			{
				for: children[0],
				...options,
				styles: (theme, domElem) => `
					position: relative;
					display: inline-block;
					font-size: 1em;
					width: 95%;
					margin: 0 1.5% 12px;
					padding: 12px;
					background-color: ${theme.colors.white.setAlpha(0.06)};
					color: ${theme.colors.white};
					transition: all 0.5s;

					&:after {
						transition: all 0.5s;
					}

					--aug-border-bg: linear-gradient(-66deg, ${theme.colors
						.lighter(theme.colors.teal)
						.setAlpha(0.5)}, ${theme.colors.blue.setAlpha(0.5)});
					--aug-border-all: 2px;
					--aug-tl1: 12px;
					--aug-tr-extend1: 42%;
					--aug-tr1: 12px;
					--aug-bl1: 6px;
					--aug-br1: 6px;

					> *:not(label):not(.tooltip) {
						margin-top: 12px;
					}

					&.collapsed {
						width: 54%;

						--aug-tr-extend1: 0%;

						> label {
							color: ${theme.colors.superWhite};

							&:before {
								content: "" !important;
								opacity: 1;
								color: ${theme.colors.lightest(theme.colors.blue)};
							}
						}

						> *:not(label) {
							display: none !important;
						}
					}

					${options.styles?.(theme, domElem) || ''}
				`,
			},
			...children,
		);

		// eslint-disable-next-line spellcheck/spell-checker
		this.elem.setAttribute('data-augmented-ui', 'tl-clip tr-2-clip-x br-clip bl-clip border');
	}

	render(options = this.options) {
		this._labelText = new LabelText({
			tag: 'label',
			prependTo: this,
			styles: theme => `
				cursor: pointer;
				margin: 0;

				&:before {
					${theme.fonts.fontAwesomeSolid}

					content: "";
					opacity: 0.5;
					font-size: 14px;
					padding-right: 6px;
					color: ${theme.colors.white};

					transition: opacity 0.8s, color 1s;
				}
			`,
			onPointerPress: () => this[this.hasClass('collapsed') ? 'removeClass' : 'addClass']('collapsed'),
		});

		super.render(options);
	}

	setOption(name, value) {
		if (name === 'label') this._labelText.options.content = value;
		else if (name === 'collapsed') this[value ? 'addClass' : 'removeClass']('collapsed');
		else if (name === 'for') {
			let forId = typeof value === 'string' ? value : value?.id || value?.elem?.id;

			if (!forId && value?.isDomElem) {
				forId = value.elem.id = value.classId;
			}

			this._labelText.elem.htmlFor = forId;
		} else super.setOption(name, value);
	}
}

export default Label;
