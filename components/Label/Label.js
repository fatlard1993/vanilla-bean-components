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
		super(
			{
				...options,
				styles: theme => `
				position: relative;
				display: block;
				font-size: 1em;
				width: 95%;
				margin: 0 auto 12px;
				padding: 3px 12px 12px;
				border-left: 3px solid ${theme.colors.lightest(theme.colors.gray)};
				background-color: ${theme.colors.darkest(theme.colors.gray)};

				&.collapsed {
					height: 32px;
				}

				${options.styles?.(theme) || ''}
			`,
			},
			...children,
		);
	}

	render(options = this.options) {
		this._labelText = new LabelText({
			tag: 'label',
			prependTo: this,
			onPointerPress: () => this[this.hasClass('collapsed') ? 'removeClass' : 'addClass']('collapsed'),
		});

		super.render(options);
	}

	setOption(name, value) {
		if (name === 'label' || name === 'for') {
			if (name === 'label') this._labelText.setOption('content', value);
			else if (name === 'for') this._labelText.elem.htmlFor = value;
		} else super.setOption(name, value);
	}
}

export default Label;
