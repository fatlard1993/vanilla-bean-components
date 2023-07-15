import { TooltipSupport } from '../TooltipSupport';

const defaultOptions = { tag: 'button' };

class Button extends TooltipSupport {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}) {
		super({
			...defaultOptions,
			...options,
			styles: theme => `
				${theme.button}

				${options.styles?.(theme) || ''}
			`,
		});
	}
}

export default Button;
