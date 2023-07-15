import { styled } from '../../utils';
import { TooltipSupport } from '../TooltipSupport';
import { DomElem } from '../DomElem';

const LabelText = styled(
	DomElem,
	theme => `
		display: block;
		margin: 12px 0;
		color: ${theme.colors.white};
	`,
);

class Label extends TooltipSupport {
	constructor(options = {}) {
		super({
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

				${options.styles?.(theme) || ''}
			`,
		});

		this._labelText = new LabelText({ tag: 'label', prependTo: this.elem });
	}

	setOption(name, value) {
		if (name === 'label') this._labelText.setOption('content', value);
		else if (name === 'for') this._labelText.setOption(name, value);
		else super.setOption(name, value);
	}
}

export default Label;
