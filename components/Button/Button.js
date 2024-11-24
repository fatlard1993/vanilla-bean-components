import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'button' };

class Button extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				styles: (theme, domElem) => `
					${theme.button}

					${options.styles?.(theme, domElem) || ''}
				`,
				onKeyUp: event => {
					if (event.code === 'Space' || event.code === 'Enter') {
						this.options.onPointerPress(event);
					}
				},
			},
			...children,
		);
	}
}

export default Button;
