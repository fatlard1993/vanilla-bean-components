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
					display: block;
					font-size: 1em;
					width: 95%;
					margin: 0 auto 12px;
					padding: 12px;
					border-left: 3px solid ${theme.colors.light(theme.colors.gray)};
					background-color: ${theme.colors.darkest(theme.colors.gray)};
					color: ${theme.colors.white};

					> *:not(label):not(.tooltip) {
						margin-top: 12px;
					}

					&.collapsed {
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
		if (name === 'label') this._labelText.setOption('content', value);
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
