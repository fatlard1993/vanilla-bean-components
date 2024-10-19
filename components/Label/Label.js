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

const defaultOptions = { collapsible: false };

class Label extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		if (typeof options === 'string') options = { label: options };

		super(
			{
				for: children[0],
				...defaultOptions,
				...options,
				styles: (theme, domElem) => `
					position: relative;
					display: inline-block;
					font-size: 1em;
					width: calc(100% - 24px);
					margin: 0 0 9px;
					padding: 6px 12px 9px 12px;
					background-color: ${theme.colors.white.setAlpha(0.06)};
					color: ${theme.colors.white};
					transition: all 0.5s;

					&:after {
						transition: all 0.5s;
					}

					${
						domElem.options.inline
							? `
								label {
									display: inline-block;
									vertical-align: top;
									margin-top: 3px;
								}
							`
							: `
								--aug-border-bg: linear-gradient(-66deg, ${theme.colors
									.lighter(theme.colors.teal)
									.setAlpha(0.5)}, ${theme.colors.blue.setAlpha(0.5)});
								--aug-border-all: 2px;
								--aug-tl1: 12px;
								--aug-tr-extend1: 42%;
								--aug-tr1: 12px;
								--aug-bl1: 6px;
								--aug-br1: 6px;
							`
					}


					> *:not(label):not(.tooltip) {
						margin-top: 6px;
					}

					&.collapsed {
						width: 50%;

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

		if (!options.inline) this.elem.setAttribute('data-augmented-ui', 'tl-clip tr-2-clip-x br-clip bl-clip border');
	}

	render() {
		this._labelText = new LabelText({
			tag: 'label',
			prependTo: this,
			styles: theme => `
				margin: 0;

				${
					this.options.collapsible
						? `
							cursor: pointer;

							&:before {
								${theme.fonts.fontAwesomeSolid}

								content: "";
								opacity: 0.5;
								font-size: 14px;
								padding-right: 6px;
								color: ${theme.colors.white};

								transition: opacity 0.8s, color 1s;
							}
						`
						: 'margin-left: 6px;'
				}
			`,
			onPointerPress: this.options.collapsible
				? () => this[this.hasClass('collapsed') ? 'removeClass' : 'addClass']('collapsed')
				: undefined,
		});

		super.render();

		if (this.options.inline?.after) this._labelText.appendTo(this);
	}

	setOption(key, value) {
		if (key === 'label') this._labelText.options.content = value;
		else if (key === 'collapsed') this[value ? 'addClass' : 'removeClass']('collapsed');
		else if (key === 'for') {
			let forId = typeof value === 'string' ? value : value?.id || value?.elem?.id;

			if (!forId && value?.isDomElem) {
				forId = value.elem.id = value.classId;
			}

			this._labelText.elem.htmlFor = forId;
		} else super.setOption(key, value);
	}
}

export default Label;
