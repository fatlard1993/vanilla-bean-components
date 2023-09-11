import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'button' };

class Button extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
				styles: theme => `
				${theme.button}

				${options.styles?.(theme) || ''}
			`,
			},
			...children,
		);
	}
}

export default Button;
