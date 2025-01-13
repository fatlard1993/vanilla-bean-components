import { TooltipWrapper } from '../TooltipWrapper';

const defaultOptions = { tag: 'button' };

export default class Button extends TooltipWrapper {
	defaultOptions = { ...super.defaultOptions, ...defaultOptions };

	constructor(options = {}, ...children) {
		super(
			{
				...defaultOptions,
				...options,
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
